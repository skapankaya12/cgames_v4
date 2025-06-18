// Invite API Types
export interface CreateInviteRequest {
  email: string;
  projectId?: string;
  roleTag?: string;
}

export interface CreateInviteResponse {
  success: boolean;
  invite?: {
    id: string;
    candidateEmail: string;
    token: string;
    status: 'pending' | 'used' | 'expired';
    sentAt: number;
    projectId?: string;
    roleTag?: string;
  };
  error?: string;
}

export interface ValidateInviteRequest {
  token: string;
}

export interface ValidateInviteResponse {
  success: boolean;
  invite?: {
    id: string;
    candidateEmail: string;
    projectId?: string;
    roleTag?: string;
    companyId: string;
  };
  error?: string;
}

export interface AssessmentSubmissionRequest {
  token: string;
  candidateEmail: string;
  results: {
    totalScore: number;
    competencyScores: Array<{
      competency: string;
      score: number;
    }>;
    assessmentData: any;
  };
  projectId?: string;
}

export interface AssessmentSubmissionResponse {
  success: boolean;
  assessmentId?: string;
  error?: string;
} 