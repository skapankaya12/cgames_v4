import type { CreateInviteRequest, CreateInviteResponse } from '@cgames/types';

/**
 * Server-side service for managing invites
 * Used by API functions for database operations
 */
export class InviteService {
  /**
   * Create a new invite in the database
   */
  static async createInvite(data: {
    candidateEmail: string;
    sentBy: string;
    projectId?: string;
    roleTag?: string;
  }) {
    // Import Firebase Admin dynamically to avoid client-side issues
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
  }

  /**
   * Validate an invite token
   */
  static async validateInvite(token: string) {
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
  }
}

/**
 * Client-side service for managing invites
 * Makes HTTP requests to the invite API endpoints
 */
export class InviteServiceClient {
  private static readonly API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://app.olivinhr.com'
    : 'http://localhost:3001';

  /**
   * Initialize HR user profile
   */
  static async initializeHrUser(): Promise<void> {
    console.log('🔄 [InviteServiceClient] Initializing HR user profile');
    
    try {
      // Get the current user's Firebase token for authentication
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      const response = await fetch(`${this.API_BASE_URL}/api/init-hr-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to initialize HR user`);
      }

      console.log('✅ [InviteServiceClient] HR user initialized:', data.message);
      
    } catch (error) {
      console.error('🚨 [InviteServiceClient] Error initializing HR user:', error);
      throw error;
    }
  }

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

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🚨 [InviteServiceClient] Non-JSON response:', text);
        throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
      }

      const data = await response.json() as CreateInviteResponse;
      console.log('📦 [InviteServiceClient] API response data:', data);

      if (!response.ok) {
        // If the error is "User profile not found", try to initialize the HR user
        if (response.status === 404 && data.error?.includes('User profile not found')) {
          console.log('🔄 [InviteServiceClient] HR user not found, initializing...');
          await this.initializeHrUser();
          
          // Retry the original request
          console.log('🔄 [InviteServiceClient] Retrying invite creation...');
          return this.createInvite(request);
        }
        
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