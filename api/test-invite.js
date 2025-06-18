module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const envCheck = {
      VITE_FIREBASE_API_KEY: !!process.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: !!process.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: !!process.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: !!process.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: !!process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: !!process.env.VITE_FIREBASE_APP_ID
    };

    return res.status(200).json({
      message: 'Invite API test endpoint working',
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: req.headers,
      body: req.body,
      environmentVariables: envCheck,
      nodeVersion: process.version
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      error: 'Test endpoint failed',
      details: error.message,
      stack: error.stack
    });
  }
}; 