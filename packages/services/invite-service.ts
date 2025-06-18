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
    selectedGame?: string;
  }) {
    try {
      // Dynamic imports to avoid bundling in client-side code
      const { getFirestore } = await import('firebase-admin/firestore');
      const { v4: uuidv4 } = await import('uuid');
      
      const db = getFirestore();
      
      // If projectId is provided, get the selected game from project
      let selectedGame = data.selectedGame;
      if (data.projectId && !selectedGame) {
        try {
          const projectDoc = await db.collection('companies').doc('default').collection('projects').doc(data.projectId).get();
          if (projectDoc.exists) {
            const projectData = projectDoc.data();
            // Get the first preferred game or default to first suggested game
            selectedGame = projectData?.customization?.gamePreferences?.[0] || 
                         projectData?.recommendations?.suggestedGames?.[0] || 
                         'Leadership Scenario Game';
          }
        } catch (error) {
          console.warn('⚠️ [InviteService] Could not fetch project game preferences:', error);
          selectedGame = 'Leadership Scenario Game'; // Default fallback
        }
      }
      
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
        selectedGame: selectedGame || 'Leadership Scenario Game',
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
        body: JSON.stringify({
          email: request.email,
          projectId: request.projectId,
          roleTag: request.roleTag || 'candidate'
        }),
      });

      console.log('📡 [InviteServiceClient] API response status:', response.status);

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🚨 [InviteServiceClient] Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response. This usually indicates a deployment or configuration issue. Status: ${response.status}`);
      }

      const data = await response.json() as CreateInviteResponse;
      console.log('📦 [InviteServiceClient] API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to create invite`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create invite');
      }

      console.log('✅ [InviteServiceClient] Invite created and email sent successfully');
      return data;
      
    } catch (error) {
      console.error('🚨 [InviteServiceClient] Error creating invite:', error);
      
      // Provide helpful error messages but don't mask failures with fake success
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Network')) {
          throw new Error(`Network error: Unable to reach the invite API. Please check your internet connection and try again.`);
        }
        
        if (error.message.includes('SENDGRID_API_KEY')) {
          throw new Error(`Email service configuration error: The system is not properly configured to send invitation emails. Please contact support.`);
        }
        
        if (error.message.includes('FIREBASE')) {
          throw new Error(`Database configuration error: The system is not properly configured to store invitations. Please contact support.`);
        }
      }
      
      // Re-throw the original error - don't create fake success responses
      throw error;
    }
  }
} 