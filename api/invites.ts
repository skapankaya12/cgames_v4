import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Type definitions
interface CreateInviteRequest {
  email: string;
  projectId?: string;
  roleTag?: string;
}

interface CreateInviteResponse {
  success: boolean;
  error?: string;
  invite?: {
    id: string;
    candidateEmail: string;
    token: string;
    status: string;
    sentAt: number;
    projectId?: string;
    roleTag?: string;
  };
}

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

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

/**
 * Safely set response headers
 */
function setResponseHeaders(res: VercelResponse, headers: Record<string, string>) {
  try {
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  } catch (headerError) {
    console.error('🚨 [Headers] Failed to set headers:', headerError);
  }
}

/**
 * Safely send JSON response
 */
function sendJsonResponse(res: VercelResponse, statusCode: number, data: any) {
  try {
    if (res.headersSent) {
      console.log('⚠️ [Response] Headers already sent, cannot send response');
      return;
    }
    
    setResponseHeaders(res, corsHeaders);
    res.status(statusCode).json(data);
  } catch (responseError) {
    console.error('🚨 [Response] Failed to send JSON response:', responseError);
    // Last resort - try to send a basic error
    try {
      if (!res.headersSent) {
        res.status(500).end('Internal Server Error');
      }
    } catch (finalError) {
      console.error('🚨 [Response] Complete failure to send response:', finalError);
    }
  }
}

/**
 * Verify Firebase ID token
 */
