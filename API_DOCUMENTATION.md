# MicroCreditChain P2P - API Documentation

## 🔗 Base URLs

- **Firebase Functions**: `https://us-central1-your-project.cloudfunctions.net`
- **AI Service**: `https://ml.microcreditchain.ai`
- **Firebase Auth**: `https://identitytoolkit.googleapis.com`
- **Firestore**: `https://firestore.googleapis.com`

## 🔐 Authentication

All API calls require Firebase Authentication token in the Authorization header:

```
Authorization: Bearer <firebase-auth-token>
```

## 📱 Mobile App APIs

### Authentication

#### Sign Up
```typescript
POST /auth/signup
Body: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'borrower' | 'lender' | 'admin';
  idNumber?: string;
}
```

#### Sign In
```typescript
POST /auth/signin
Body: {
  email: string;
  password: string;
}
```

#### Sign Out
```typescript
POST /auth/signout
```

### User Management

#### Get Current User
```typescript
GET /users/me
Response: User
```

#### Update User Profile
```typescript
PUT /users/me
Body: Partial<User>
```

## 💰 Loan Management

### Loan Offers

#### Create Loan Offer
```typescript
POST /loan-offers
Body: {
  amount: number;
  interestRate: number;
  duration: string;
  conditions: string;
}
```

#### Get Active Loan Offers
```typescript
GET /loan-offers?status=active
Response: LoanOffer[]
```

#### Get My Offers (Lender)
```typescript
GET /loan-offers/my
Response: LoanOffer[]
```

### Loan Applications

#### Apply for Loan
```typescript
POST /loan-applications
Body: {
  offerId: string;
  statementUrl: string;
  additionalInfo?: string;
}
```

#### Get My Applications (Borrower)
```typescript
GET /loan-applications/my
Response: LoanApplication[]
```

#### Get Applications for My Offers (Lender)
```typescript
GET /loan-applications/lender
Response: LoanApplication[]
```

#### Approve/Reject Application
```typescript
PUT /loan-applications/{id}
Body: {
  status: 'approved' | 'rejected';
}
```

### AI Analysis

#### Analyze Statement
```typescript
POST /ai/analyze-pdf
Body: FormData with PDF file
Response: {
  success: boolean;
  data: {
    avg_balance: number;
    inflows: number;
    outflows: number;
    transaction_frequency: number;
    score: number;
    risk_level: 'Low' | 'Medium' | 'High';
  };
}
```

## 🔔 Notifications

#### Get User Notifications
```typescript
GET /notifications
Response: Notification[]
```

#### Mark Notification as Read
```typescript
PUT /notifications/{id}/read
```

#### Get Unread Count
```typescript
GET /notifications/unread-count
Response: { count: number }
```

## 👨‍💼 Admin APIs

### User Management

#### Get All Users
```typescript
GET /admin/users?limit=50&offset=0
Response: User[]
```

#### Get Users by Role
```typescript
GET /admin/users?role=borrower
Response: User[]
```

#### Freeze/Unfreeze User
```typescript
PUT /admin/users/{id}/status
Body: {
  status: 'active' | 'frozen';
}
```

#### Boost User Rating
```typescript
PUT /admin/users/{id}/rating
Body: {
  rating: number;
}
```

### Analytics

#### Get System Analytics
```typescript
GET /admin/analytics
Response: {
  totalUsers: number;
  activeBorrowers: number;
  activeLenders: number;
  totalLoans: number;
  activeLoans: number;
  totalRevenue: number;
}
```

#### Send System Notification
```typescript
POST /admin/notifications/system
Body: {
  title: string;
  message: string;
}
```

## 🔄 Firebase Cloud Functions

### Triggers

#### onStatementUpload
- **Trigger**: PDF uploaded to Storage
- **Action**: Send to AI service, save analysis
- **Path**: `statements/{applicationId}/statement.pdf`

#### onLoanApproved
- **Trigger**: Loan application status changed to 'approved'
- **Action**: Create contract, send notifications
- **Collection**: `loanApplications`

#### onRepaymentMade
- **Trigger**: New repayment created
- **Action**: Update loan balance, calculate commission
- **Collection**: `repayments`

### Callable Functions

#### freezeAccount
```typescript
const freezeAccount = httpsCallable(functions, 'freezeAccount');
await freezeAccount({ userId: string, status: 'active' | 'frozen' });
```

#### getAnalytics
```typescript
const getAnalytics = httpsCallable(functions, 'getAnalytics');
const analytics = await getAnalytics();
```

## 🤖 AI Service APIs

### Analyze PDF
```typescript
POST /analyze-pdf
Content-Type: multipart/form-data
Body: FormData with PDF file
Response: {
  success: boolean;
  data: AIAnalysisResult;
  filename: string;
  transaction_count: number;
}
```

### Analyze Text
```typescript
POST /analyze-text
Body: {
  text: string;
}
Response: {
  success: boolean;
  data: AIAnalysisResult;
  transaction_count: number;
}
```

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'borrower' | 'lender' | 'admin';
  idNumber: string;
  signatureUrl?: string;
  rating: number;
  status: 'active' | 'frozen';
  createdAt: Date;
  updatedAt: Date;
}
```

### LoanOffer
```typescript
interface LoanOffer {
  id: string;
  lenderId: string;
  amount: number;
  interestRate: number;
  duration: string;
  conditions: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### LoanApplication
```typescript
interface LoanApplication {
  id: string;
  borrowerId: string;
  offerId: string;
  statementUrl: string;
  aiSummary?: AISummary;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### AISummary
```typescript
interface AISummary {
  avgBalance: number;
  inflows: number;
  outflows: number;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  transactionFrequency: number;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'loan_approval' | 'loan_rejection' | 'repayment_reminder' | 'account_frozen' | 'system';
  read: boolean;
  createdAt: Date;
}
```

## 🚨 Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Common Error Codes
- `auth/unauthorized`: Authentication required
- `auth/permission-denied`: Insufficient permissions
- `validation/invalid-input`: Invalid request data
- `not-found`: Resource not found
- `internal/server-error`: Internal server error

## 📈 Rate Limits

- **Authentication**: 10 requests/minute per IP
- **API Calls**: 100 requests/minute per user
- **File Uploads**: 5MB max file size
- **AI Analysis**: 1 request/minute per user

## 🔒 Security

### Authentication
- Firebase Auth tokens required
- Tokens expire after 1 hour
- Refresh tokens valid for 30 days

### Authorization
- Role-based access control
- Resource-level permissions
- Admin-only functions protected

### Data Protection
- All data encrypted in transit
- Sensitive data encrypted at rest
- PII data anonymized in logs

## 📞 Support

For API issues:
- Check Firebase Console logs
- Review Cloud Functions logs
- Test with Firebase Emulators
- Contact: api-support@microcreditchain.com
