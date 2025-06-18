import type { VercelRequest, VercelResponse } from '@vercel/node';
import { InviteService } from '@cgames/services/invite-service';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🔍 [HR API] Validate Invite Token');
  console.log('   Method:', req.method);
  console.log('   Query:', req.query);

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.log('❌ [HR API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: 'Token parameter is required' 
      });
      return;
    }

    console.log('🔄 [HR API] Validating token:', token.substring(0, 8) + '...');
    
    // Validate the invite token
    const invite = await InviteService.validateInvite(token) as any;
    
    console.log('✅ [HR API] Token validated for:', invite.candidateEmail);

    res.status(200).json({
      success: true,
      invite: {
        id: invite.id,
        candidateEmail: invite.candidateEmail,
        projectId: invite.projectId,
        roleTag: invite.roleTag,
        status: invite.status
      }
    });

  } catch (error) {
    console.error('🚨 [HR API] Error validating invite:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('Invalid invite token') || errorMessage.includes('already been used')) {
      res.status(404).json({
        success: false,
        error: errorMessage
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 