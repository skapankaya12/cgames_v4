import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Test Projects API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Test Projects API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    console.log('🔍 [Test Projects API] Environment variables check:');
    console.log('- FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
    console.log('- FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log('- FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);

    // Simple success response
    return res.status(200).json({
      success: true,
      message: 'Test endpoint working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID
      }
    });

  } catch (error: any) {
    console.error('🚨 [Test Projects API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Test endpoint failed',
      stack: error?.stack
    });
  }
} 