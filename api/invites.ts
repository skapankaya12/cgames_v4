import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CreateInviteRequest, CreateInviteResponse } from '@cgames/types';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Import server-side services directly
import { InviteService } from '@cgames/services/invite-service';
import { SendGridService } from '@cgames/services/sendgrid-service';
import { authenticateRequest, hasPermission } from '@cgames/services/auth-utils-server';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

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
      // Authenticate and authorize user
      const authContext = await authenticateRequest(req);
      
      if (!hasPermission(authContext.hrUser.role, 'invite')) {
        res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to send invites' 
        });
        return;
      }

      const { email, projectId, roleTag }: CreateInviteRequest = req.body;

      if (!email) {
        res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid email format' 
        });
        return;
      }

      // Create the invite
      console.log('🔄 [Invite API] Creating invite for:', email);
      const invite = await InviteService.createInvite({
        candidateEmail: email,
        sentBy: authContext.uid,
        projectId,
        roleTag
      });
      console.log('✅ Invite created:', invite.id, { 
        candidateEmail: invite.candidateEmail, 
        token: invite.token?.substring(0, 8) + '...', 
        status: invite.status 
      });

      // Get company name for email
      const companyDoc = await db.collection('companies').doc(authContext.hrUser.companyId).get();
      const companyName = companyDoc.exists ? companyDoc.data()?.name : 'Company';
      console.log('🏢 Company name for email:', companyName);

      // Send invitation email
      console.log('📧 Attempting to send email to:', email);
      try {
        await SendGridService.sendInvitationEmail({
          candidateEmail: email,
          token: invite.token,
          projectId,
          roleTag,
          companyName
        });
        console.log('✉️ Email sent successfully to', email);
      } catch (emailError) {
        console.error('🚨 SendGridService error:', emailError);
        throw emailError; // Re-throw to handle in outer catch
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

      res.status(201).json(response);
    } catch (error) {
      console.error('🚨 [Invite API] Authentication or processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
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
      
      if (errorMessage.includes('HR user not found')) {
        res.status(404).json({ 
          success: false, 
          error: 'User profile not found. Please contact your administrator.' 
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

      // Return appropriate status code based on error type
      if (errorMessage.includes('No licenses remaining')) {
        res.status(402).json({ 
          success: false, 
          error: errorMessage 
        }); // Payment required
      } else if (errorMessage.includes('not found')) {
        res.status(404).json({ 
          success: false, 
          error: errorMessage 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: errorMessage 
        });
      }
    }
  } catch (outerError) {
    // This catches any errors that happen before we can set up proper error handling
    console.error('🚨 [Invite API] Critical error:', outerError);
    
    // Ensure CORS headers are set even for critical errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 