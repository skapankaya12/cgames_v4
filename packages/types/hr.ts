export interface HrAuthResponse {
  hrId: string;
  email: string;
  token: string;
}

export interface Candidate {
  id: string;
  email: string;
  status: 'Invited' | 'InProgress' | 'Completed';
  dateInvited: string;
  dateCompleted?: string;
}

export interface CandidateResultDetail {
  candidateId: string;
  email: string;
  totalScore: number;
  competencyBreakdown: { [competency: string]: number };
  rawAnswersUrl?: string;
} 