async function verifyAuthToken(token: string): Promise<{ uid: string }> {
  if (!token) {
    throw new Error('Missing or invalid authorization header');
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Get HR user data from Firestore
 */
async function getHrUser(uid: string) {
  const db = getFirestore();
  const hrDoc = await db.collection('hrUsers').doc(uid).get();
  
  if (!hrDoc.exists) {
    throw new Error('HR user not found');
  }
  
  return hrDoc.data();
}

/**
 * Check if user has required permission
 */
function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions: { [key: string]: string[] } = {
    admin: ['invite', 'view', 'manage'],
    manager: ['invite', 'view'],
    user: ['view'],
  };
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

/**
 * Create a new invite in the database
 */
async function createInvite(data: {
  candidateEmail: string;
  sentBy: string;
  projectId?: string;
  roleTag?: string;
}) {
  console.log('🔄 [CreateInvite] Starting invite creation for:', data.candidateEmail);
  
  try {
    const db = getFirestore();
    
    // Generate UUID-like ID
    const inviteId = 'invite_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const token = Math.random().toString(36).substr(2, 32); // Simple token generation
    
    const invite = {
      id: inviteId,
      candidateEmail: data.candidateEmail,
      token,
      status: 'pending' as const,
      sentAt: Date.now(),
      sentBy: data.sentBy,
      projectId: data.projectId || '',
      roleTag: data.roleTag || 'candidate',
      companyId: 'default',
    };

    console.log('💾 [CreateInvite] Saving invite to Firestore:', inviteId);
    // Save to Firestore
    await db.collection('invites').doc(inviteId).set(invite);
    
    console.log('✅ [CreateInvite] Invite created successfully:', inviteId);
    return invite;
  } catch (error) {
    console.error('🚨 [CreateInvite] Error creating invite:', error);
    throw error;
  }
}

/**
 * Send invitation email using SendGrid
 */
async function sendInvitationEmail(data: {
  candidateEmail: string;
  token: string;
  projectId?: string;
  roleTag?: string;
  companyName: string;
}) {
  console.log('📧 [SendGridService] Starting email send to:', data.candidateEmail);
  
  try {
    console.log('📦 [SendGridService] Importing @sendgrid/mail...');
    const sgMail = (await import('@sendgrid/mail')).default;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    console.log('🔑 [SendGridService] Setting SendGrid API key...');
    sgMail.setApiKey(apiKey);
    
    const gameBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://cgames-game-platform.vercel.app'
      : 'http://localhost:5174';
    
    const inviteUrl = `${gameBaseUrl}?token=${data.token}`;
    
    console.log('✉️ [SendGridService] Preparing email message...');
    const msg = {
      to: data.candidateEmail,
      from: 'noreply@olivinhr.com',
      subject: `${data.companyName} Assessment Invitation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're Invited to Complete an Assessment</h2>
          <p>Hello,</p>
          <p>${data.companyName} has invited you to complete a leadership assessment.</p>
          <p><strong>Role:</strong> ${data.roleTag}</p>
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Assessment
            </a>
          </div>
          <p>This link is unique to you and can only be used once.</p>
          <p>Best regards,<br>The ${data.companyName} Team</p>
        </div>
      `,
    };
    
    console.log('🚀 [SendGridService] Sending email via SendGrid...');
    await sgMail.send(msg);
    console.log('✅ [SendGridService] Email sent successfully to:', data.candidateEmail);
    
  } catch (error) {
    console.error('🚨 [SendGridService] Error sending email:', error);
    throw error;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🚀 [Invite API] === HANDLER START ===');
  console.log('🔔 [Invite API] Method:', req.method);
  console.log('🔔 [Invite API] URL:', req.url);

  // Always set CORS headers first
  setResponseHeaders(res, corsHeaders);

  try {
    // Log environment variables availability
    console.log('🔍 [Invite API] Environment Check:');
    console.log('   • NODE_ENV:', process.env.NODE_ENV);
    console.log('   • VERCEL:', process.env.VERCEL);
    console.log('   • SENDGRID_API_KEY present:', Boolean(process.env.SENDGRID_API_KEY));
    console.log('   • FIREBASE_PROJECT_ID present:', Boolean(process.env.FIREBASE_PROJECT_ID));
    console.log('   • FIREBASE_CLIENT_EMAIL present:', Boolean(process.env.FIREBASE_CLIENT_EMAIL));
    console.log('   • FIREBASE_PRIVATE_KEY present:', Boolean(process.env.FIREBASE_PRIVATE_KEY));

    // Log request details
    console.log('📋 [Invite API] Request Details:');
    console.log('   • Headers:', {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']?.substring(0, 50)
    });
    console.log('   • Body:', req.body);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Invite API] Handling OPTIONS preflight request');
      return sendJsonResponse(res, 200, { success: true });
    }

    // Only allow POST requests (after OPTIONS)
    if (req.method !== 'POST') {
      console.log('❌ [Invite API] Method not allowed:', req.method);
      return sendJsonResponse(res, 405, { success: false, error: 'Method not allowed' });
    }

    // Initialize Firebase (with enhanced error handling)
    console.log('🔥 [Invite API] Initializing Firebase...');
    try {
      initializeFirebase();
      console.log('✅ [Invite API] Firebase initialized successfully');
    } catch (firebaseError) {
      console.error('🚨 [Invite API] Firebase initialization failed:', firebaseError);
      return sendJsonResponse(res, 500, { 
        success: false, 
        error: 'Server configuration error - Firebase initialization failed' 
      });
    }

    // Process the invite request
    try {
      // Authenticate user
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ [Invite API] Missing or invalid authorization header');
        return sendJsonResponse(res, 401, {
          success: false,
          error: 'Authentication required'
        });
      }

      const token = authHeader.substring(7);
      console.log('🔐 [Invite API] Verifying auth token...');
      const { uid } = await verifyAuthToken(token);
      console.log('✅ [Invite API] Auth token verified for user:', uid);
      
      // Get HR user data
      let hrUser;
      try {
        console.log('👤 [Invite API] Fetching HR user data...');
        hrUser = await getHrUser(uid);
        console.log('✅ [Invite API] HR user found:', hrUser.email);
      } catch (error) {
        if (error instanceof Error && error.message.includes('HR user not found')) {
          // Auto-initialize HR user
          console.log('🔄 [Invite API] Auto-initializing HR user for:', uid);
          
          const auth = getAuth();
          const userRecord = await auth.getUser(uid);
          
          // Create default company if it doesn't exist
          const db = getFirestore();
          const defaultCompanyId = 'default-company';
          const companyDoc = await db.collection('companies').doc(defaultCompanyId).get();
          
          if (!companyDoc.exists) {
            console.log('🏢 [Invite API] Creating default company...');
            await db.collection('companies').doc(defaultCompanyId).set({
              id: defaultCompanyId,
              name: 'Default Company',
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }

          // Create HR user record
          const hrUserData = {
            uid,
            email: userRecord.email || '',
            role: 'admin',
            companyId: defaultCompanyId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'HR User',
          };

          await db.collection('hrUsers').doc(uid).set(hrUserData);
          hrUser = hrUserData;
          
          console.log('✅ [Invite API] HR user auto-initialized');
        } else {
          console.error('🚨 [Invite API] Error getting HR user:', error);
          throw error;
        }
      }
      
      if (!hasPermission(hrUser?.role || 'user', 'invite')) {
        console.log('❌ [Invite API] Insufficient permissions for user role:', hrUser?.role);
        return sendJsonResponse(res, 403, { 
          success: false, 
          error: 'Insufficient permissions to send invites' 
        });
      }

      const { email, projectId, roleTag }: CreateInviteRequest = req.body;

      if (!email) {
        console.log('❌ [Invite API] Missing email in request body');
        return sendJsonResponse(res, 400, { 
          success: false, 
          error: 'Email is required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ [Invite API] Invalid email format:', email);
        return sendJsonResponse(res, 400, { 
          success: false, 
          error: 'Invalid email format' 
        });
      }

      // Create the invite
      console.log('🔄 [Invite API] Creating invite for:', email);
      const invite = await createInvite({
        candidateEmail: email,
        sentBy: uid,
        projectId,
        roleTag
      });
      console.log('✅ [Invite API] Invite created:', invite.id);

      // Get company name for email
      const db = getFirestore();
      const companyDoc = await db.collection('companies').doc(hrUser?.companyId || 'default-company').get();
      const companyName = companyDoc.exists ? companyDoc.data()?.name : 'Company';

      // Send invitation email
      console.log('📧 [Invite API] Attempting to send email to:', email);
      try {
        await sendInvitationEmail({
          candidateEmail: email,
          token: invite.token,
          projectId,
          roleTag,
          companyName
        });
        console.log('✉️ [Invite API] Email sent successfully to', email);
      } catch (emailError) {
        console.error('🚨 [Invite API] SendGrid error:', emailError);
        
        // Don't fail the whole request if email fails, but log it
        console.log('⚠️ [Invite API] Continuing despite email failure - invite still created');
      }

      const response: CreateInviteResponse = {
        success: true,
        invite: {
          id: invite.id,
          candidateEmail: invite.candidateEmail,
          token: invite.token,
          status: invite.status,
          sentAt: invite.sentAt,
          projectId: invite.projectId,
          roleTag: invite.roleTag
        }
      };

      console.log('✅ [Invite API] Request completed successfully');
      return sendJsonResponse(res, 201, response);
      
    } catch (innerError) {
      console.error('🚨 [Invite API] Processing error:', innerError);
      
      const errorMessage = innerError instanceof Error ? innerError.message : 'Unknown error occurred';
      
      // Handle specific authentication errors
      if (errorMessage.includes('Missing or invalid authorization header')) {
        return sendJsonResponse(res, 401, { 
          success: false, 
          error: 'Authentication required' 
        });
      }
      
      if (errorMessage.includes('Invalid authentication token')) {
        return sendJsonResponse(res, 401, { 
          success: false, 
          error: 'Invalid authentication token' 
        });
      }
      
      if (errorMessage.includes('Missing required environment variable')) {
        return sendJsonResponse(res, 500, { 
          success: false, 
          error: 'Server configuration error' 
        });
      }
      
      if (errorMessage.includes('SENDGRID_API_KEY')) {
        return sendJsonResponse(res, 500, { 
          success: false, 
          error: 'Email service not configured' 
        });
      }

      return sendJsonResponse(res, 500, { 
        success: false, 
        error: errorMessage 
      });
    }
  } catch (outerError) {
    console.error('🚨 [Invite API] === CRITICAL OUTER ERROR ===');
    console.error('🚨 [Invite API] Error type:', typeof outerError);
    console.error('🚨 [Invite API] Error name:', outerError instanceof Error ? outerError.name : 'Unknown');
    console.error('🚨 [Invite API] Error message:', outerError instanceof Error ? outerError.message : String(outerError));
    console.error('🚨 [Invite API] Error stack:', outerError instanceof Error ? outerError.stack : 'No stack trace');
    
    // Final fallback response
    return sendJsonResponse(res, 500, { 
      success: false, 
      error: outerError instanceof Error ? outerError.message : 'Internal server error'
    });
  } finally {
    console.log('🏁 [Invite API] === HANDLER END ===');
  }
} 