import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\n/g, '\n');
      privateKey = privateKey.replace(/\n/g, '\n').replace(/\r/g, '\r');
      // Finally convert to real newlines
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n/g, '\n');

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

  } catch (error: any) {
    console.error('🚨 [Create Project API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create project'
    });
  }
}