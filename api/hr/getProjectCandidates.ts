import { VercelRequest, VercelResponse } from '@vercel/node';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '../firebase-debug';

// Initialize Firebase Admin
// Use shared initializer

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Get Project Candidates API] Request received:', req.method, req.url);
  
  // Set CORS headers for cross-origin requests from app.olivinhr.com
  const allowedOrigins = new Set([
    'https://app.olivinhr.com',
    'https://hub.olivinhr.com',
    'https://cgames-v4-hr-platform.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ]);

  const origin = (req.headers.origin as string) || '';
  const allowOrigin = allowedOrigins.has(origin) ? origin : 'https://app.olivinhr.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get Project Candidates API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Project Candidates API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract parameters
    const { projectId, hrId } = req.query;

    if (!projectId || !hrId || typeof projectId !== 'string' || typeof hrId !== 'string') {
      console.log('❌ [Get Project Candidates API] Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'projectId and hrId query parameters are required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get Project Candidates API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Get HR user and verify role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Get Project Candidates API] HR user not found:', hrId);
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    interface HrUser { id: string; role: 'admin' | 'employee' | string; companyId: string; email?: string }
    const hrUser = { id: hrDoc.id, ...(hrDoc.data() as Partial<HrUser>) } as HrUser;
    const requiredRoles = ['admin', 'employee'];
    
    if (!requiredRoles.includes(hrUser.role)) {
      console.log('❌ [Get Project Candidates API] Insufficient permissions. Required:', requiredRoles, 'User role:', hrUser.role);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${requiredRoles.join(' or ')} role required`
      });
    }
    
    const companyId = hrUser.companyId;

    console.log(`✅ [Get Project Candidates API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [Get Project Candidates API] Step 2: Fetching project...');
    
    // Step 2: Verify project exists and belongs to the company
    const projectRef = db.collection('companies').doc(companyId).collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      console.log('❌ [Get Project Candidates API] Project not found:', projectId);
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const projectData = projectDoc.data();

    console.log('🔄 [Get Project Candidates API] Step 3: Fetching candidates...');
    
    // Step 3: Fetch all invites for this project
    const invitesQuery = db.collection('invites')
      .where('projectId', '==', projectId)
      .where('companyId', '==', companyId)
      .orderBy('timestamp', 'desc');
    
    const invitesSnapshot = await invitesQuery.get();
    
    // Transform invites to candidate format
    const candidates = invitesSnapshot.docs.map(doc => {
      const inviteData = doc.data();
      
      let status: 'Invited' | 'InProgress' | 'Completed' = 'Invited';
      if (inviteData.status === 'started') {
        status = 'InProgress';
      } else if (inviteData.status === 'completed') {
        status = 'Completed';
      }

      return {
        id: doc.id,
        email: inviteData.candidateEmail,
        status,
        dateInvited: new Date(inviteData.timestamp).toISOString(),
        dateCompleted: inviteData.completedAt ? new Date(inviteData.completedAt).toISOString() : undefined,
        inviteToken: inviteData.token,
        totalScore: inviteData.result?.totalScore || null,
        competencyBreakdown: inviteData.result?.competencyBreakdown || null,
        lastOpenedAt: inviteData.lastOpenedAt ? new Date(inviteData.lastOpenedAt).toISOString() : undefined
      };
    });

    console.log(`✅ [Get Project Candidates API] Found ${candidates.length} candidates`);

    // Success response
    return res.status(200).json({
      success: true,
      project: {
        id: projectId,
        name: projectData?.name || 'Unknown Project',
        candidateCount: candidates.length
      },
      candidates,
      hrUser: {
        role: hrUser.role,
        canSendInvites: hrUser.role === 'admin' // Only admins can send invites
      }
    });

  } catch (error: any) {
    console.error('🚨 [Get Project Candidates API] Error:', error);
    
    // Handle permission errors specifically
    if (error.message?.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message?.includes('HR user not found')) {
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch project candidates'
    });
  }
} 