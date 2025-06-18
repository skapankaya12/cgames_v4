export interface Invite {
  id: string;
  candidateEmail: string;
  token: string;
  status: 'pending' | 'used' | 'expired';
  sentBy: string;
  sentAt: number;
  projectId?: string;
  roleTag?: string;
  companyId: string;
  usedAt?: number;
  expiresAt?: number;
} 