// App Constants
export const APP_NAME = 'MicroCreditChain P2P';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const API_ENDPOINTS = {
  AI_SERVICE: process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'https://ml.microcreditchain.ai',
  BACKEND: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
};

// User Roles
export const USER_ROLES = {
  BORROWER: 'borrower',
  LENDER: 'lender',
  ADMIN: 'admin',
} as const;

// Loan Status
export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  SETTLED: 'settled',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  LOAN_APPROVAL: 'loan_approval',
  LOAN_REJECTION: 'loan_rejection',
  REPAYMENT_REMINDER: 'repayment_reminder',
  ACCOUNT_FROZEN: 'account_frozen',
  SYSTEM: 'system',
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

// Commission Rate
export const COMMISSION_RATE = 0.15; // 15%

// File Upload Limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// UI Constants
export const UI_CONSTANTS = {
  BORDER_RADIUS: 8,
  SHADOW_OPACITY: 0.1,
  ANIMATION_DURATION: 300,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  FILE_UPLOAD_ERROR: 'File upload failed. Please try again.',
  AI_ANALYSIS_ERROR: 'AI analysis failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOAN_APPLIED: 'Loan application submitted successfully!',
  LOAN_APPROVED: 'Loan approved successfully!',
  REPAYMENT_SUCCESS: 'Repayment processed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};
