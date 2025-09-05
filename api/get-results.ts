import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('📊 [HR API] Get Assessment Results');
  console.log('   Method:', req.method);
  console.log('   Query:', req.query);

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

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ [Get Results API] Handling OPTIONS request');
    res.status(204).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.log('❌ [HR API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { candidateEmail, projectId, inviteId } = req.query;

    if (!candidateEmail && !inviteId) {
      res.status(400).json({ 
        success: false, 
        error: 'Either candidateEmail or inviteId is required' 
      });
      return;
    }

    console.log('🔍 [HR API] Fetching results for:', { candidateEmail, projectId, inviteId });
    
    const db = getFirestore();
    const resultsRef = db.collection('assessmentResults');
    
    let query;
    if (inviteId) {
      query = resultsRef.where('inviteId', '==', inviteId);
    } else {
      if (projectId) {
        query = resultsRef.where('candidateEmail', '==', candidateEmail).where('projectId', '==', projectId);
      } else {
        query = resultsRef.where('candidateEmail', '==', candidateEmail);
      }
    }

    const querySnapshot = await query.limit(1).get();
    
    if (querySnapshot.empty) {
      res.status(404).json({
        success: false,
        error: 'No assessment results found for this candidate'
      });
      return;
    }

    const resultDoc = querySnapshot.docs[0];
    const resultData = resultDoc.data();
    
    // Also fetch the original invite data for context
    let inviteData = null;
    if (resultData.inviteId) {
      try {
        const invitesRef = db.collection('invites');
        const inviteQuery = await invitesRef.where('id', '==', resultData.inviteId).get();
        if (!inviteQuery.empty) {
          inviteData = inviteQuery.docs[0].data();
        }
      } catch (error) {
        console.warn('⚠️ [HR API] Could not fetch invite data:', error);
      }
    }

    // Format the response
    const response = {
      success: true,
      result: {
        id: resultData.id,
        candidateEmail: resultData.candidateEmail,
        projectId: resultData.projectId,
        selectedGame: resultData.selectedGame,
        submittedAt: resultData.submittedAt,
        candidateInfo: resultData.candidateInfo,
        results: {
          totalScore: resultData.results.totalScore,
          maxScore: resultData.results.maxScore,
          competencyScores: resultData.results.competencyScores,
          answers: resultData.results.answers,
          interactionAnalytics: resultData.results.interactionAnalytics
        },
        invite: inviteData ? {
          roleTag: inviteData.roleTag,
          sentAt: inviteData.sentAt,
          status: inviteData.status
        } : null
      }
    };
    
    console.log('✅ [HR API] Results fetched successfully for:', candidateEmail || inviteId);

    res.status(200).json(response);

  } catch (error) {
    console.error('🚨 [HR API] Error fetching results:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
} 