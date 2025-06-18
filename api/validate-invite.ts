import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
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

const db = getFirestore();

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🔔 [Validate Invite API] handler invoked');
  console.log('   Method:', req.method);
  console.log('   Query:', req.query);

  // Set CORS headers for all requests
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ [Validate Invite API] Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Only allow GET requests (after OPTIONS)
  if (req.method !== 'GET') {
    console.log('❌ [Validate Invite API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
      return;
    }

    console.log('🔄 [Validate Invite API] Validating token:', token.substring(0, 8) + '...');

    // Find the invite by token
    const query = db.collection('invites').where('token', '==', token).limit(1);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('❌ [Validate Invite API] Token not found');
      res.status(404).json({ 
        success: false, 
        error: 'Invalid invite token' 
      });
      return;
    }
    
    const inviteDoc = snapshot.docs[0];
    const inviteData = inviteDoc.data();
    
    if (inviteData?.status !== 'pending') {
      console.log('❌ [Validate Invite API] Token already used or expired');
      res.status(410).json({ 
        success: false, 
        error: 'Invite token has already been used or expired' 
      });
      return;
    }

    console.log('✅ [Validate Invite API] Token is valid');
    
    const invite = { 
      id: inviteDoc.id, 
      ...inviteData 
    };

    res.status(200).json({
      success: true,
      invite: {
        id: invite.id,
        candidateEmail: invite.candidateEmail,
        status: invite.status,
        sentAt: invite.sentAt,
        projectId: invite.projectId,
        roleTag: invite.roleTag
      }
    });

  } catch (error) {
    console.error('Error validating invite:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
} 