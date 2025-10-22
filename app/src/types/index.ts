export interface User {
  id: number | string;
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

export interface LoanOffer {
  id: number | string;
  lenderId: number | string;
  amount: number;
  interestRate: number;
  duration: string;
  conditions: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanApplication {
  id: string;
  borrowerId: string;
  offerId: string;
  statementUrl: string;
  aiSummary?: AISummary;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface AISummary {
  avgBalance: number;
  inflows: number;
  outflows: number;
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  transactionFrequency: number;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionRecord {
  id: string;
  lenderId: string;
  loanId: string;
  profit: number;
  commission: number;
  status: 'pending' | 'paid';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'loan_approval' | 'loan_rejection' | 'repayment_reminder' | 'account_frozen' | 'system';
  read: boolean;
  createdAt: Date;
}
