import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
require('dotenv').config();

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Firebase initialization
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

interface ProjectAnalytics {
  id: string;
  name: string;
  status: string;
  candidateCount: number;
  completedCount: number;
  invitedCount: number;
  inProgressCount: number;
  completionRate: number;
  createdAt: number;
  deadline?: string;
}

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalCandidates: number;
    completedAssessments: number;
    pendingAssessments: number;
    averageCompletionRate: number;
  };
  projectsAnalytics: ProjectAnalytics[];
  candidatesByStatus: {
    invited: number;
    inProgress: number;
    completed: number;
  };
  monthlyTrends: {
    month: string;
    projectsCreated: number;
    candidatesInvited: number;
    assessmentsCompleted: number;
  }[];
  topPerformingProjects: {
    id: string;
    name: string;
    completionRate: number;
    candidateCount: number;
  }[];
}

/**
 * GET /api/hr/getAnalytics
 * 
 * Get analytics data for HR dashboard
 * 
 * Query Parameters:
 * - hrId: string (required) - HR user ID
 * - timeRange?: string (optional) - Time range filter ('30d', '90d', '1y', 'all')
 * - includeProjectDetails?: boolean (optional) - Include detailed project analytics (default: true)
 * 
 * Returns:
 * - success: boolean
 * - analytics: AnalyticsData
 * - error?: string
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Get Analytics API] Request received:', req.method, req.url);
  
  // Set CORS headers for cross-origin requests from app.olivinhr.com
  const allowedOrigins = new Set([
    'https://app.olivinhr.com',
    'https://game.olivinhr.com',
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
      console.log('✅ [Get Analytics API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Analytics API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate parameters
    const { hrId, timeRange, includeProjectDetails } = req.query;

    if (!hrId || typeof hrId !== 'string') {
      console.log('❌ [Get Analytics API] Missing required hrId parameter');
      return res.status(400).json({
        success: false,
        error: 'hrId query parameter is required'
      });
    }

    const timeRangeFilter = timeRange as string || 'all';
    const shouldIncludeProjectDetails = includeProjectDetails !== 'false';

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get Analytics API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Get HR user and verify role
    const hrDoc = await db.collection('hrUsers').doc(hrId).get();
    
    if (!hrDoc.exists) {
      console.log('❌ [Get Analytics API] HR user not found:', hrId);
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    const hrUser = { id: hrDoc.id, ...hrDoc.data() };
    const requiredRoles = ['admin', 'employee'];
    
    if (!requiredRoles.includes(hrUser.role)) {
      console.log('❌ [Get Analytics API] Insufficient permissions. Required:', requiredRoles, 'User role:', hrUser.role);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${requiredRoles.join(' or ')} role required`
      });
    }
    
    const companyId = hrUser.companyId;

    console.log(`✅ [Get Analytics API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [Get Analytics API] Step 2: Calculating time range filter...');
    
    // Step 2: Calculate time range for filtering
    let startTime = 0;
    const now = Date.now();
    
    switch (timeRangeFilter) {
      case '30d':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = now - (90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startTime = now - (365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startTime = 0;
        break;
    }

    console.log('🔄 [Get Analytics API] Step 3: Fetching projects data...');
    
    // Step 3: Fetch all projects for the company
    let projectsQuery = db.collection('companies').doc(companyId).collection('projects');
    
    if (startTime > 0) {
      projectsQuery = projectsQuery.where('createdAt', '>=', startTime);
    }
    
    const projectsSnapshot = await projectsQuery.orderBy('createdAt', 'desc').get();
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📊 [Get Analytics API] Found ${projects.length} projects`);

    console.log('🔄 [Get Analytics API] Step 4: Analyzing project candidates...');
    
    // Step 4: Analyze candidates for each project
    const projectsAnalytics: ProjectAnalytics[] = [];
    let totalCandidates = 0;
    let totalCompleted = 0;
    let totalInvited = 0;
    let totalInProgress = 0;

    for (const project of projects) {
      try {
        const candidatesSnapshot = await db
          .collection('companies')
          .doc(companyId)
          .collection('projects')
          .doc(project.id)
          .collection('candidates')
          .get();

        const candidates = candidatesSnapshot.docs.map(doc => doc.data());
        
        const invitedCount = candidates.filter(c => c.status === 'Invited').length;
        const inProgressCount = candidates.filter(c => c.status === 'InProgress').length;
        const completedCount = candidates.filter(c => c.status === 'Completed').length;
        const candidateCount = candidates.length;
        
        const completionRate = candidateCount > 0 ? Math.round((completedCount / candidateCount) * 100) : 0;

        totalCandidates += candidateCount;
        totalCompleted += completedCount;
        totalInvited += invitedCount;
        totalInProgress += inProgressCount;

        if (shouldIncludeProjectDetails) {
          projectsAnalytics.push({
            id: project.id,
            name: project.name,
            status: project.status,
            candidateCount,
            completedCount,
            invitedCount,
            inProgressCount,
            completionRate,
            createdAt: project.createdAt,
            deadline: project.deadline,
          });
        }
      } catch (error) {
        console.warn(`⚠️ [Get Analytics API] Failed to analyze project ${project.id}:`, error);
      }
    }

    console.log('🔄 [Get Analytics API] Step 5: Calculating monthly trends...');
    
    // Step 5: Calculate monthly trends (last 12 months)
    const monthlyTrends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();
      
      const monthProjects = projects.filter(p => p.createdAt >= monthStart && p.createdAt <= monthEnd);
      
      // For invited/completed candidates, we'd need to query all candidates with date filters
      // For now, we'll use project-based metrics
      monthlyTrends.push({
        month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        projectsCreated: monthProjects.length,
        candidatesInvited: 0, // Would need additional queries
        assessmentsCompleted: 0, // Would need additional queries
      });
    }

    console.log('🔄 [Get Analytics API] Step 6: Calculating overview metrics...');
    
    // Step 6: Calculate overview metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const averageCompletionRate = totalCandidates > 0 ? Math.round((totalCompleted / totalCandidates) * 100) : 0;

    // Step 7: Get top performing projects
    const topPerformingProjects = projectsAnalytics
      .filter(p => p.candidateCount > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        completionRate: p.completionRate,
        candidateCount: p.candidateCount,
      }));

    // Construct analytics data
    const analytics: AnalyticsData = {
      overview: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalCandidates,
        completedAssessments: totalCompleted,
        pendingAssessments: totalInvited + totalInProgress,
        averageCompletionRate,
      },
      projectsAnalytics: shouldIncludeProjectDetails ? projectsAnalytics : [],
      candidatesByStatus: {
        invited: totalInvited,
        inProgress: totalInProgress,
        completed: totalCompleted,
      },
      monthlyTrends,
      topPerformingProjects,
    };

    console.log('✅ [Get Analytics API] Analytics data calculated successfully');

    // Success response
    return res.status(200).json({
      success: true,
      analytics,
      timeRange: timeRangeFilter,
      generatedAt: now,
    });

  } catch (error: any) {
    console.error('🚨 [Get Analytics API] Error:', error);
    
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
      error: error?.message || 'Failed to fetch analytics'
    });
  }
} 