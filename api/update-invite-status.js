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

module.exports = async function handler(req, res) {
  console.log('🔄 [Update Invite Status API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Update Invite Status API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
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