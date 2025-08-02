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
      
      firebaseInitialized = true;
      console.log('✅ [Firebase] Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 [Firebase] Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

module.exports = async function handler(req, res) {
  console.log('🚀 [Get Projects API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get Projects API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Projects API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate parameters
    const { hrId } = req.query;

    if (!hrId || typeof hrId !== 'string') {
      console.log('❌ [Get Projects API] Missing hrId parameter');
      return res.status(400).json({
        success: false,
        error: 'hrId query parameter is required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get Projects API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Get HR user and verify role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Get Projects API] HR user not found:', hrId);
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
      console.log('❌ [Get Projects API] Insufficient permissions. Required:', requiredRoles, 'User role:', userRole);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${requiredRoles.join(' or ')} role required`
      });
    }

    if (!companyId) {
      console.log('❌ [Get Projects API] HR user not associated with company');
      return res.status(400).json({
        success: false,
        error: 'HR user not associated with any company'
      });
    }

    console.log(`✅ [Get Projects API] HR user verified - Role: ${userRole}, Company: ${companyId}`);

    console.log('🔄 [Get Projects API] Step 2: Fetching projects...');
    
    // Step 2: Get all projects from company's projects subcollection
    const projectsQuery = db.collection('companies').doc(companyId).collection('projects');
    const projectsSnapshot = await projectsQuery.get();
    
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ [Get Projects API] Found ${projects.length} projects`);

    // Get company data
    const companyDoc = await db.collection('companies').doc(companyId).get();
    const companyData = companyDoc.exists ? companyDoc.data() : null;

    // Success response
    return res.status(200).json({
      success: true,
      projects: projects,
      company: companyData,
      total: projects.length,
      hrUser: {
        id: hrId,
        role: userRole,
        companyId: companyId
      }
    });

  } catch (error) {
    console.error('🚨 [Get Projects API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch projects'
    });
  }
}; 