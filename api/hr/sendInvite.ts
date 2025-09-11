import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
          projectId: requiredEnvVars.FIREBASE_PROJECT_ID!,
          clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL!,
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

// SendGrid email function
async function sendInvitationEmail(data: {
  candidateEmail: string;
  token: string;
  projectId: string;
  companyName: string;
  roleTag?: string;
}) {
  console.log('📧 [SendGrid] Sending invitation email to:', data.candidateEmail);
  
  try {
    // Dynamic import to avoid client-side issues
    const sgMail = (await import('@sendgrid/mail')).default;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    sgMail.setApiKey(apiKey);
    
    const gameBaseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_GAME_PLATFORM_URL || 'https://hub.olivinhr.com'
      : 'http://localhost:5174';
    
    const inviteUrl = `${gameBaseUrl}?token=${data.token}`;
    
    const msg = {
      to: data.candidateEmail,
      from: 'noreply@olivinhr.com',
      subject: `You received an assessment by "${data.companyName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6B8E23;">You received an assessment by "${data.companyName}"</h2>
          <p>Hello,</p>
          <p><strong>${data.companyName}</strong> has invited you to complete a leadership assessment.</p>
          
          <p><strong>Company:</strong> ${data.companyName}</p>
          ${data.roleTag ? `<p><strong>Role:</strong> ${data.roleTag}</p>` : ''}
          
          <div style="margin: 30px 0; text-align: left;">
            <a href="${inviteUrl}" 
               style="background-color: #6B8E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Start Your Assessment Here
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Assessment Details:</strong><br>
            • Estimated Duration: 20-35 minutes<br>
            • This link expires in 7 days<br>
            • You can access the assessment multiple times, but can only submit once
          </p>
          
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The ${data.companyName} Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            This assessment is powered by OlivinHR. 
            <a href="https://olivinhr.com" style="color: #6B8E23;" target="_blank" rel="noopener noreferrer">Click here to learn more about OlivinHR</a>
          </p>
          <p style="font-size: 12px; color: #999;">
            If you face any issues please contact <a href="mailto:info@olivinhr.com" style="color: #6B8E23;">info@olivinhr.com</a>
          </p>
        </div>
      `,
    };
    
    await sgMail.send(msg);
    console.log('✅ [SendGrid] Email sent successfully to:', data.candidateEmail);
    
  } catch (error) {
    console.error('🚨 [SendGrid] Error sending email:', error);
    throw error;
  }
}

// Simulate analytics event logging
function logAnalyticsEvent(eventName: string, eventData: Record<string, any>) {
  console.log(`📊 [Analytics] Event: ${eventName}`, eventData);
  // In a real implementation, this would send to Firebase Analytics, Google Analytics, etc.
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [SendInvite API] Request received:', req.method, req.url);
  
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
    console.log('🔍 [SendInvite API] Origin:', origin);
    
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [SendInvite API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [SendInvite API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate request data
    const { candidateEmail, projectId, hrId } = req.body || {};

    if (!candidateEmail || !projectId || !hrId) {
      console.log('❌ [SendInvite API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'candidateEmail, projectId, and hrId are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      console.log('❌ [SendInvite API] Invalid email format:', candidateEmail);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [SendInvite API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Verify HR user has admin role
    const hrUser = await verifyHrUserRole(hrId, ['admin']);
    const companyId = hrUser.companyId;

    console.log(`✅ [SendInvite API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [SendInvite API] Step 2: Checking company license...');
    
    // Step 2: Fetch company and check license availability
    const companyDoc = await db.collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      console.log('❌ [SendInvite API] Company not found:', companyId);
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const companyData = companyDoc.data();
    const licenseCount = companyData?.licenseCount || 0;
    const usedLicensesCount = companyData?.usedLicensesCount || 0;
    const availableLicenses = licenseCount - usedLicensesCount;

    console.log(`📊 [SendInvite API] License status - Total: ${licenseCount}, Used: ${usedLicensesCount}, Available: ${availableLicenses}`);

    if (availableLicenses <= 0) {
      console.log('❌ [SendInvite API] License limit reached');
      return res.status(429).json({
        success: false,
        error: 'License limit reached'
      });
    }

    console.log('🔄 [SendInvite API] Step 3: Creating invite...');
    
    // Step 3: Generate unique token and create invite
    const token = uuidv4().replace(/-/g, '');
    const inviteId = uuidv4();
    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days from now

    const inviteData = {
      id: inviteId,
      candidateEmail,
      projectId,
      companyId,
      token,
      status: 'pending',
      timestamp: now,
      expiresAt,
      result: {},
      sentBy: hrId
    };

    // Use Firestore transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Create the invite
      const inviteRef = db.collection('invites').doc(inviteId);
      transaction.set(inviteRef, inviteData);

      // Increment used licenses count
      const companyRef = db.collection('companies').doc(companyId);
      transaction.update(companyRef, {
        usedLicensesCount: usedLicensesCount + 1
      });
    });

    console.log('🔄 [SendInvite API] Step 4: Sending email...');
    
    // Step 4: Send invitation email
    await sendInvitationEmail({
      candidateEmail,
      token,
      projectId,
      companyName: companyData?.name || 'Company',
      roleTag: req.body.roleTag
    });

    // Log analytics event
    logAnalyticsEvent('invite_sent', {
      inviteId,
      candidateEmail,
      projectId,
      companyId,
      hrId,
      hrRole: hrUser.role,
      timestamp: now
    });

    console.log('✅ [SendInvite API] Invite created and email sent successfully');

    // Success response
    return res.status(201).json({
      success: true,
      invite: {
        id: inviteId,
        candidateEmail,
        token,
        status: 'pending',
        projectId,
        companyId,
        timestamp: now,
        expiresAt
      }
    });

  } catch (error: any) {
    console.error('🚨 [SendInvite API] Error:', error);
    
    // Make sure we set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', 'https://app.olivinhr.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
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
      error: error?.message || 'Failed to create invite and send email'
    });
  }
} 