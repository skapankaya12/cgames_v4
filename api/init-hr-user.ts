import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { verifyAuthToken } from '@cgames/services/auth-utils-server';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    console.log('🔔 [Init HR User API] handler invoked');
    console.log('   Method:', req.method);
    console.log('   Headers:', {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING',
    });

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Init HR User API] Handling OPTIONS preflight request');
      res.status(200).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Init HR User API] Method not allowed:', req.method);
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const token = authHeader.substring(7);
    const { uid } = await verifyAuthToken(token);

    // Get Firebase user data
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    const userRecord = await auth.getUser(uid);

    console.log('🔄 [Init HR User API] Creating HR user for:', userRecord.email);

    // Check if HR user already exists
    const existingHrDoc = await db.collection('hrUsers').doc(uid).get();
    
    if (existingHrDoc.exists) {
      console.log('✅ [Init HR User API] HR user already exists');
      res.status(200).json({
        success: true,
        message: 'HR user already exists',
        user: existingHrDoc.data()
      });
      return;
    }

    // Create default company if it doesn't exist
    const defaultCompanyId = 'default-company';
    const companyDoc = await db.collection('companies').doc(defaultCompanyId).get();
    
    if (!companyDoc.exists) {
      await db.collection('companies').doc(defaultCompanyId).set({
        id: defaultCompanyId,
        name: 'Default Company',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log('🏢 [Init HR User API] Created default company');
    }

    // Create HR user record
    const hrUserData = {
      uid,
      email: userRecord.email || '',
      role: 'admin', // Give admin role for testing
      companyId: defaultCompanyId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'HR User',
    };

    await db.collection('hrUsers').doc(uid).set(hrUserData);

    console.log('✅ [Init HR User API] HR user created successfully');

    res.status(201).json({
      success: true,
      message: 'HR user created successfully',
      user: hrUserData
    });

  } catch (error) {
    console.error('🚨 [Init HR User API] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
} 