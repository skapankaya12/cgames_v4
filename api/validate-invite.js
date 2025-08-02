const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function initializeFirebase() {
  if (!getApps().length) {
    try {
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      };

      for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      initializeApp({
        credential: cert({
          projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
          clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
          privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 Firebase initialization error:', error);
      throw error;
    }
  }
}

async function validateInvite(token) {
  try {
    const db = getFirestore();
    
    const query = db.collection('invites').where('token', '==', token).limit(1);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      throw new Error('Invalid invite token');
    }
    
    const inviteDoc = snapshot.docs[0];
    const inviteData = inviteDoc.data();
    const invite = { id: inviteDoc.id, ...inviteData };
    
    // Check if token has expired (7 days)
    const expiresAt = inviteData?.expiresAt;
    if (expiresAt && Date.now() > expiresAt) {
      throw new Error('Invite token has expired');
    }
    
    // Only prevent access if the assessment has been completed AND submitted
    if (inviteData?.status === 'completed') {
      throw new Error('Assessment has already been completed and submitted');
    }
    
    return invite;
  } catch (error) {
    console.error('🚨 [ValidateInvite] Error:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  console.log('🔍 [Validate Invite API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Validate Invite API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Validate Invite API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      console.log('❌ [Validate Invite API] Missing token parameter');
      return res.status(400).json({
        success: false,
        error: 'Token parameter is required'
      });
    }

    // Initialize Firebase
    initializeFirebase();

    console.log('🔄 [Validate Invite API] Validating token:', token.substring(0, 8) + '...');
    
    // Validate the invite token
    const invite = await validateInvite(token);
    
    console.log('✅ [Validate Invite API] Token validated for:', invite.candidateEmail);

    // Success response
    return res.status(200).json({
      success: true,
      invite: {
        id: invite.id,
        candidateEmail: invite.candidateEmail,
        projectId: invite.projectId,
        roleTag: invite.roleTag,
        selectedGame: invite.selectedGame,
        status: invite.status,
        token: invite.token,
        expiresAt: invite.expiresAt
      }
    });

  } catch (error) {
    console.error('🚨 [Validate Invite API] Error:', error);
    
    const errorMessage = error?.message || 'Unknown error occurred';
    
    if (errorMessage.includes('Invalid invite token') || errorMessage.includes('expired') || errorMessage.includes('completed')) {
      return res.status(404).json({
        success: false,
        error: errorMessage
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 