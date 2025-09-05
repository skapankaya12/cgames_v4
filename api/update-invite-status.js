const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function initializeFirebase() {
  if (!getApps().length) {
    try {
      const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
      const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
      // Support either plain key or base64-encoded key
      let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
      const firebasePrivateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64 || process.env.FIREBASE_PRIVATE_KEY_BASE64;

      if (!firebasePrivateKey && firebasePrivateKeyB64) {
        try {
          firebasePrivateKey = Buffer.from(firebasePrivateKeyB64, 'base64').toString('utf-8');
        } catch (e) {
          throw new Error('Failed to decode FIREBASE_PRIVATE_KEY_B64. Ensure it is valid base64.');
        }
      }

      if (!FIREBASE_PROJECT_ID) throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
      if (!FIREBASE_CLIENT_EMAIL) throw new Error('Missing required environment variable: FIREBASE_CLIENT_EMAIL');
      if (!firebasePrivateKey) throw new Error('Missing required environment variable: FIREBASE_PRIVATE_KEY');

      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
        }),
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 Firebase initialization error:', error);
      throw error;
    }
  }
}

module.exports = async function handler(req, res) {
  console.log('🔄 [Update Invite Status API] Request received:', req.method, req.url);

  // Set CORS headers early so all responses (including errors) match the caller's origin
  const allowedOrigins = [
    'https://app.olivinhr.com',
    'https://hub.olivinhr.com',
    'https://cgames-v4-hr-platform.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');

  try {

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Update Invite Status API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Update Invite Status API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    const { token, status } = req.body || {};

    if (!token || !status) {
      console.log('❌ [Update Invite Status API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Token and status are required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Update Invite Status API] Updating status for token:', token.substring(0, 8) + '...');
    
    // Find and update the invite
    const invitesRef = db.collection('invites');
    const query = await invitesRef.where('token', '==', token).get();
    
    if (query.empty) {
      console.log('❌ [Update Invite Status API] Invite not found');
      return res.status(404).json({
        success: false,
        error: 'Invite not found'
      });
    }

    const inviteDoc = query.docs[0];
    const inviteData = inviteDoc.data();
    
    // Update the status with timestamps
    const updateData = {
      status: status,
      updatedAt: Date.now()
    };
    
    if (status === 'started') {
      updateData.startedAt = Date.now();
    } else if (status === 'completed') {
      updateData.completedAt = Date.now();
    }
    
    await inviteDoc.ref.update(updateData);
    
    // Also update candidate status in project if projectId exists
    if (inviteData.projectId && inviteData.companyId) {
      try {
        const projectsRef = db.collection('companies').doc(inviteData.companyId).collection('projects').doc(inviteData.projectId);
        const candidatesRef = projectsRef.collection('candidates');
        const candidateQuery = await candidatesRef.where('email', '==', inviteData.candidateEmail).get();
        
        if (!candidateQuery.empty) {
          const candidateDoc = candidateQuery.docs[0];
          const candidateStatus = status === 'started' ? 'InProgress' : status === 'completed' ? 'Completed' : 'Invited';
          await candidateDoc.ref.update({
            status: candidateStatus,
            updatedAt: Date.now()
          });
          console.log('✅ [Update Invite Status API] Updated candidate status in project');
        }
      } catch (error) {
        console.warn('⚠️ [Update Invite Status API] Failed to update candidate status in project:', error);
      }
    }
    
    console.log('✅ [Update Invite Status API] Status updated successfully:', status);

    // Success response
    return res.status(200).json({
      success: true,
      message: `Invite status updated to ${status}`
    });

  } catch (error) {
    console.error('🚨 [Update Invite Status API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to update invite status'
    });
  }
}; 