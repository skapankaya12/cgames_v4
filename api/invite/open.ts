import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      console.log('🔥 [Firebase] Initializing Firebase Admin...');
      
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      };

      // Check if all required environment variables are present
      for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      // Type assertion since we've validated all values exist above
      const validatedEnvVars = requiredEnvVars as {
        FIREBASE_PROJECT_ID: string;
        FIREBASE_CLIENT_EMAIL: string;
        FIREBASE_PRIVATE_KEY: string;
      };

      initializeApp({
        credential: cert({
          projectId: validatedEnvVars.FIREBASE_PROJECT_ID,
          clientEmail: validatedEnvVars.FIREBASE_CLIENT_EMAIL,
          privateKey: validatedEnvVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      
      firebaseInitialized = true;
      console.log('✅ [Firebase] Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 [Firebase] Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

// Simulate analytics event logging
function logAnalyticsEvent(eventName: string, eventData: Record<string, any>) {
  console.log(`📊 [Analytics] Event: ${eventName}`, eventData);
  // In a real implementation, this would send to Firebase Analytics, Google Analytics, etc.
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Invite Open API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Invite Open API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Allow both GET and POST requests for flexibility
    if (req.method !== 'GET' && req.method !== 'POST') {
      console.log('❌ [Invite Open API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Get token from query params or request body
    const token = req.method === 'GET' ? req.query.token : req.body?.token;

    if (!token || typeof token !== 'string') {
      console.log('❌ [Invite Open API] Token parameter is required');
      return res.status(400).json({
        success: false,
        error: 'Token parameter is required'
      });
    }

    console.log('🔄 [Invite Open API] Processing token:', token.substring(0, 8) + '...');

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    // Find the invite by token
    console.log('🔄 [Invite Open API] Looking up invite by token...');
    const query = db.collection('invites').where('token', '==', token).limit(1);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('❌ [Invite Open API] Token not found');
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid invite token' 
      });
    }
    
    const inviteDoc = snapshot.docs[0];
    const inviteData = inviteDoc.data();
    const inviteId = inviteDoc.id;

    console.log('🔄 [Invite Open API] Found invite for:', inviteData.candidateEmail);

    // Check if invite is still valid (not completed and not expired)
    const now = Date.now();
    
    if (inviteData.status === 'completed') {
      console.log('❌ [Invite Open API] Invite already completed');
      return res.status(410).json({
        success: false,
        error: 'This assessment has already been completed'
      });
    }

    if (inviteData.expiresAt && now > inviteData.expiresAt) {
      console.log('❌ [Invite Open API] Invite expired');
      // Update status to expired
      await db.collection('invites').doc(inviteId).update({
        status: 'expired'
      });
      
      return res.status(410).json({
        success: false,
        error: 'This invite has expired'
      });
    }

    // Update invite status and last opened time if valid
    console.log('🔄 [Invite Open API] Updating invite status...');
    const updateData: any = {
      lastOpenedAt: now
    };

    // Only update status to 'started' if it's currently 'pending'
    if (inviteData.status === 'pending') {
      updateData.status = 'started';
    }

    await db.collection('invites').doc(inviteId).update(updateData);

    // Log analytics event
    logAnalyticsEvent('invite_opened', {
      inviteId,
      token: token.substring(0, 8) + '...',
      candidateEmail: inviteData.candidateEmail,
      projectId: inviteData.projectId,
      companyId: inviteData.companyId,
      timestamp: now,
      status: updateData.status || inviteData.status
    });

    console.log('✅ [Invite Open API] Invite opened successfully');

    // Return basic invite info for frontend use
    return res.status(200).json({
      success: true,
      invite: {
        id: inviteId,
        candidateEmail: inviteData.candidateEmail,
        projectId: inviteData.projectId,
        companyId: inviteData.companyId,
        status: updateData.status || inviteData.status,
        timestamp: inviteData.timestamp,
        expiresAt: inviteData.expiresAt,
        lastOpenedAt: now,
        token: token
      }
    });

  } catch (error: any) {
    console.error('🚨 [Invite Open API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process invite open request'
    });
  }
} 