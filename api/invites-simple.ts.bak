export default function handler(req: any, res: any) {
  console.log('🚀 [Simple Invite API] === HANDLER START ===');
  console.log('🔔 [Simple Invite API] Method:', req.method);
  console.log('🔔 [Simple Invite API] URL:', req.url);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json');

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

    // Log request details
    console.log('📋 [Simple Invite API] Request Details:');
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

  } catch (error: any) {
    console.error('🚨 [Simple Invite API] === ERROR ===');
    console.error('🚨 [Simple Invite API] Error message:', error?.message || 'Unknown error');
    
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Internal server error'
    });
  } finally {
    console.log('🏁 [Simple Invite API] === HANDLER END ===');
  }
} 