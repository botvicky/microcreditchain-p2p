/**
 * Seed Data for Development and Testing
 * 
 * These are test accounts you can use to login and test different user roles.
 * 
 * IMPORTANT: These credentials are for DEVELOPMENT ONLY!
 * Never use these in production.
 */

export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@shamwaripay.com',
    password: 'admin123',
    name: 'Admin User',
    phone: '+263771234567',
    role: 'admin' as const,
    idNumber: 'ADM001',
    rating: 100,
    status: 'active' as const,
  },
  lender: {
    email: 'lender@shamwaripay.com',
    password: 'lender123',
    name: 'John Lender',
    phone: '+263771234568',
    role: 'lender' as const,
    idNumber: 'LND001',
    rating: 85,
    status: 'active' as const,
  },
  borrower: {
    email: 'borrower@shamwaripay.com',
    password: 'borrower123',
    name: 'Jane Borrower',
    phone: '+263771234569',
    role: 'borrower' as const,
    idNumber: 'BRW001',
    rating: 75,
    status: 'active' as const,
  },
};

export const SEED_LOAN_OFFERS = [
  {
    id: '1',
    lenderId: 'lender-1',
    amount: 5000,
    interestRate: 15,
    duration: '3 months',
    conditions: 'Weekly repayment schedule. Good credit score required.',
    status: 'active' as const,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    lenderId: 'lender-1',
    amount: 10000,
    interestRate: 12,
    duration: '6 months',
    conditions: 'Monthly repayment. Collateral required for amounts above $5000.',
    status: 'active' as const,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: '3',
    lenderId: 'lender-2',
    amount: 3000,
    interestRate: 18,
    duration: '1 month',
    conditions: 'Short-term loan. Weekly payments. No collateral needed.',
    status: 'active' as const,
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: '4',
    lenderId: 'lender-2',
    amount: 15000,
    interestRate: 10,
    duration: '12 months',
    conditions: 'Long-term loan. Monthly repayment. Business plan required.',
    status: 'active' as const,
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-10-25'),
  },
];

export const SEED_NOTIFICATIONS = [
  {
    id: '1',
    userId: 'borrower-1',
    title: 'Welcome to ShamwariPay!',
    message: 'Your account has been created successfully. Start browsing loan offers now.',
    type: 'system' as const,
    read: false,
    createdAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    userId: 'lender-1',
    title: 'New Loan Application',
    message: 'A borrower has applied for your $5,000 loan offer.',
    type: 'system' as const,
    read: false,
    createdAt: new Date('2024-10-15'),
  },
  {
    id: '3',
    userId: 'admin-1',
    title: 'System Alert',
    message: 'Daily analytics report is ready for review.',
    type: 'system' as const,
    read: true,
    createdAt: new Date('2024-10-20'),
  },
];

/**
 * Test credentials for quick reference
 * Copy these to use during testing
 */
export const TEST_CREDENTIALS = `
========================================
  SHAMWARIPAY TEST ACCOUNTS
========================================

ADMIN ACCOUNT
-------------
Email:    admin@shamwaripay.com
Password: admin123

LENDER ACCOUNT
--------------
Email:    lender@shamwaripay.com
Password: lender123

BORROWER ACCOUNT
----------------
Email:    borrower@shamwaripay.com
Password: borrower123

========================================
NOTE: These are DEVELOPMENT credentials only!
========================================
`;

// Log test credentials when in development mode
if (__DEV__) {
  console.log(TEST_CREDENTIALS);
}
