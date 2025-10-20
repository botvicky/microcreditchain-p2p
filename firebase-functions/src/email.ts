import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendLoanApprovalEmail(borrowerEmail: string, borrowerName: string, loanAmount: number) {
  const subject = 'Loan Application Approved - MicroCreditChain P2P';
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0052CC, #FFD700); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MicroCreditChain P2P</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #0052CC; font-family: Poppins, sans-serif;">Congratulations ${borrowerName}!</h2>
        
        <p>Your loan application has been <strong style="color: #00B894;">approved</strong>!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00B894;">
          <h3 style="color: #2C2C2C; margin-top: 0;">Loan Details</h3>
          <p><strong>Amount:</strong> $${loanAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> <span style="color: #00B894;">Approved</span></p>
        </div>
        
        <p>Your loan contract has been generated and is available in your dashboard.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #0052CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Contract</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
      
      <div style="background: #2C2C2C; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2025 MicroCreditChain P2P. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(borrowerEmail, subject, html);
}

export async function sendRepaymentReminderEmail(borrowerEmail: string, borrowerName: string, amount: number, dueDate: string) {
  const subject = 'Repayment Reminder - MicroCreditChain P2P';
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0052CC, #FFD700); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MicroCreditChain P2P</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #0052CC; font-family: Poppins, sans-serif;">Repayment Reminder</h2>
        
        <p>Hello ${borrowerName},</p>
        
        <p>This is a friendly reminder that you have a repayment due soon.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700;">
          <h3 style="color: #2C2C2C; margin-top: 0;">Repayment Details</h3>
          <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        
        <p>Please ensure you have sufficient funds in your EcoCash account for automatic deduction.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #0052CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Make Payment</a>
        </div>
      </div>
      
      <div style="background: #2C2C2C; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2024 MicroCreditChain P2P. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(borrowerEmail, subject, html);
}
