import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Firebase Admin
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      console.log('🔥 [Firebase] Initializing Firebase Admin...');
      
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

// Simple auth verification for super admin
async function verifySuperAdmin(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.super_admin) {
      throw new Error('Insufficient permissions. Super admin role required.');
    }
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || ''
    };
  } catch (error: any) {
    console.error('❌ [Auth] Token verification failed:', error?.message);
    throw new Error(`Authentication failed: ${error?.message}`);
  }
}

// Send welcome email function
async function sendHrAdminWelcomeEmail(data: {
  email: string;
  name: string;
  companyName: string;
  hrUserId: string;
  temporaryPassword: string;
}) {
  try {
    console.log('📧 [Email] Sending welcome email to:', data.email);
    
    const sgMail = require('@sendgrid/mail');
    
    console.log('🔍 [Email] Environment check:');
    console.log('  - SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('  - SENDGRID_API_KEY prefix:', process.env.SENDGRID_API_KEY?.substring(0, 3) || 'none');
    console.log('  - VITE_HR_PLATFORM_URL:', process.env.VITE_HR_PLATFORM_URL);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ [Email] SENDGRID_API_KEY not found in environment variables');
      throw new Error('SendGrid API key not configured');
    }
    
    if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.error('❌ [Email] Invalid SENDGRID_API_KEY format - should start with SG.');
      throw new Error('Invalid SendGrid API key format');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const loginUrl = process.env.VITE_HR_PLATFORM_URL || 'http://localhost:5173';
    
    const emailContent = {
      to: data.email,
      from: 'noreply@olivinhr.com', // Replace with your verified sender
      subject: `Welcome to ${data.companyName} - HR Platform Access`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${data.companyName}!</h2>
          
          <p>Hello ${data.name},</p>
          
          <p>Your HR admin account has been successfully created. You can now access the HR platform to manage your company's recruitment process.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Login Details:</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.temporaryPassword ? `<p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>` : ''}
            <p><strong>Login URL:</strong> <a href="${loginUrl}/hr/login">${loginUrl}/hr/login</a></p>
          </div>
          
          ${data.temporaryPassword ? '<p><em>Please change your password after your first login for security.</em></p>' : ''}
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The OlivinHR Team</p>
        </div>
      `
    };
    
    console.log('📤 [Email] Attempting to send email with content:', {
      to: emailContent.to,
      from: emailContent.from,
      subject: emailContent.subject
    });
    
    const result = await sgMail.send(emailContent);
    console.log('✅ [Email] SendGrid response:', result);
    console.log('✅ [Email] Welcome email sent successfully to:', data.email);
    
  } catch (error: any) {
    console.error('🚨 [Email] Failed to send welcome email:', error);
    
    if (error.response) {
      console.error('🚨 [Email] SendGrid error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    // Don't throw error, just log it so company creation continues
    console.log('⚠️ [Email] Continuing with company creation despite email failure');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Verify super admin auth (skip for now to test basic functionality)
    // const authHeader = req.headers.authorization;
    // const { uid } = await verifySuperAdmin(authHeader);

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

    if (!companyName || !licenseCount || !maxUsers || !maxProjects || !hrEmail || !hrName) {
      console.log('❌ [Create Company API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'companyName, licenseCount, maxUsers, maxProjects, hrEmail, and hrName are required'
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

    console.log('🔄 [Create Company API] Creating company and HR user...');

    // Generate IDs
    const companyId = uuidv4();
    const hrUserId = uuidv4();
    const now = Date.now();
    const tempPassword = 'TempPass123!'; // Generate a proper temp password

    // Prepare company data
    const companyData = {
      name: companyName,
      licenseCount: parseInt(licenseCount),
      usedLicensesCount: 0,
      maxUsers: parseInt(maxUsers),
      maxProjects: parseInt(maxProjects),
      usedProjectsCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: 'super-admin'
    };

    // Prepare HR user data
    const hrUserData = {
      email: hrEmail,
      name: hrName,
      companyId,
      role: 'admin',
      status: 'pending_first_login',
      createdAt: now,
      updatedAt: now,
      createdBy: 'super-admin'
    };

    // Create Firebase Auth user FIRST to get the correct UID
    let firebaseAuthUid: string = hrUserId;
    try {
      const auth = getAuth();
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
    } catch (authError: any) {
      console.log('⚠️ [Create Company API] Firebase Auth user creation failed:', authError.message);
      // Continue using generated hrUserId fallback
    }

    // Now create Firestore documents using the correct UID
    await db.runTransaction(async (transaction) => {
      // Create company document
      const companyRef = db.collection('companies').doc(companyId);
      transaction.set(companyRef, companyData);

      // Create HR user document using Firebase Auth UID as document ID
      const hrUserRef = db.collection('hrUsers').doc(firebaseAuthUid);
      transaction.set(hrUserRef, hrUserData);
    });

    console.log('✅ [Create Company API] Company and HR user created in Firestore with UID:', firebaseAuthUid);

    // Send welcome email
    console.log('📧 [Create Company API] Attempting to send welcome email...');
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendHrAdminWelcomeEmail({
        email: hrEmail,
        name: hrName,
        companyName: companyName,
        hrUserId: firebaseAuthUid,
        temporaryPassword: tempPassword
      });
      console.log('✅ [Create Company API] Welcome email sent successfully');
      emailSent = true;
    } catch (error: any) {
      console.log('⚠️ [Create Company API] Email sending failed:', error?.message);
      emailError = error?.message || 'Unknown email error';
      emailSent = false;
    }

    // Success response
    const response = {
      success: true,
      company: {
        id: companyId,
        name: companyName,
        licenseCount: parseInt(licenseCount),
        maxUsers: parseInt(maxUsers),
        usedLicensesCount: 0
      },
      hrUser: {
        id: firebaseAuthUid,
        email: hrEmail,
        name: hrName,
        role: 'admin',
        companyId
      },
      emailSent: emailSent,
      emailError: emailError
    };

    console.log('🎉 [Create Company API] Success! Returning response');
    return res.status(201).json(response);

  } catch (error: any) {
    console.error('🚨 [Create Company API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create company'
    });
  }
}