import type { VercelRequest } from '@vercel/node';

interface AuthContext {
  uid: string;
  hrUser: {
    role: string;
    companyId: string;
    email: string;
  };
}

/**
 * Verify Firebase ID token
 */
export async function verifyAuthToken(token: string): Promise<{ uid: string }> {
  if (!token) {
    throw new Error('Missing or invalid authorization header');
  }

  try {
    // Dynamic import to avoid client-side issues
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Get HR user data from Firestore
 */
export async function getHrUser(uid: string) {
  const { getFirestore } = await import('firebase-admin/firestore');
  const db = getFirestore();
  
  const hrDoc = await db.collection('hrUsers').doc(uid).get();
  
  if (!hrDoc.exists) {
    throw new Error('HR user not found');
  }
  
  return hrDoc.data();
}

/**
 * Authenticate request and get user context
 */
export async function authenticateRequest(req: VercelRequest): Promise<AuthContext> {
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