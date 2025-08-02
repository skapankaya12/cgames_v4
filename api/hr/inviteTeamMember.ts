import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import { verifyHrUserRole } from '../../packages/services/auth-utils-server';

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

// Generate secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send invitation email via SendGrid
async function sendTeamMemberInviteEmail(data: {
  email: string;
  name: string;
  temporaryPassword: string;
  companyName: string;
  inviterName: string;
  role: 'admin' | 'employee';
}) {
  console.log('📧 [SendGrid] Sending team member invitation to:', data.email);
  
  try {
    const sgMail = (await import('@sendgrid/mail')).default;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    sgMail.setApiKey(apiKey);
    
    const hrPlatformUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_HR_PLATFORM_URL || 'https://app.olivinhr.com'
      : 'http://localhost:5173';
    
    const loginUrl = `${hrPlatformUrl}/hr/login`;
    
    const msg = {
      to: data.email,
      from: 'noreply@olivinhr.com',
      subject: `Welcome to ${data.companyName} - HR Platform Access`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Welcome to BokumunKuşu</h1>
            <p style="color: #6B7280; margin: 10px 0 0 0;">Leadership Assessment Platform</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #111827; margin: 0 0 20px 0;">You've been invited to join ${data.companyName}</h2>
            <p style="color: #374151; margin-bottom: 20px;">
              ${data.inviterName} has invited you to join the HR platform with <strong>${data.role}</strong> privileges.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Your login credentials:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${data.temporaryPassword}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Access HR Platform
              </a>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400E; font-size: 14px;">
                <strong>⚠️ Important:</strong> Please change your password after first login for security.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #6B7280; font-size: 14px;">
            <p>This invitation was sent by ${data.inviterName} from ${data.companyName}.</p>
            <p>If you have any questions, please contact your HR administrator.</p>
          </div>
        </div>
      `,
    };
    
    await sgMail.send(msg);
    console.log('✅ [SendGrid] Invitation email sent successfully to:', data.email);
    
  } catch (error) {
    console.error('🚨 [SendGrid] Error sending invitation email:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Invite Team Member API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Invite Team Member API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Invite Team Member API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate request data
    const { email, name, role, hrId } = req.body || {};

    if (!email || !name || !role || !hrId) {
      console.log('❌ [Invite Team Member API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'email, name, role, and hrId are required'
      });
    }

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      console.log('❌ [Invite Team Member API] Invalid role:', role);
      return res.status(400).json({
        success: false,
        error: 'role must be either "admin" or "employee"'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [Invite Team Member API] Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();
    const auth = getAuth();

    console.log('🔄 [Invite Team Member API] Step 1: Verifying HR admin permissions...');
    
    // Step 1: Verify that the inviting user is an admin
    const inviterHrUser = await verifyHrUserRole(hrId, ['admin']);
    const companyId = inviterHrUser.companyId;

    console.log(`✅ [Invite Team Member API] HR admin verified - Company: ${companyId}`);

    console.log('🔄 [Invite Team Member API] Step 2: Checking company limits...');
    
    // Step 2: Check company user limits
    const companyDoc = await db.collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      console.log('❌ [Invite Team Member API] Company not found:', companyId);
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const companyData = companyDoc.data();
    const maxUsers = companyData?.maxUsers || 0;
    
    // Count existing HR users for this company
    const existingUsersQuery = await db.collection('hrUsers')
      .where('companyId', '==', companyId)
      .get();
    
    const currentUserCount = existingUsersQuery.size;

    console.log(`📊 [Invite Team Member API] User limits - Current: ${currentUserCount}, Max: ${maxUsers}`);

    if (currentUserCount >= maxUsers) {
      console.log('❌ [Invite Team Member API] User limit reached');
      return res.status(429).json({
        success: false,
        error: 'Company user limit reached. Contact support to increase limits.'
      });
    }

    console.log('🔄 [Invite Team Member API] Step 3: Creating Firebase Auth user...');
    
    // Step 3: Generate temporary password and create Firebase Auth user
    const temporaryPassword = generateTemporaryPassword();
    
    let firebaseUid: string;
    try {
      const userRecord = await auth.createUser({
        email,
        password: temporaryPassword,
        displayName: name,
        emailVerified: false
      });
      firebaseUid = userRecord.uid;
      console.log('✅ [Invite Team Member API] Firebase Auth user created:', firebaseUid);
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-exists') {
        console.log('❌ [Invite Team Member API] Email already registered');
        return res.status(409).json({
          success: false,
          error: 'A user with this email already exists'
        });
      }
      throw authError;
    }

    console.log('🔄 [Invite Team Member API] Step 4: Creating HR user document...');
    
    // Step 4: Create HR user document
    const now = Date.now();
    const hrUserData = {
      email,
      name,
      companyId,
      role,
      createdAt: now,
      updatedAt: now,
      createdBy: hrId,
      status: 'pending_first_login'
    };

    await db.collection('hrUsers').doc(firebaseUid).set(hrUserData);
    console.log('✅ [Invite Team Member API] HR user document created');

    console.log('🔄 [Invite Team Member API] Step 5: Sending invitation email...');
    
    // Step 5: Send invitation email
    await sendTeamMemberInviteEmail({
      email,
      name,
      temporaryPassword,
      companyName: companyData.name,
      inviterName: inviterHrUser.name || inviterHrUser.email,
      role
    });

    console.log('✅ [Invite Team Member API] Team member invitation completed successfully');

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Team member invited successfully',
      user: {
        uid: firebaseUid,
        email,
        name,
        role,
        companyId,
        status: 'pending_first_login'
      }
    });

  } catch (error: any) {
    console.error('🚨 [Invite Team Member API] Error:', error);
    
    // Handle permission errors specifically
    if (error.message?.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        error: 'Only HR administrators can invite team members'
      });
    }

    if (error.message?.includes('HR user not found')) {
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to invite team member. Please try again.'
    });
  }
} 