import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token is required' 
      });
    }

    // For now, return a simple validation response
    // In production, this would validate against Firebase
    const isValidFormat = token.length >= 8 && /^[a-f0-9]+$/i.test(token);
    
    if (!isValidFormat) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid token format' 
      });
    }

    // Return mock success response
    return res.status(200).json({
      valid: true,
      gameId: 'leadership-scenario',
      candidateEmail: 'test@example.com'
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Internal server error' 
    });
  }
} 