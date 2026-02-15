import { UserRole, AccountStatus, KYCStatus, RiskLevel } from '../constants/enums';

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationalId?: string;
  taxNumber?: string;
  role: UserRole;
  status: AccountStatus;
  kycStatus: KYCStatus;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  branchCode?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  profile?: UserProfile;
  wallet?: Wallet;
}

export interface UserProfile {
  id: string;
  userId: string;
  employmentStatus?: string;
  employerName?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  yearsEmployed?: number;
  creditScore: number;
  totalBorrowed: number;
  totalRepaid: number;
  totalInvested: number;
  totalEarned: number;
  outstandingBalance: number;
  riskLevel: RiskLevel;
  riskScore: number;
  lastRiskAssessment?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  investmentPreferences?: any;
  language: string;
  currency: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  withdrawalLimitDaily: number;
  depositLimitDaily: number;
  walletNumber: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  type: string;
  documentNumber?: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  issueDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}