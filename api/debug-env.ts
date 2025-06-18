import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const checkVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY',
    'SENDGRID_API_KEY',
    'NODE_ENV'
  ];

  const status = checkVars.map(name => ({
    name,
    exists: !!process.env[name],
    length: process.env[name]?.length || 0,
    starts: process.env[name]?.substring(0, 20) || 'N/A'
  }));

  res.json({
    message: 'Environment Variable Debug',
    timestamp: new Date().toISOString(),
    variables: status
  });
} 