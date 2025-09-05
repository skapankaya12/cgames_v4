const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PRIVATE_KEY_B64: process.env.FIREBASE_PRIVATE_KEY_B64
      };

      // Check if essential environment variables are present
      if (!requiredEnvVars.FIREBASE_PROJECT_ID) {
        throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
      }
      if (!requiredEnvVars.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Missing required environment variable: FIREBASE_CLIENT_EMAIL');
      }
      // Either FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_B64 must be present
      if (!requiredEnvVars.FIREBASE_PRIVATE_KEY && !requiredEnvVars.FIREBASE_PRIVATE_KEY_B64) {
        throw new Error('Missing required environment variable: FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_B64');
      }

      // Normalize private key (supports single-line with \n, actual newlines, and optional base64 variant)
      let privateKey = requiredEnvVars.FIREBASE_PRIVATE_KEY || '';
      if (requiredEnvVars.FIREBASE_PRIVATE_KEY_B64 && !privateKey) {
        try {
          privateKey = Buffer.from(requiredEnvVars.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf8');
        } catch (e) {
          console.warn('⚠️ [Firebase] Failed to decode FIREBASE_PRIVATE_KEY_B64');
        }
      }
      if (!privateKey) throw new Error('FIREBASE_PRIVATE_KEY is not set');
      
      // Strip wrapping quotes if present and convert escaped newlines
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
          clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
          privateKey
        }),
      });
      
      firebaseInitialized = true;
      console.log('✅ [Firebase] Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 [Firebase] Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

module.exports = async function handler(req, res) {
  console.log('🚀 [Get Project API] Request received:', req.method, req.url);
  
  try {
    // Set CORS headers for api.olivinhr.com domain
    const allowedOrigins = [
      'https://app.olivinhr.com',
      'https://hub.olivinhr.com',
      'https://cgames-v4-hr-platform.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    const origin = req.headers.origin || '';
    console.log('🔍 [Get Project API] Origin:', origin);
    
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get Project API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Project API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate parameters
    const { projectId, hrId, includeCandidates } = req.query;

    if (!projectId || !hrId || typeof projectId !== 'string' || typeof hrId !== 'string') {
      console.log('❌ [Get Project API] Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'projectId and hrId query parameters are required'
      });
    }

    const shouldIncludeCandidates = includeCandidates !== 'false';

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get Project API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Get HR user and verify role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Get Project API] HR user not found:', hrId);
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    const hrUserData = hrDoc.data();
    const userRole = hrUserData?.role;
    const companyId = hrUserData?.companyId;
    
    // Check if user has required role (admin or employee)
    const requiredRoles = ['admin', 'employee'];
    if (!userRole || !requiredRoles.includes(userRole)) {
      console.log('❌ [Get Project API] Insufficient permissions. Required:', requiredRoles, 'User role:', userRole);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${requiredRoles.join(' or ')} role required`
      });
    }

    console.log(`✅ [Get Project API] HR user verified - Role: ${userRole}, Company: ${companyId}`);

    console.log('🔄 [Get Project API] Step 2: Fetching project...');
    
    // Step 2: Get the project from company's projects subcollection
    const projectRef = db.collection('companies').doc(companyId).collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      console.log('❌ [Get Project API] Project not found:', projectId);
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const projectData = {
      id: projectDoc.id,
      ...projectDoc.data()
    };

    console.log(`✅ [Get Project API] Project found: ${projectData.name}`);

    // Step 3: Get candidates if requested
    let candidates = [];
    if (shouldIncludeCandidates) {
      console.log('🔄 [Get Project API] Step 3: Fetching candidates...');
      
      // Get invites for this project
      const invitesQuery = db.collection('invites').where('projectId', '==', projectId);
      const invitesSnapshot = await invitesQuery.get();
      
      // Transform invite data to match ProjectCandidate interface
      candidates = invitesSnapshot.docs.map(doc => {
        const inviteData = doc.data();
        
        // Determine status based on invite status
        let status = 'Invited';
        if (inviteData.status === 'started') {
          status = 'InProgress';
        } else if (inviteData.status === 'completed') {
          status = 'Completed';
        }

        return {
          id: doc.id,
          email: inviteData.candidateEmail,
          status: status,
          dateInvited: inviteData.timestamp ? new Date(inviteData.timestamp).toISOString() : new Date().toISOString(),
          dateCompleted: inviteData.completedAt ? new Date(inviteData.completedAt).toISOString() : undefined,
          inviteToken: inviteData.token,
          projectId: inviteData.projectId,
          // Additional fields that might be useful
          totalScore: inviteData.result?.totalScore || null,
          competencyBreakdown: inviteData.result?.competencyBreakdown || null,
          lastOpenedAt: inviteData.lastOpenedAt ? new Date(inviteData.lastOpenedAt).toISOString() : undefined
        };
      });

      console.log(`✅ [Get Project API] Found ${candidates.length} candidates`);
      console.log(`📊 [Get Project API] Candidate statuses:`, candidates.map(c => `${c.email}: ${c.status}`));
    }

    // Success response
    return res.status(200).json({
      success: true,
      project: projectData,
      candidates: candidates,
      hrUser: {
        id: hrId,
        role: userRole,
        canSendInvites: userRole === 'admin'
      }
    });

  } catch (error) {
    console.error('🚨 [Get Project API] Error:', error);
    
    // Make sure we set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', 'https://app.olivinhr.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch project'
    });
  }
};