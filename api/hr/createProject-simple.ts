import type { VercelRequest, VercelResponse } from '@vercel/node';

// Temporarily disable Firebase for testing
// import { initializeApp, getApps, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🚀 [Create Project API] Request received:', req.method, req.url);
    
    // Set CORS headers for cross-origin requests from app.olivinhr.com
    const allowedOrigins = new Set([
      'https://app.olivinhr.com',
      'https://game.olivinhr.com',
      'https://cgames-v4-hr-platform.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ]);

    const origin = (req.headers.origin as string) || '';
    console.log('🔍 [Create Project API] Origin:', origin);
    
    // Always set CORS headers for cross-origin requests
    const allowOrigin = allowedOrigins.has(origin) ? origin : 'https://app.olivinhr.com';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Create Project API] Handling OPTIONS request');
      // No body for preflight; 204 avoids some proxies complaining
      return res.status(204).end();
    }

    // For testing: return a simple response for any method
    return res.status(200).json({
      success: true,
      message: 'API endpoint is working - Firebase temporarily disabled for testing',
      method: req.method,
      timestamp: new Date().toISOString(),
      origin: req.headers.origin
    });

  } catch (error: any) {
    console.error('🚨 [Create Project API] Error:', error);
    
    // Make sure we set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', 'https://app.olivinhr.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create project'
    });
  }
}