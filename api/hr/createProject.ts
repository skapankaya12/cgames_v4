import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

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
          privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { projectName, description, hrId, gamePreferences, roleTag } = req.body || {};

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
    
    // Step 1: Verify HR user has admin role (inline verification instead of importing)
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
      gamePreferences: gamePreferences || ['Leadership Scenario Game'],
      roleTag: roleTag || '',
      status: 'active',
      candidateCount: 0
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
        gamePreferences: gamePreferences || ['Leadership Scenario Game'],
        roleTag: roleTag || '',
        status: 'active',
        candidateCount: 0
      }
    });

  } catch (error: any) {
    console.error('🚨 [Create Project API] Error:', error);
    
    // Handle permission errors specifically
    if (error.message?.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message?.includes('HR user not found')) {
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create project'
    });
  }
} 