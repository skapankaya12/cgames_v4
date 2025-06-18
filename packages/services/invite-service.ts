import type { CreateInviteRequest, CreateInviteResponse } from '@cgames/types';

/**
 * Client-side service for managing invites
 * Makes HTTP requests to the invite API endpoints
 */
export class InviteServiceClient {
  private static readonly API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://cgames-hr-platform.vercel.app'
    : 'http://localhost:3001';

  /**
   * Create a new invite
   */
  static async createInvite(request: CreateInviteRequest): Promise<CreateInviteResponse> {
    console.log('🚀 [InviteServiceClient] createInvite called with:', request);
    
    try {
      // Get the current user's Firebase token for authentication
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      console.log('🔑 [InviteServiceClient] Got Firebase token for user:', user.uid);

      const response = await fetch(`${this.API_BASE_URL}/api/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      console.log('📡 [InviteServiceClient] API response status:', response.status);

      const data: CreateInviteResponse = await response.json();
      console.log('📦 [InviteServiceClient] API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to create invite`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create invite');
      }

      console.log('✅ [InviteServiceClient] Invite created successfully');
      return data;
      
    } catch (error) {
      console.error('🚨 [InviteServiceClient] Error creating invite:', error);
      throw error;
    }
  }
} 