import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const firebaseEnvVars = {
    'VITE_FIREBASE_API_KEY': !!process.env.VITE_FIREBASE_API_KEY,
    'VITE_FIREBASE_AUTH_DOMAIN': !!process.env.VITE_FIREBASE_AUTH_DOMAIN,
    'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID || 'NOT_SET',
    'VITE_FIREBASE_STORAGE_BUCKET': !!process.env.VITE_FIREBASE_STORAGE_BUCKET,
    'VITE_FIREBASE_MESSAGING_SENDER_ID': !!process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    'VITE_FIREBASE_APP_ID': !!process.env.VITE_FIREBASE_APP_ID,
    
    // Server-side vars
    'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
    'FIREBASE_CLIENT_EMAIL': !!process.env.FIREBASE_CLIENT_EMAIL,
    'FIREBASE_PRIVATE_KEY': !!process.env.FIREBASE_PRIVATE_KEY,
    'SENDGRID_API_KEY': !!process.env.SENDGRID_API_KEY
  };

  res.json({
    message: 'Firebase Configuration Debug',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: firebaseEnvVars,
    troubleshooting: {
      commonIssues: [
        '400 Bad Request usually means Firebase Security Rules are blocking access',
        'Check if Firestore Security Rules allow read/write access',
        'Verify all VITE_ environment variables have correct values',
        'Ensure Firebase project exists and is active'
      ],
      nextSteps: [
        '1. Check Firebase Console → Firestore → Rules',
        '2. Temporarily set rules to allow read, write if needed',
        '3. Verify environment variable values match Firebase Console'
      ]
    }
  });
} 