import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

/**
 * Safely set response headers
 */
function setResponseHeaders(res: VercelResponse, headers: Record<string, string>) {
  try {
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  } catch (headerError) {
    console.error('🚨 [Headers] Failed to set headers:', headerError);
  }
}

/**
 * Safely send JSON response
 */
function sendJsonResponse(res: VercelResponse, statusCode: number, data: any) {
  try {
    if (res.headersSent) {
      console.log('⚠️ [Response] Headers already sent, cannot send response');
      return;
    }
    
    setResponseHeaders(res, corsHeaders);
    res.status(statusCode).json(data);
  } catch (responseError) {
    console.error('🚨 [Response] Failed to send JSON response:', responseError);
    try {
      if (!res.headersSent) {
        res.status(500).end('Internal Server Error');
      }
    } catch (finalError) {
      console.error('🚨 [Response] Complete failure to send response:', finalError);
    }
  }
}

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

      initializeApp({
        credential: cert({
          projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
          clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
          privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🧪 [Test API] === TEST HANDLER START ===');
  console.log('🔔 [Test API] Method:', req.method);
  console.log('🔔 [Test API] URL:', req.url);

  // Always set CORS headers first
  setResponseHeaders(res, corsHeaders);

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Test API] Handling OPTIONS preflight request');
      return sendJsonResponse(res, 200, { success: true });
    }

    // Allow GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      console.log('❌ [Test API] Method not allowed:', req.method);
      return sendJsonResponse(res, 405, { success: false, error: 'Method not allowed' });
    }

    // Test results object
    const testResults = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: Boolean(process.env.VERCEL),
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_REGION: process.env.VERCEL_REGION,
      },
      environmentVariables: {
        SENDGRID_API_KEY: Boolean(process.env.SENDGRID_API_KEY),
        FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
        FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      },
      tests: {
        firebase: { status: 'pending', error: null },
        firestore: { status: 'pending', error: null },
        sendgrid: { status: 'pending', error: null },
      }
    };

    console.log('🔍 [Test API] Environment Check:');
    console.log('   • NODE_ENV:', process.env.NODE_ENV);
    console.log('   • VERCEL:', process.env.VERCEL);
    console.log('   • VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('   • SENDGRID_API_KEY present:', Boolean(process.env.SENDGRID_API_KEY));
    console.log('   • FIREBASE_PROJECT_ID present:', Boolean(process.env.FIREBASE_PROJECT_ID));
    console.log('   • FIREBASE_CLIENT_EMAIL present:', Boolean(process.env.FIREBASE_CLIENT_EMAIL));
    console.log('   • FIREBASE_PRIVATE_KEY present:', Boolean(process.env.FIREBASE_PRIVATE_KEY));

    // Test Firebase initialization
    try {
      console.log('🔥 [Test API] Testing Firebase initialization...');
      initializeFirebase();
      testResults.tests.firebase.status = 'success';
      console.log('✅ [Test API] Firebase initialization successful');
    } catch (firebaseError) {
      console.error('🚨 [Test API] Firebase initialization failed:', firebaseError);
      testResults.tests.firebase.status = 'failed';
      testResults.tests.firebase.error = firebaseError instanceof Error ? firebaseError.message : String(firebaseError);
    }

    // Test Firestore connection
    if (testResults.tests.firebase.status === 'success') {
      try {
        console.log('📚 [Test API] Testing Firestore connection...');
        const db = getFirestore();
        
        // Try to read from a collection (this doesn't require the collection to exist)
        const testCollection = db.collection('test');
        const testQuery = testCollection.limit(1);
        await testQuery.get();
        
        testResults.tests.firestore.status = 'success';
        console.log('✅ [Test API] Firestore connection successful');
      } catch (firestoreError) {
        console.error('🚨 [Test API] Firestore connection failed:', firestoreError);
        testResults.tests.firestore.status = 'failed';
        testResults.tests.firestore.error = firestoreError instanceof Error ? firestoreError.message : String(firestoreError);
      }
    } else {
      testResults.tests.firestore.status = 'skipped';
      testResults.tests.firestore.error = 'Firebase initialization failed';
    }

    // Test SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        console.log('📧 [Test API] Testing SendGrid import...');
        const sgMail = (await import('@sendgrid/mail')).default;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        testResults.tests.sendgrid.status = 'success';
        console.log('✅ [Test API] SendGrid import and setup successful');
      } catch (sendgridError) {
        console.error('🚨 [Test API] SendGrid test failed:', sendgridError);
        testResults.tests.sendgrid.status = 'failed';
        testResults.tests.sendgrid.error = sendgridError instanceof Error ? sendgridError.message : String(sendgridError);
      }
    } else {
      testResults.tests.sendgrid.status = 'failed';
      testResults.tests.sendgrid.error = 'SENDGRID_API_KEY environment variable not set';
    }

    // Determine overall success
    const allTestsPassed = Object.values(testResults.tests).every(test => test.status === 'success');
    testResults.success = allTestsPassed;

    console.log('📊 [Test API] Test Results Summary:');
    console.log('   • Firebase:', testResults.tests.firebase.status);
    console.log('   • Firestore:', testResults.tests.firestore.status);
    console.log('   • SendGrid:', testResults.tests.sendgrid.status);
    console.log('   • Overall Success:', testResults.success);

    return sendJsonResponse(res, 200, testResults);

  } catch (outerError) {
    console.error('🚨 [Test API] === CRITICAL OUTER ERROR ===');
    console.error('🚨 [Test API] Error type:', typeof outerError);
    console.error('🚨 [Test API] Error name:', outerError instanceof Error ? outerError.name : 'Unknown');
    console.error('🚨 [Test API] Error message:', outerError instanceof Error ? outerError.message : String(outerError));
    console.error('🚨 [Test API] Error stack:', outerError instanceof Error ? outerError.stack : 'No stack trace');
    
    // Final fallback response
    return sendJsonResponse(res, 500, { 
      success: false, 
      error: outerError instanceof Error ? outerError.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log('🏁 [Test API] === TEST HANDLER END ===');
  }
} 