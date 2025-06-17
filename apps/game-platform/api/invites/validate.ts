import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ValidateInviteResponse {
  success: boolean;
  invite?: {
    id: string;
    candidateEmail: string;
    projectId: string;
    roleTag: string;
    gameId?: string;
    companyId: string;
  };
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🔔 [Validate API] handler invoked');
  console.log('   Method:', req.method);
  console.log('   Query params:', req.query);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.log('❌ [Validate API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: 'Token parameter is required' 
      });
      return;
    }

    console.log('🔍 [Validate API] Validating token:', token?.substring(0, 8) + '...');

    // For now, return a mock validation response
    // This will be replaced with actual Firebase validation once deployment works
    const isValidFormat = token.length >= 8 && /^[a-f0-9]+$/i.test(token);
    
    if (!isValidFormat) {
      res.status(404).json({ 
        success: false, 
        error: 'Invalid invite token' 
      });
      return;
    }

    console.log('✅ [Validate API] Token validated (mock)');

    const response: ValidateInviteResponse = {
      success: true,
      invite: {
        id: 'mock-invite-id',
        candidateEmail: 'test@example.com',
        projectId: 'mock-project-id',
        roleTag: 'candidate',
        gameId: 'leadership-scenario',
        companyId: 'mock-company-id'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error validating invite:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const response: ValidateInviteResponse = {
      success: false,
      error: errorMessage
    };

    res.status(500).json(response);
  }
} 