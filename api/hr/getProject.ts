import { VercelRequest, VercelResponse } from '@vercel/node';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase } from '../firebase-debug';

// Firebase initialization
// Use shared initializer to avoid duplication and type issues

interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  gamePreferences: string[];
  roleTag: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  candidateCount: number;
  deadline?: string;
  assessmentType?: string;
  roleInfo?: {
    position: string;
    department: string;
    roleTitle: string;
    yearsExperience: string;
    location: string;
    workMode: string;
  };
  customization?: {
    teamSize: string;
    managementStyle: string;
    keySkills: string[];
    industryFocus: string;
    cultureValues: string[];
    challenges: string[];
    gamePreferences: string[];
  };
}

interface HrUser {
  id: string;
  role: string;
  companyId: string;
  name?: string;
  email?: string;
}

interface ProjectCandidate {
  id: string;
  email: string;
  status: 'Invited' | 'InProgress' | 'Completed';
  dateInvited: string;
  dateCompleted?: string;
  inviteToken: string;
  projectId: string;
  result?: any;
}

/**
 * GET /api/hr/getProject
 * 
 * Get a single project's details with candidates
 * 
 * Query Parameters:
 * - projectId: string (required) - Project ID
 * - hrId: string (required) - HR user ID
 * - includeCandidates?: boolean (optional) - Include project candidates (default: true)
 * 
 * Returns:
 * - success: boolean
 * - project: Project
 * - candidates?: ProjectCandidate[]
 * - candidateStats?: { total: number, invited: number, inProgress: number, completed: number }
 * - error?: string
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Get Project API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get Project API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Project API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate parameters
    const { projectId, hrId, includeCandidates } = req.query;

    if (!projectId || !hrId || typeof projectId !== 'string' || typeof hrId !== 'string') {
      console.log('❌ [Get Project API] Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'projectId and hrId query parameters are required'
      });
    }

    const shouldIncludeCandidates = includeCandidates !== 'false';

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get Project API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Get HR user and verify role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Get Project API] HR user not found:', hrId);
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    const hrUser = { id: hrDoc.id, ...(hrDoc.data() as Partial<HrUser>) } as HrUser;
    const requiredRoles = ['admin', 'employee'];
    
    if (!requiredRoles.includes(hrUser.role)) {
      console.log('❌ [Get Project API] Insufficient permissions. Required:', requiredRoles, 'User role:', hrUser.role);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${requiredRoles.join(' or ')} role required`
      });
    }
    
    const companyId = hrUser.companyId;

    console.log(`✅ [Get Project API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [Get Project API] Step 2: Fetching project...');
    
    // Step 2: Get project from company's projects subcollection
    const projectDoc = await db.collection('companies').doc(companyId).collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      console.log('❌ [Get Project API] Project not found');
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project: Project = {
      id: projectDoc.id,
      ...projectDoc.data()
    } as Project;

    console.log(`✅ [Get Project API] Project found: ${project.name}`);

    let candidates: ProjectCandidate[] = [];
    let candidateStats = { total: 0, invited: 0, inProgress: 0, completed: 0 };

    // Step 3: Optionally fetch candidates
    if (shouldIncludeCandidates) {
      console.log('🔄 [Get Project API] Step 3: Fetching project candidates...');
      
      const candidatesSnapshot = await db
        .collection('companies')
        .doc(companyId)
        .collection('projects')
        .doc(projectId)
        .collection('candidates')
        .orderBy('dateInvited', 'desc')
        .get();

      candidates = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        projectId,
        ...doc.data()
      } as ProjectCandidate));

      // Calculate candidate statistics
      candidateStats = {
        total: candidates.length,
        invited: candidates.filter(c => c.status === 'Invited').length,
        inProgress: candidates.filter(c => c.status === 'InProgress').length,
        completed: candidates.filter(c => c.status === 'Completed').length,
      };

      console.log(`📊 [Get Project API] Found ${candidates.length} candidates`);
    }

    console.log('✅ [Get Project API] Project data fetched successfully');

    // Success response
    const response: any = {
      success: true,
      project,
    };

    if (shouldIncludeCandidates) {
      response.candidates = candidates;
      response.candidateStats = candidateStats;
    }

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('🚨 [Get Project API] Error:', error);
    
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
      error: error?.message || 'Failed to fetch project'
    });
  }
} 