const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// CORS headers for cross-origin requests from app.olivinhr.com
const allowedOrigins = [
  'https://app.olivinhr.com',
  'https://hub.olivinhr.com',
  'https://cgames-v4-hr-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    console.log('🔥 [Get Candidate Results API] Initializing Firebase Admin...');
    
    const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
    const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
    // Support either plain key or base64-encoded key
    let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const firebasePrivateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64 || process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (!firebasePrivateKey && firebasePrivateKeyB64) {
      try {
        firebasePrivateKey = Buffer.from(firebasePrivateKeyB64, 'base64').toString('utf-8');
      } catch (e) {
        throw new Error('Failed to decode FIREBASE_PRIVATE_KEY_B64. Ensure it is valid base64.');
      }
    }

    if (!FIREBASE_PROJECT_ID) throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
    if (!FIREBASE_CLIENT_EMAIL) throw new Error('Missing required environment variable: FIREBASE_CLIENT_EMAIL');
    if (!firebasePrivateKey) throw new Error('Missing required environment variable: FIREBASE_PRIVATE_KEY');

    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
      }),
    });
    
    console.log('✅ [Get Candidate Results API] Firebase Admin initialized successfully');
  }
  
  return getFirestore();
}

module.exports = async function handler(req, res) {
  console.log('🚀 [Get Candidate Results API] Request received:', req.method, req.url);
  
  try {
    // Set CORS headers for api.olivinhr.com domain
    const origin = req.headers.origin || '';
    console.log('🔍 [Get Candidate Results API] Origin:', origin);
    
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get Candidate Results API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Candidate Results API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    console.log('📊 [Get Candidate Results API] Processing request parameters...');

    const db = initializeFirebaseAdmin();
    
    // Extract parameters
    const { candidateEmail, companyId, projectId, hrId } = req.query;

    console.log('📊 [Get Candidate Results API] Processing request:');
    console.log('  - Project ID:', projectId);
    console.log('  - HR User ID:', hrId);
    console.log('  - Candidate Email:', candidateEmail);

    // Support both new format (candidateEmail, companyId) and legacy format (projectId, hrId)
    if (candidateEmail && companyId) {
      console.log('🔄 [Get Candidate Results API] Using new format: candidateEmail + companyId');
      
      // Find the candidate results by email
      const resultsQuery = await db.collection('candidateResults')
        .where('candidateEmail', '==', candidateEmail)
        .get();

      if (resultsQuery.empty) {
        console.log('❌ [Get Candidate Results API] No results found for candidate:', candidateEmail);
        return res.status(404).json({
          success: false,
          error: 'No results found for this candidate'
        });
      }

      // Get the most recent result (sort in memory to avoid index requirement)
      const sortedDocs = resultsQuery.docs.sort((a, b) => 
        new Date(b.data().submittedAt) - new Date(a.data().submittedAt)
      );
      const resultDoc = sortedDocs[0];
      const resultData = resultDoc.data();
      
      console.log('✅ [Get Candidate Results API] Found results for candidate:', candidateEmail);
      
      // Return the single result
      return res.status(200).json({
        success: true,
        result: {
          id: resultDoc.id,
          ...resultData
        }
      });
    }

    // Legacy format support (projectId, hrId)
    if (!projectId) {
      console.log('❌ [Get Candidate Results API] Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: projectId (legacy) or candidateEmail + companyId (new)'
      });
    }

    // Step 1: Verify HR user permissions
    console.log('🔍 [Get Candidate Results API] Step 1: Verifying HR user permissions...');
    
    let hrUser = null;
    if (hrId && hrId !== 'test-user') {
      try {
        const hrUserDoc = await db.collection('users').doc(hrId).get();
        if (hrUserDoc.exists) {
          hrUser = hrUserDoc.data();
          console.log('✅ [Get Candidate Results API] HR user verified - Role:', hrUser.role, 'Company:', hrUser.companyId);
        } else {
          console.log('⚠️ [Get Candidate Results API] HR user not found in users collection, continuing with project verification');
        }
      } catch (error) {
        console.log('⚠️ [Get Candidate Results API] Error verifying HR user, continuing with project verification:', error.message);
      }
    }

    // Step 2: Verify project access (if we have HR user info)
    if (hrUser) {
      console.log('🔄 [Get Candidate Results API] Step 2: Verifying project access...');
      
      const projectDoc = await db.collection('projects').doc(projectId).get();
      if (projectDoc.exists) {
        const project = projectDoc.data();
        if (project.companyId !== hrUser.companyId) {
          console.log('❌ [Get Candidate Results API] Project access denied');
          return res.status(403).json({
            success: false,
            error: 'Access denied to this project'
          });
        }
        console.log('✅ [Get Candidate Results API] Project access verified:', project.name);
      }
    }

    // Step 3: Get all candidate results for the project from candidateResults collection
    console.log('🔍 [Get Candidate Results API] Step 3: Fetching candidate results...');
    console.log('  - Searching for projectId:', projectId);
    
    // Use simple query to avoid composite index requirement
    const resultsQuery = await db.collection('candidateResults')
      .where('projectId', '==', projectId)
      .get();
      
    console.log('📊 [Get Candidate Results API] Query results:');
    console.log('  - Found', resultsQuery.docs.length, 'results for project');
    
    if (resultsQuery.docs.length === 0) {
      console.log('⚠️ [Get Candidate Results API] No results found, trying alternative search...');
      
      // Try to find any results for debugging
      const allResultsQuery = await db.collection('candidateResults').limit(5).get();
      console.log('🔍 [Get Candidate Results API] Sample results in database:');
      allResultsQuery.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ProjectId: ${data.projectId}, Email: ${data.candidateEmail}, AssessmentType: ${data.assessmentType}`);
      });
    }

    const results = [];
    
    for (const doc of resultsQuery.docs) {
      const resultData = doc.data();
      
      // Get additional invite information if needed
      let inviteData = null;
      if (resultData.inviteId) {
        const inviteDoc = await db.collection('invites').doc(resultData.inviteId).get();
        if (inviteDoc.exists) {
          inviteData = inviteDoc.data();
        }
      }

      // Debug: Log the raw result data
      console.log('📊 [Get Candidate Results API] Processing result for:', resultData.candidateEmail);
      console.log('  - Assessment Type:', resultData.assessmentType);
      console.log('  - Game ID:', resultData.gameId);
      console.log('  - Competency Scores keys:', Object.keys(resultData.competencyScores || {}));
      
      // Format result for HR dashboard
      const formattedResult = {
        id: doc.id,
        candidateEmail: resultData.candidateEmail,
        candidateData: inviteData ? {
          roleTag: inviteData.roleTag,
          sentBy: inviteData.sentBy,
          sentAt: inviteData.createdAt
        } : null,
        
        // Assessment information - CRITICAL for proper dashboard display
        assessmentType: resultData.assessmentType || 'space-mission',
        assessmentName: resultData.assessmentName || resultData.gameName,
        gameId: resultData.gameId,
        gameName: resultData.gameName,
        
        // Performance metrics
        scorePercentage: resultData.scorePercentage || 0,
        rawScore: resultData.rawScore || 0,
        totalQuestions: resultData.totalQuestions || 0,
        competencyScores: resultData.competencyScores || {},
        maxCompetencyScores: resultData.maxCompetencyScores || {},
        performance: resultData.performance || {},
        
        // Timing information
        completedAt: resultData.completedAt,
        submittedAt: resultData.submittedAt,
        timeSpent: resultData.results?.timeSpent || resultData.results?.completionTime || null,
        
        // Status
        status: resultData.status,
        reviewStatus: resultData.reviewStatus || 'pending',
        
        // Full results data for detailed analysis
        results: resultData.results,
        
        // Metadata
        metadata: {
          language: resultData.metadata?.language || 'en',
          country: resultData.metadata?.country || null,
          gameVersion: resultData.metadata?.gameVersion || '1.0.0',
          apiVersion: resultData.metadata?.apiVersion || '1.0.0'
        }
      };

      results.push(formattedResult);
    }

    // Sort results by submittedAt in memory (to avoid needing composite index)
    results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    console.log('✅ [Get Candidate Results API] Found', results.length, 'candidate results');

    // Step 4: Get summary statistics
    const statistics = {
      totalCandidates: results.length,
      completedAssessments: results.filter(r => r.status === 'completed').length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.scorePercentage, 0) / results.length) : 0,
      performanceDistribution: {
        excellent: results.filter(r => r.performance?.overall === 'excellent').length,
        good: results.filter(r => r.performance?.overall === 'good').length,
        fair: results.filter(r => r.performance?.overall === 'fair').length,
        needs_improvement: results.filter(r => r.performance?.overall === 'needs_improvement').length
      },
      gameBreakdown: results.reduce((acc, r) => {
        acc[r.gameId] = (acc[r.gameId] || 0) + 1;
        return acc;
      }, {})
    };

    console.log('📊 [Get Candidate Results API] Statistics:', JSON.stringify(statistics, null, 2));

    // Step 5: Return results
    const response = {
      success: true,
      data: {
        project: {
          id: projectId,
          name: 'Project' // We can enhance this later by fetching actual project name
        },
        results: results,
        statistics: statistics,
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('🚨 [Get Candidate Results API] Error:', error);
    
    // Make sure we set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', 'https://app.olivinhr.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch candidate results'
    });
  }
}; 