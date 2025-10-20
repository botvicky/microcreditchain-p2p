import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from './email';
import { analyzeStatement } from './ai-integration';

admin.initializeApp();

// Initialize FCM
const messaging = admin.messaging();

// Triggered when a PDF statement is uploaded
export const onStatementUpload = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const bucket = admin.storage().bucket();
  
  if (!filePath || !filePath.includes('statements/')) {
    return null;
  }

  try {
    // Download the file
    const [file] = await bucket.file(filePath).download();
    
    // Send to AI service for analysis
    const aiResult = await analyzeStatement(file);
    
    // Extract application ID from file path
    const pathParts = filePath.split('/');
    const applicationId = pathParts[pathParts.length - 2];
    
    // Save AI analysis to Firestore
    await admin.firestore()
      .collection('loanApplications')
      .doc(applicationId)
      .update({
        aiSummary: aiResult,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    // Send notification to lender
    const application = await admin.firestore()
      .collection('loanApplications')
      .doc(applicationId)
      .get();
    
    if (application.exists) {
      const appData = application.data();
      const lenderId = appData?.lenderId;
      
      if (lenderId) {
        await sendNotification(lenderId, {
          title: 'New Loan Application Analyzed',
          message: `AI analysis completed for loan application. Credit score: ${aiResult.score}`,
          type: 'loan_application'
        });
      }
    }
    
    console.log('Statement analysis completed for:', filePath);
  } catch (error) {
    console.error('Error processing statement:', error);
  }
});

// Triggered when a loan application is approved
export const onLoanApproved = functions.firestore
  .document('loanApplications/{applicationId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== 'approved' && after.status === 'approved') {
      const applicationId = context.params.applicationId;
      
      try {
        // Create loan contract
        const contractData = {
          id: `contract_${applicationId}`,
          applicationId,
          borrowerId: after.borrowerId,
          lenderId: after.lenderId,
          amount: after.amount,
          interestRate: after.interestRate,
          duration: after.duration,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        };
        
        await admin.firestore()
          .collection('contracts')
          .doc(contractData.id)
          .set(contractData);
        
        // Send notifications
        await sendNotification(after.borrowerId, {
          title: 'Loan Approved!',
          message: 'Your loan application has been approved. Contract generated.',
          type: 'loan_approval'
        });
        
        await sendNotification(after.lenderId, {
          title: 'Loan Contract Generated',
          message: 'Contract has been generated for the approved loan.',
          type: 'contract_generated'
        });
        
        console.log('Loan approved and contract created:', applicationId);
      } catch (error) {
        console.error('Error processing loan approval:', error);
      }
    }
  });

// Triggered when a repayment is made
export const onRepaymentMade = functions.firestore
  .document('repayments/{repaymentId}')
  .onCreate(async (snapshot, context) => {
    const repayment = snapshot.data();
    
    try {
      // Update loan balance
      const loanRef = admin.firestore()
        .collection('loans')
        .doc(repayment.loanId);
      
      await loanRef.update({
        paidAmount: admin.firestore.FieldValue.increment(repayment.amount),
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Check if loan is fully paid
      const loan = await loanRef.get();
      const loanData = loan.data();
      
      if (loanData && loanData.paidAmount >= loanData.totalAmount) {
        // Loan is fully paid, calculate commission
        await calculateCommission(loanData);
        
        // Mark loan as settled
        await loanRef.update({
          status: 'settled',
          settledAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      console.log('Repayment processed:', context.params.repaymentId);
    } catch (error) {
      console.error('Error processing repayment:', error);
    }
  });

// Calculate commission when loan is settled
async function calculateCommission(loanData: any) {
  const profit = loanData.paidAmount - loanData.principal;
  const commission = profit * 0.15; // 15% commission
  
  const commissionRecord = {
    lenderId: loanData.lenderId,
    loanId: loanData.id,
    profit,
    commission,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await admin.firestore()
    .collection('revenues')
    .doc(loanData.lenderId)
    .collection('commissionRecords')
    .add(commissionRecord);
  
  // Send notification to lender about commission
  await sendNotification(loanData.lenderId, {
    title: 'Commission Calculated',
    message: `Commission of $${commission.toFixed(2)} calculated for loan settlement.`,
    type: 'commission'
  });
}

// Send push notification
async function sendNotification(userId: string, notification: any) {
  try {
    // Get user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (userData?.fcmToken) {
      const message = {
        token: userData.fcmToken,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          userId: userId
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#0052CC'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      
      await messaging.send(message);
      console.log('Push notification sent to user:', userId);
    }
    
    // Save notification to Firestore
    await admin.firestore().collection('notifications').add({
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Notification saved to Firestore for user:', userId);
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Admin function to freeze/unfreeze accounts
export const freezeAccount = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  const { userId, status } = data;
  
  try {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        status: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    // Send notification to user
    await sendNotification(userId, {
      title: status === 'frozen' ? 'Account Frozen' : 'Account Unfrozen',
      message: status === 'frozen' 
        ? 'Your account has been frozen. Contact support for assistance.'
        : 'Your account has been unfrozen. You can now use the platform.',
      type: 'account_status'
    });
    
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error updating account status');
  }
});

// Admin function to get analytics
export const getAnalytics = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  try {
    const [usersSnapshot, loansSnapshot, revenuesSnapshot] = await Promise.all([
      admin.firestore().collection('users').get(),
      admin.firestore().collection('loans').get(),
      admin.firestore().collection('revenues').get()
    ]);
    
    const totalUsers = usersSnapshot.size;
    const activeBorrowers = usersSnapshot.docs.filter(doc => 
      doc.data().role === 'borrower' && doc.data().status === 'active'
    ).length;
    const activeLenders = usersSnapshot.docs.filter(doc => 
      doc.data().role === 'lender' && doc.data().status === 'active'
    ).length;
    
    const totalLoans = loansSnapshot.size;
    const activeLoans = loansSnapshot.docs.filter(doc => 
      doc.data().status === 'active'
    ).length;
    
    let totalRevenue = 0;
    revenuesSnapshot.docs.forEach(doc => {
      const records = doc.data();
      Object.values(records).forEach((record: any) => {
        if (record.commission) {
          totalRevenue += record.commission;
        }
      });
    });
    
    return {
      totalUsers,
      activeBorrowers,
      activeLenders,
      totalLoans,
      activeLoans,
      totalRevenue
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching analytics');
  }
});

// Send system-wide notification
export const sendSystemNotification = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  const { title, message } = data;
  
  try {
    // Get all users
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    // Send notification to each user
    const promises = usersSnapshot.docs.map(userDoc => 
      sendNotification(userDoc.id, {
        title,
        message,
        type: 'system'
      })
    );
    
    await Promise.all(promises);
    
    return { success: true, message: 'System notification sent to all users' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error sending system notification');
  }
});

// Update user FCM token
export const updateFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { fcmToken } = data;
  const userId = context.auth.uid;
  
  try {
    await admin.firestore().collection('users').doc(userId).update({
      fcmToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error updating FCM token');
  }
});

// Triggered when a user's status changes
export const onUserStatusChange = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      const userId = context.params.userId;
      
      // Send notification about status change
      await sendNotification(userId, {
        title: after.status === 'frozen' ? 'Account Frozen' : 'Account Unfrozen',
        message: after.status === 'frozen' 
          ? 'Your account has been frozen. Contact support for assistance.'
          : 'Your account has been unfrozen. You can now use the platform.',
        type: 'account_status'
      });
    }
  });
