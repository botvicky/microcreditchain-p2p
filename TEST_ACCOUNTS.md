# ShamwariPay Test Accounts

This document contains test credentials for development and testing purposes.

## 🔐 Test Credentials

### Admin Account
- **Email:** `admin@shamwaripay.com`
- **Password:** `admin123`
- **Name:** Admin User
- **Role:** Admin
- **Features:**
  - User Management (freeze/unfreeze accounts)
  - System Analytics Dashboard
  - Boost User Ratings
  - Send System Notifications
  - View All Users and Loans

### Lender Account
- **Email:** `lender@shamwaripay.com`
- **Password:** `lender123`
- **Name:** John Lender
- **Role:** Lender
- **Features:**
  - Create Loan Offers
  - Review Loan Applications
  - Approve/Reject Applications
  - View AI Credit Analysis
  - Track Earnings and Commission

### Borrower Account
- **Email:** `borrower@shamwaripay.com`
- **Password:** `borrower123`
- **Name:** Jane Borrower
- **Role:** Borrower
- **Features:**
  - Browse Available Loan Offers
  - Apply for Loans
  - Upload EcoCash Statements
  - Track Application Status
  - View Notifications

## 🚀 Quick Login (Development Mode Only)

When running the app in development mode, you'll see a **🔧 Dev Login** button in the top-right corner of the login screen. 

**How to use:**
1. Open the app in development mode
2. Click the **🔧 Dev Login** button
3. Select an account (Admin, Lender, or Borrower)
4. The credentials will auto-fill
5. Click "Sign In"

## 📝 Using These Accounts

### For Backend Testing
If you have a backend server running, make sure to seed these accounts in your backend database:

```bash
# Example seeding commands (adjust based on your backend)
POST /auth/signup
{
  "email": "admin@shamwaripay.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin",
  "phone": "+263771234567",
  "idNumber": "ADM001"
}
```

### For Mobile App Testing

1. **Testing Admin Features:**
   - Login with admin credentials
   - Access user management
   - View analytics dashboard
   - Freeze/unfreeze test accounts

2. **Testing Lender Features:**
   - Login with lender credentials
   - Create a loan offer
   - Review applications (if borrower applied)
   - Approve/reject applications

3. **Testing Borrower Features:**
   - Login with borrower credentials
   - Browse loan offers
   - Apply for a loan
   - Upload test PDF statement
   - Check notifications

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- These credentials are for **DEVELOPMENT AND TESTING ONLY**
- Never use these in production
- The Dev Login Helper only appears when `__DEV__` is true
- It will not show in production builds

## 📦 Sample Data Included

The app includes sample seed data for:
- Test loan offers (4 pre-configured offers)
- Sample notifications
- User profiles with ratings

## 🧪 Testing Workflows

### Complete Loan Flow
1. Login as **Lender** → Create a loan offer
2. Login as **Borrower** → Browse and apply for the loan
3. Login as **Lender** → Review and approve the application
4. Login as **Admin** → View analytics and system data

### User Management Flow
1. Login as **Admin** → Go to User Management
2. Search for users
3. Freeze/unfreeze accounts
4. Boost user ratings

## 📞 Backend Integration

For these accounts to work properly, your backend needs to:
1. Support the signup endpoints for creating these users
2. Implement JWT authentication
3. Handle role-based access control
4. Return user data in the expected format

## 🔄 Resetting Test Data

If you need to reset or recreate test accounts:
1. Clear the backend database
2. Re-run the seed scripts
3. Or manually create accounts using the signup endpoints

---

**Last Updated:** November 4, 2025
