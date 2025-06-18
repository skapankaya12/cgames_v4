import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
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
    console.log('🔔 [Test API] handler invoked');
    console.log('   Method:', req.method);
    console.log('   ENV check:');
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    console.log('   - SENDGRID_API_KEY:', Boolean(process.env.SENDGRID_API_KEY));
    console.log('   - FIREBASE_PROJECT_ID:', Boolean(process.env.FIREBASE_PROJECT_ID));
    console.log('   - FIREBASE_CLIENT_EMAIL:', Boolean(process.env.FIREBASE_CLIENT_EMAIL));
    console.log('   - FIREBASE_PRIVATE_KEY:', Boolean(process.env.FIREBASE_PRIVATE_KEY));

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Test API] Handling OPTIONS preflight request');
      res.status(200).end();
      return;
    }

    // Test Firebase Admin import
    try {
      console.log('🔄 [Test API] Testing Firebase Admin import...');
      const { initializeApp, getApps } = await import('firebase-admin/app');
      console.log('✅ [Test API] Firebase Admin import successful');
      console.log('   Apps already initialized:', getApps().length);
    } catch (error) {
      console.error('❌ [Test API] Firebase Admin import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Firebase Admin import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }

    // Test SendGrid import
    try {
      console.log('🔄 [Test API] Testing SendGrid import...');
      const sgMail = (await import('@sendgrid/mail')).default;
      console.log('✅ [Test API] SendGrid import successful');
    } catch (error) {
      console.error('❌ [Test API] SendGrid import failed:', error);
      res.status(500).json({
        success: false,
        error: 'SendGrid import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }

    // Test Services import
    try {
      console.log('🔄 [Test API] Testing Services import...');
      const { authenticateRequest } = await import('@cgames/services/auth-utils-server');
      console.log('✅ [Test API] Services import successful');
    } catch (error) {
      console.error('❌ [Test API] Services import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Services import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'All tests passed!',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: Boolean(process.env.FIREBASE_PROJECT_ID),
        hasSendGridConfig: Boolean(process.env.SENDGRID_API_KEY),
      }
    });

  } catch (outerError) {
    console.error('🚨 [Test API] Critical error:', outerError);
    
    // Ensure CORS headers are set even for critical errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    res.status(500).json({
      success: false,
      error: 'Critical error in test function',
      details: outerError instanceof Error ? outerError.message : 'Unknown error'
    });
  }
} 