/**
 * Server-side authentication utilities
 * Handles Firebase Auth token verification and role-based access control
 */

import type { VercelRequest } from '@vercel/node';

// Firebase admin imports
require('dotenv').config();
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase initialization
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      };

      for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      
      firebaseInitialized = true;
    } catch (error) {
      console.error('🚨 [Firebase] Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

/**
 * Verify Firebase ID token and extract user info
 */
async function verifyAuthToken(token: string): Promise<{ uid: string; email?: string; customClaims?: any }> {
  if (!token) {
    throw new Error('Missing or invalid authorization header');
  }

  try {
    initializeFirebase();
    const auth = getAuth();
    
    const decodedToken = await auth.verifyIdToken(token);
    
    return { 
      uid: decodedToken.uid,
      email: decodedToken.email,
      customClaims: decodedToken
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Verify that user has super_admin role
 */
async function verifySuperAdmin(authHeader: string): Promise<{ uid: string; email: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const { uid, email, customClaims } = await verifyAuthToken(token);

  if (!customClaims?.role || customClaims.role !== 'super_admin') {
    throw new Error('Insufficient permissions: super_admin role required');
  }

  if (!email) {
    throw new Error('User email not found');
  }

  return { uid, email };
}

/**
 * Get HR user data from Firestore and validate role
 */
export async function getHrUser(uid: string): Promise<any> {
  initializeFirebase();
  const db = getFirestore();
  
  const hrDoc = await db.collection('hrUsers').doc(uid).get();
  
  if (!hrDoc.exists) {
    throw new Error('HR user not found');
  }
  
  return { id: hrDoc.id, ...hrDoc.data() };
}

/**
 * Verify HR user exists and has specified role
 */
export async function verifyHrUserRole(hrId: string, requiredRoles: ('admin' | 'employee')[]): Promise<any> {
  const hrUser = await getHrUser(hrId);
  
  if (!requiredRoles.includes(hrUser.role)) {
    throw new Error(`Insufficient permissions: ${requiredRoles.join(' or ')} role required`);
  }
  
  return hrUser;
}

/**
 * Create Firebase Auth user with custom claims (for super admin use)
 */
async function createFirebaseUser(email: string, password: string, customClaims: Record<string, any> = {}): Promise<string> {
  try {
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    
    // Create the user
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true
    });
    
    // Set custom claims if provided
    if (Object.keys(customClaims).length > 0) {
      await auth.setCustomUserClaims(userRecord.uid, customClaims);
    }
    
    console.log('✅ Created Firebase user:', userRecord.uid);
    return userRecord.uid;
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      // User already exists, get their UID and update claims
      const { getAuth } = await import('firebase-admin/auth');
      const auth = getAuth();
      
      const existingUser = await auth.getUserByEmail(email);
      
      if (Object.keys(customClaims).length > 0) {
        await auth.setCustomUserClaims(existingUser.uid, customClaims);
      }
      
      console.log('✅ Updated existing Firebase user:', existingUser.uid);
      return existingUser.uid;
    }
    
    console.error('❌ Error creating Firebase user:', error);
    throw error;
  }
}

/**
 * Extract bearer token from authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  return authHeader.substring(7);
}

/**
 * Validate company user limits
 */
export async function validateCompanyUserLimits(companyId: string): Promise<{ canAddUser: boolean; currentCount: number; maxUsers: number }> {
  const { getFirestore } = await import('firebase-admin/firestore');
  const db = getFirestore();
  
  // Get company info
  const companyDoc = await db.collection('companies').doc(companyId).get();
  if (!companyDoc.exists) {
    throw new Error('Company not found');
  }
  
  const companyData = companyDoc.data();
  const maxUsers = companyData?.maxUsers || 0;
  
  // Count current HR users
  const hrUsersQuery = db.collection('hrUsers').where('companyId', '==', companyId);
  const hrUsersSnapshot = await hrUsersQuery.get();
  const currentCount = hrUsersSnapshot.size;
  
  return {
    canAddUser: currentCount < maxUsers,
    currentCount,
    maxUsers
  };
}

/**
 * Authenticate request and get user context
 */
export async function authenticateRequest(req: VercelRequest): Promise<{ uid: string; hrUser: { role: string; companyId: string; email: string } }> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  const { uid } = await verifyAuthToken(token);
  const hrUser = await getHrUser(uid);
  
  return {
    uid,
    hrUser: {
      role: hrUser?.role || 'user',
      companyId: hrUser?.companyId || '',
      email: hrUser?.email || '',
    },
  };
}

/**
 * Check if user has required permission
 */
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions: { [key: string]: string[] } = {
    admin: ['invite', 'view', 'manage'],
    manager: ['invite', 'view'],
    user: ['view'],
  };
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

module.exports = {
  verifyAuthToken,
  verifySuperAdmin, 
  createFirebaseUser,
  getHrUser,
  verifyHrUserRole,
  extractBearerToken,
  validateCompanyUserLimits,
  authenticateRequest,
  hasPermission
}; 