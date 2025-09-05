import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '../firebase-debug';
import { verifyHrUserRole } from '../../packages/services/auth-utils-server';

interface ProjectUpdateData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused' | 'draft';
  deadline?: string;
  gamePreferences?: string[];
  roleTag?: string;
  assessmentType?: string;
  roleInfo?: {
    position?: string;
    department?: string;
    roleTitle?: string;
    yearsExperience?: string;
    location?: string;
    workMode?: string;
  };
  customization?: {
    teamSize?: string;
    managementStyle?: string;
    keySkills?: string[];
    industryFocus?: string;
    cultureValues?: string[];
    challenges?: string[];
    gamePreferences?: string[];
  };
}

/**
 * PUT /api/hr/updateProject
 * 
 * Update a project's details
 * 
 * Body Parameters:
 * - projectId: string (required) - Project ID
 * - hrId: string (required) - HR user ID
 * - updates: ProjectUpdateData (required) - Fields to update
 * 
 * Returns:
 * - success: boolean
 * - project: Updated project data
 * - error?: string
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Update Project API] Request received:', req.method, req.url);
  
  try {
    // Set CORS headers for api.olivinhr.com domain
    const allowedOrigins = [
      'https://app.olivinhr.com',
      'https://hub.olivinhr.com',
      'https://cgames-v4-hr-platform.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    const origin = req.headers.origin || '';
    console.log('🔍 [Update Project API] Origin:', origin);
    
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Update Project API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow PUT requests
    if (req.method !== 'PUT') {
      console.log('❌ [Update Project API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate request data
    const { projectId, hrId, updates } = req.body || {};

    if (!projectId || !hrId || !updates) {
      console.log('❌ [Update Project API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'projectId, hrId, and updates are required'
      });
    }

    if (typeof projectId !== 'string' || typeof hrId !== 'string') {
      console.log('❌ [Update Project API] Invalid parameter types');
      return res.status(400).json({
        success: false,
        error: 'projectId and hrId must be strings'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Update Project API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Verify HR user has admin role (only admins can update projects)
    const hrUser = await verifyHrUserRole(hrId, ['admin']);
    const companyId = hrUser.companyId;

    console.log(`✅ [Update Project API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [Update Project API] Step 2: Verifying project exists...');
    
    // Step 2: Check if project exists and belongs to the company
    const projectRef = db.collection('companies').doc(companyId).collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      console.log('❌ [Update Project API] Project not found');
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    type ProjectDocData = { id: string; name?: string; roleInfo?: any; customization?: any };
    const currentProjectData = { id: projectDoc.id, ...(projectDoc.data() as Partial<ProjectDocData>) } as ProjectDocData;

    console.log(`✅ [Update Project API] Project found: ${currentProjectData.name}`);

    console.log('🔄 [Update Project API] Step 3: Preparing update data...');
    
    // Step 3: Prepare update data - only include fields that are provided
    const updateData: any = {
      updatedAt: Date.now()
    };

    // Basic fields
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
    if (updates.gamePreferences !== undefined) updateData.gamePreferences = updates.gamePreferences;
    if (updates.roleTag !== undefined) updateData.roleTag = updates.roleTag;
    if (updates.assessmentType !== undefined) updateData.assessmentType = updates.assessmentType;

    // Nested objects - merge with existing data
    if (updates.roleInfo) {
      updateData.roleInfo = {
        ...currentProjectData.roleInfo,
        ...updates.roleInfo
      };
    }

    if (updates.customization) {
      updateData.customization = {
        ...currentProjectData.customization,
        ...updates.customization
      };
    }

    console.log('🔄 [Update Project API] Step 4: Updating project...');
    
    // Step 4: Update the project
    await projectRef.update(updateData);

    console.log('✅ [Update Project API] Project updated successfully');

    // Step 5: Fetch updated project data
    const updatedProjectDoc = await projectRef.get();
    const updatedProject = {
      id: updatedProjectDoc.id,
      ...updatedProjectDoc.data()
    };

    // Success response
    return res.status(200).json({
      success: true,
      project: updatedProject,
      updated: Object.keys(updateData).filter(key => key !== 'updatedAt')
    });

  } catch (error: any) {
    console.error('🚨 [Update Project API] Error:', error);
    
    // Make sure we set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', 'https://app.olivinhr.com');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
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
      error: error?.message || 'Failed to update project'
    });
  }
} 