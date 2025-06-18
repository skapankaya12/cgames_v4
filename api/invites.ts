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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Invites API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Invites API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Invites API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    console.log('📨 [Invites API] Processing POST request');
    console.log('📨 [Invites API] Request body:', req.body);

    // Extract request data
    const { email, projectId, roleTag } = req.body || {};

    // Validate email
    if (!email) {
      console.log('❌ [Invites API] Missing email');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [Invites API] Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Initialize Firebase
    initializeFirebase();

    // Create invite in database
    console.log('🔄 [Invites API] Creating invite in database...');
    const invite = await createInvite({
      candidateEmail: email,
      sentBy: 'system', // In a real app, this would come from the authenticated user
      projectId: projectId || '',
      roleTag: roleTag || 'candidate'
    });

    // Send invitation email
    console.log('📧 [Invites API] Sending invitation email...');
    await sendInvitationEmail({
      candidateEmail: email,
      token: invite.token,
      projectId: projectId || '',
      roleTag: roleTag || 'candidate',
      companyName: 'OlivinHR'
    });

    console.log('✅ [Invites API] Invite created and email sent successfully');

    // Success response
    const response: CreateInviteResponse = {
      success: true,
      invite: invite
    };

    return res.status(201).json(response);

  } catch (error: any) {
    console.error('🚨 [Invites API] Error:', error);
    
    // Don't show successful fallback - show the actual error
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create invite and send email'
    });
  }
} 