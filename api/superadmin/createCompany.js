// Load environment variables
require('dotenv').config();

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      console.log('🔥 [Firebase] Initializing Firebase Admin...');
      
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      };

      // Check if all required environment variables are present
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
  console.log('🚀 [Create Company API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Create Company API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Create Company API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate request data
    const { companyName, licenseCount, maxUsers, maxProjects, hrEmail, hrName } = req.body || {};

    console.log('📋 [Create Company API] Request data:', {
      companyName,
      licenseCount,
      maxUsers,
      maxProjects,
      hrEmail,
      hrName
    });

    if (!companyName || !licenseCount || !maxUsers || !hrEmail || !hrName) {
      console.log('❌ [Create Company API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'companyName, licenseCount, maxUsers, hrEmail, and hrName are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hrEmail)) {
      console.log('❌ [Create Company API] Invalid HR email format:', hrEmail);
      return res.status(400).json({
        success: false,
        error: 'Invalid HR email format'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();
    const auth = getAuth();

    console.log('🔄 [Create Company API] Creating company and HR user...');

    // Generate IDs
    const companyId = uuidv4();
    const now = Date.now();
    const tempPassword = 'TempPass123!';

    // Prepare company data
    const companyData = {
      name: companyName,
      licenseCount: parseInt(licenseCount),
      usedLicensesCount: 0,
      maxUsers: parseInt(maxUsers),
      maxProjects: parseInt(maxProjects) || Math.max(Math.floor(parseInt(licenseCount) / 10), 5),
      usedProjectsCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: 'super-admin'
    };

    // Create Firebase Auth user FIRST
    let firebaseAuthUid = null;
    try {
      const firebaseUser = await auth.createUser({
        email: hrEmail,
        password: tempPassword,
        displayName: hrName,
      });
      
      firebaseAuthUid = firebaseUser.uid;
      
      // Set custom claims for HR admin
      await auth.setCustomUserClaims(firebaseUser.uid, {
        hr_admin: true,
        companyId: companyId
      });
      
      console.log('✅ [Create Company API] Firebase Auth user created:', firebaseUser.uid);
    } catch (authError) {
      console.log('⚠️ [Create Company API] Firebase Auth user creation failed:', authError.message);
      // If user already exists, try to get the existing user
      try {
        const existingUser = await auth.getUserByEmail(hrEmail);
        firebaseAuthUid = existingUser.uid;
        console.log('✅ [Create Company API] Using existing Firebase user:', firebaseAuthUid);
      } catch (getUserError) {
        throw new Error(`Failed to create or find user: ${authError.message}`);
      }
    }

    // Prepare HR user data
    const hrUserData = {
      email: hrEmail,
      name: hrName,
      companyId,
      role: 'admin',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: 'super-admin'
    };

    // Create Firestore documents using transaction
    await db.runTransaction(async (transaction) => {
      // Create company document
      const companyRef = db.collection('companies').doc(companyId);
      transaction.set(companyRef, companyData);

      // Create HR user document using Firebase Auth UID as document ID
      const hrUserRef = db.collection('hrUsers').doc(firebaseAuthUid);
      transaction.set(hrUserRef, hrUserData);
    });

    console.log('✅ [Create Company API] Company and HR user created in Firestore with UID:', firebaseAuthUid);

    // Success response
    const response = {
      success: true,
      company: {
        id: companyId,
        name: companyName,
        licenseCount: parseInt(licenseCount),
        maxUsers: parseInt(maxUsers),
        maxProjects: companyData.maxProjects,
        usedLicensesCount: 0
      },
      hrUser: {
        id: firebaseAuthUid,
        email: hrEmail,
        name: hrName,
        role: 'admin',
        companyId,
        temporaryPassword: tempPassword
      }
    };

    console.log('🎉 [Create Company API] Success! Returning response');
    return res.status(201).json(response);

  } catch (error) {
    console.error('🚨 [Create Company API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create company'
    });
  }
}; 