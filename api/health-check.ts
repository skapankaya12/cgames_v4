import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🏥 [Health Check] Request received');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const healthData = {
      success: true,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent']?.substring(0, 50),
        'content-type': req.headers['content-type']
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: Boolean(process.env.VERCEL),
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_REGION: process.env.VERCEL_REGION,
      },
      message: 'Health check passed - basic function is working'
    };

    console.log('✅ [Health Check] Responding with health data');
    res.status(200).json(healthData);
    
  } catch (error) {
    console.error('🚨 [Health Check] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 