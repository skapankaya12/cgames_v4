const { VercelRequest, VercelResponse } = require('@vercel/node');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

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
  console.log('🚀 [Create Project API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Create Project API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Create Project API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate request data
    const { 
      projectName, 
      description, 
      hrId, 
      gamePreferences, 
      roleTag,
      roleInfo,
      assessmentType,
      customization
    } = req.body || {};

    if (!projectName || !hrId) {
      console.log('❌ [Create Project API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'projectName and hrId are required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Create Project API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Verify HR user has admin role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Create Project API] HR user not found:', hrId);
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    const hrUserData = hrDoc.data();
    const userRole = hrUserData?.role;
    const companyId = hrUserData?.companyId;
    
    // Check if user has admin role
    if (userRole !== 'admin') {
      console.log('❌ [Create Project API] Insufficient permissions. Required: admin, User role:', userRole);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions: admin role required'
      });
    }
    
    if (!companyId) {
      console.log('❌ [Create Project API] HR user not associated with any company');
      return res.status(400).json({
        success: false,
        error: 'HR user not associated with any company'
      });
    }

    console.log(`✅ [Create Project API] HR user verified - Role: ${userRole}, Company: ${companyId}`);

    console.log('🔄 [Create Project API] Step 2: Creating project...');
    
    // Step 2: Generate project ID and create project data
    const projectId = uuidv4();
    const now = Date.now();

    const projectData = {
      name: projectName,
      description: description || '',
      companyId,
      createdBy: hrId,
      createdAt: now,
      updatedAt: now,
              gamePreferences: gamePreferences || ['Space Mission'],
      roleTag: roleTag || '',
      status: 'active',
      candidateCount: 0,
      // Include roleInfo and other data from frontend
      roleInfo: roleInfo || {
        position: roleTag || 'Assessment',
        department: 'General',
        yearsExperience: 'Not specified',
        workMode: 'Not specified',
        location: 'Not specified'
      },
      assessmentType: assessmentType || 'behavioral',
      customization: customization || {
        teamSize: 'Not specified',
        managementStyle: 'Not specified',
        industryFocus: 'Not specified',
        keySkills: ['Communication', 'Leadership']
      },
      recommendations: {
        assessmentDuration: '30',
        focusAreas: ['Leadership', 'Communication'],
        suggestedGames: ['Space Mission']
      },
      stats: {
        totalCandidates: 0,
        invitedCandidates: 0,
        completedCandidates: 0
      }
    };

    // Create project in company's projects subcollection
    const projectRef = db.collection('companies').doc(companyId).collection('projects').doc(projectId);
    await projectRef.set(projectData);

    console.log('✅ [Create Project API] Project created successfully');

    // Success response
    return res.status(201).json({
      success: true,
      project: {
        id: projectId,
        name: projectName,
        description: description || '',
        companyId,
        createdBy: hrId,
        createdAt: now,
        gamePreferences: gamePreferences || ['Space Mission'],
        roleTag: roleTag || '',
        status: 'active',
        candidateCount: 0
      }
    });

  } catch (error) {
    console.error('🚨 [Create Project API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create project'
    });
  }
}; 