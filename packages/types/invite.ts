export interface Invite {
  id: string;
  candidateEmail: string;
  token: string;
  status: 'pending' | 'started' | 'completed' | 'expired';
  projectId: string;
  companyId: string;
  timestamp: number; // When invite was created
  expiresAt: number; // 7 days from creation
  lastOpenedAt?: number; // When candidate opened the link
  completedAt?: number; // When assessment was completed
  result: Record<string, any>; // Assessment results
  sentBy?: string;
  roleTag?: string;
} 