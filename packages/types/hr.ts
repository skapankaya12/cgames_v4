export interface HrAuthResponse {
  hrId: string;
  email: string;
  token: string;
  companyId: string;
  role: 'admin' | 'employee';
}

export interface HrUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin' | 'employee';
  createdAt: number;
  updatedAt: number;
  createdBy?: string; // ID of the super_admin who created this user
}

// Internal platform roles (Firebase Auth custom claims)
export interface PlatformUser {
  uid: string;
  email: string;
  role: 'super_admin';
}

// Request/Response types for company creation
export interface CreateCompanyRequest {
  companyName: string;
  licenseCount: number;
  maxUsers: number;
  maxProjects: number;
  hrEmail: string;
  hrName: string;
}

export interface CreateCompanyResponse {
  success: boolean;
  company: {
    id: string;
    name: string;
    licenseCount: number;
    maxUsers: number;
    usedLicensesCount: number;
  };
  hrUser: {
    id: string;
    email: string;
    name: string;
    role: 'admin';
    companyId: string;
  };
  error?: string;
}

export interface Candidate {
  id: string;
  email: string;
  status: 'Invited' | 'InProgress' | 'Completed';
  dateInvited: string;
  dateCompleted?: string;
  inviteToken?: string;
}

export interface CandidateResultDetail {
  candidateId: string;
  email: string;
  totalScore: number;
  competencyBreakdown: { [competency: string]: number };
  rawAnswersUrl?: string;
} 