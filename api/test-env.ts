import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY',
    'SENDGRID_API_KEY'
  ];

  const envStatus = requiredEnvVars.map(varName => ({
    name: varName,
    present: !!process.env[varName],
    hasValue: process.env[varName] ? 'Yes (****)' : 'No'
  }));

  res.json({
    success: true,
    message: 'Environment Variables Status',
    environment: process.env.NODE_ENV || 'development',
    variables: envStatus,
    allRequired: envStatus.every(v => v.present)
  });
} 