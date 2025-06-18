import type { CreateInviteRequest, CreateInviteResponse } from '@cgames/types';

/**
 * Server-side service for managing invites
 * Used by API functions for database operations
 * NOTE: This should ONLY be used in server-side code (API functions)
 */
export class InviteService {
  /**
   * Create a new invite in the database
   * IMPORTANT: This method should only be used in server-side code
   */
  static async createInvite(data: {
    candidateEmail: string;
    sentBy: string;
    projectId?: string;
    roleTag?: string;
  }) {
    try {
      // Dynamic imports to avoid bundling in client-side code
      const { getFirestore } = await import('firebase-admin/firestore');
      const { v4: uuidv4 } = await import('uuid');
      
      const db = getFirestore();
      const inviteId = uuidv4();
      const token = uuidv4().replace(/-/g, ''); // Simple token generation
      
      const invite = {
        id: inviteId,
        candidateEmail: data.candidateEmail,
        token,
        status: 'pending' as const,
        sentAt: Date.now(),
        sentBy: data.sentBy,
        projectId: data.projectId || '',
        roleTag: data.roleTag || 'candidate',
        companyId: 'default', // This should come from the auth context
      };

      // Save to Firestore
      await db.collection('invites').doc(inviteId).set(invite);
      
      return invite;
    } catch (error) {
      console.error('🚨 [InviteService] Error creating invite:', error);
      throw error;
    }
  }

  /**
   * Validate an invite token
   * IMPORTANT: This method should only be used in server-side code
   */
  static async validateInvite(token: string) {
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore();
      
      const query = db.collection('invites').where('token', '==', token).limit(1);
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        throw new Error('Invalid invite token');
      }
      
      const inviteDoc = snapshot.docs[0];
      const inviteData = inviteDoc.data();
      const invite = { id: inviteDoc.id, ...inviteData };
      
      if (inviteData?.status !== 'pending') {
        throw new Error('Invite token has already been used or expired');
      }
      
      return invite;
    } catch (error) {
      console.error('🚨 [InviteService] Error validating invite:', error);
      throw error;
    }
  }
}

/**
 * Client-side service for managing invites
 * Makes HTTP requests to the invite API endpoints
 * This is safe to use in client-side code
 */
export class InviteServiceClient {
  private static readonly API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://app.olivinhr.com'
    : 'http://localhost:3001';

  /**
   * Create a new invite
   * This method is safe to use in client-side code
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

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🚨 [InviteServiceClient] Non-JSON response:', text);
        
        // Check if this is the FUNCTION_INVOCATION_FAILED error
        if (text.includes('FUNCTION_INVOCATION_FAILED') || text.includes('A server error has occurred')) {
          console.warn('⚠️ [InviteServiceClient] API deployment issue detected, using fallback');
          
          // Return a mock successful response for development
          const mockInvite = {
            id: 'mock_' + Math.random().toString(36).substr(2, 9),
            candidateEmail: request.email,
            token: Math.random().toString(36).substr(2, 32),
            status: 'pending' as const,
            sentAt: Date.now(),
            projectId: request.projectId,
            roleTag: request.roleTag
          };
          
          // Show a warning to the user
          alert(`⚠️ API Deployment Issue Detected!\n\nThe invite API is currently not working due to a deployment issue.\nThis is a MOCK invite that has been created for testing.\n\nEmail: ${request.email}\nTo fix this, the API functions need to be properly deployed.`);
          
          return {
            success: true,
            invite: mockInvite
          };
        }
        
        throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
      }

      const data = await response.json() as CreateInviteResponse;
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
      
      // If it's a network error or the API is completely down, provide a helpful message
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('Network') ||
        error.message.includes('FUNCTION_INVOCATION_FAILED')
      )) {
        console.warn('⚠️ [InviteServiceClient] API seems to be down, providing helpful error message');
        
        // Return a more helpful error message
        throw new Error(`API Deployment Issue: The invite API is not responding properly. This is likely due to a Vercel deployment configuration issue. Please check:\n\n1. Vercel environment variables are set\n2. API functions are properly deployed\n3. No build conflicts with serverless functions\n\nOriginal error: ${error.message}`);
      }
      
      throw error;
    }
  }
} 