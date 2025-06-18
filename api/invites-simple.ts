import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🚀 [Simple Invite API] === HANDLER START ===');
  console.log('🔔 [Simple Invite API] Method:', req.method);
  console.log('🔔 [Simple Invite API] URL:', req.url);

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Simple Invite API] Handling OPTIONS preflight request');
      res.status(200).json({ success: true });
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Simple Invite API] Method not allowed:', req.method);
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Log environment variables
    console.log('🔍 [Simple Invite API] Environment Check:');
    console.log('   • NODE_ENV:', process.env.NODE_ENV);
    console.log('   • VERCEL:', process.env.VERCEL);
    console.log('   • SENDGRID_API_KEY present:', Boolean(process.env.SENDGRID_API_KEY));
    console.log('   • FIREBASE_PROJECT_ID present:', Boolean(process.env.FIREBASE_PROJECT_ID));

    // Log request details
    console.log('📋 [Simple Invite API] Request Details:');
    console.log('   • Headers:', {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin
    });
    console.log('   • Body:', req.body);

    // Basic validation
    const { email, projectId, roleTag } = req.body || {};

    if (!email) {
      console.log('❌ [Simple Invite API] Missing email in request body');
      res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [Simple Invite API] Invalid email format:', email);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
      return;
    }

    // Mock invite creation (no Firebase/SendGrid for now)
    const inviteId = 'invite_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const token = Math.random().toString(36).substr(2, 32);
    
    const mockInvite = {
      id: inviteId,
      candidateEmail: email,
      token,
      status: 'pending',
      sentAt: Date.now(),
      projectId: projectId || '',
      roleTag: roleTag || 'candidate'
    };

    console.log('✅ [Simple Invite API] Mock invite created:', inviteId);

    // Success response
    res.status(201).json({
      success: true,
      invite: mockInvite,
      message: 'Mock invite created successfully (no email sent)'
    });

  } catch (error) {
    console.error('🚨 [Simple Invite API] === ERROR ===');
    console.error('🚨 [Simple Invite API] Error type:', typeof error);
    console.error('🚨 [Simple Invite API] Error message:', error instanceof Error ? error.message : String(error));
    console.error('🚨 [Simple Invite API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  } finally {
    console.log('🏁 [Simple Invite API] === HANDLER END ===');
  }
} 