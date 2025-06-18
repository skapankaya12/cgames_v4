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

// Initialize Firebase on startup
initializeFirebase();

const db = getFirestore();

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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

  // Save to Firestore
  await db.collection('invites').doc(inviteId).set(invite);
  
  return invite;
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
  console.log('📧 [SendGridService] Sending invitation email to:', data.candidateEmail);
  
  try {
    const sgMail = (await import('@sendgrid/mail')).default;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    sgMail.setApiKey(apiKey);
    
    const gameBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://cgames-game-platform.vercel.app'
      : 'http://localhost:5174';
    
    const inviteUrl = `${gameBaseUrl}?token=${data.token}`;
    
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
  // Set CORS headers for all requests first
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    console.log('🔔 [Invite API] handler invoked');
    console.log('   Method:', req.method);
    console.log('   Headers:', {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin
    });
    console.log('   Body:', req.body);
    console.log('   ENV • SENDGRID_API_KEY is set?', Boolean(process.env.SENDGRID_API_KEY));
    console.log('   ENV • FIREBASE_PROJECT_ID is set?', Boolean(process.env.FIREBASE_PROJECT_ID));

    // Ensure Firebase is initialized
    initializeFirebase();

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Invite API] Handling OPTIONS preflight request');
      res.status(200).end();
      return;
    }

    // Only allow POST requests (after OPTIONS)
    if (req.method !== 'POST') {
      console.log('❌ [Invite API] Method not allowed:', req.method);
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      // Authenticate user
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ [Invite API] Missing or invalid authorization header');
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
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
        res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to send invites' 
        });
        return;
      }

      const { email, projectId, roleTag }: CreateInviteRequest = req.body;

      if (!email) {
        console.log('❌ [Invite API] Missing email in request body');
        res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ [Invite API] Invalid email format:', email);
        res.status(400).json({ 
          success: false, 
          error: 'Invalid email format' 
        });
        return;
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
      res.status(201).json(response);
      
    } catch (innerError) {
      console.error('🚨 [Invite API] Processing error:', innerError);
      
      const errorMessage = innerError instanceof Error ? innerError.message : 'Unknown error occurred';
      
      // Handle specific authentication errors
      if (errorMessage.includes('Missing or invalid authorization header')) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }
      
      if (errorMessage.includes('Invalid authentication token')) {
        res.status(401).json({ 
          success: false, 
          error: 'Invalid authentication token' 
        });
        return;
      }
      
      if (errorMessage.includes('Missing required environment variable')) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error' 
        });
        return;
      }
      
      if (errorMessage.includes('SENDGRID_API_KEY')) {
        res.status(500).json({ 
          success: false, 
          error: 'Email service not configured' 
        });
        return;
      }

      res.status(500).json({ 
        success: false, 
        error: errorMessage 
      });
    }
  } catch (outerError) {
    console.error('🚨 [Invite API] Critical error in outer handler:', outerError);
    
    // Ensure CORS headers are set even on error
    Object.entries(corsHeaders).forEach(([key, value]) => {
      try {
        res.setHeader(key, value);
      } catch (headerError) {
        console.error('Failed to set header:', headerError);
      }
    });
    
    try {
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: outerError instanceof Error ? outerError.message : 'Internal server error'
        });
      }
    } catch (responseError) {
      console.error('🚨 [Invite API] Failed to send error response:', responseError);
    }
  }
} 