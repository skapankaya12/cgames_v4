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
  console.log('📊 [Game API] Submit Assessment Results');
  console.log('   Method:', req.method);

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ [Game API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { token, results, candidateInfo } = req.body;

    if (!token || !results) {
      res.status(400).json({ 
        success: false, 
        error: 'Token and results are required' 
      });
      return;
    }

    console.log('🔄 [Game API] Processing results for token:', token.substring(0, 8) + '...');
    
    const db = getFirestore();
    
    // Find the invite by token
    const invitesRef = db.collection('invites');
    const inviteQuery = await invitesRef.where('token', '==', token).get();
    
    if (inviteQuery.empty) {
      res.status(404).json({
        success: false,
        error: 'Invite not found'
      });
      return;
    }

    const inviteDoc = inviteQuery.docs[0];
    const inviteData = inviteDoc.data();
    
    // Create assessment result document
    const resultId = 'result_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const assessmentResult = {
      id: resultId,
      inviteId: inviteData.id,
      candidateEmail: inviteData.candidateEmail,
      projectId: inviteData.projectId || '',
      selectedGame: inviteData.selectedGame || 'Leadership Scenario Game',
      results: results,
      candidateInfo: candidateInfo || {},
      submittedAt: Date.now(),
      companyId: 'default'
    };

    // Save results to assessmentResults collection
    await db.collection('assessmentResults').doc(resultId).set(assessmentResult);

    // Update invite status to completed
    await inviteDoc.ref.update({
      status: 'completed',
      completedAt: Date.now(),
      resultId: resultId
    });

    // Update candidate status in project if projectId exists
    if (inviteData.projectId) {
      try {
        const projectsRef = db.collection('companies').doc('default').collection('projects').doc(inviteData.projectId);
        
        // Update project stats
        const projectDoc = await projectsRef.get();
        if (projectDoc.exists) {
          const projectData = projectDoc.data();
          const currentStats = projectData?.stats || {};
          
          await projectsRef.update({
            'stats.completedCandidates': (currentStats.completedCandidates || 0) + 1,
            'stats.inProgressCandidates': Math.max((currentStats.inProgressCandidates || 0) - 1, 0),
            updatedAt: Date.now()
          });
        }
        
        // Create or update candidate record in project
        const candidatesRef = projectsRef.collection('candidates');
        const candidateQuery = await candidatesRef.where('email', '==', inviteData.candidateEmail).get();
        
        if (!candidateQuery.empty) {
          // Update existing candidate
          const candidateDoc = candidateQuery.docs[0];
          await candidateDoc.ref.update({
            status: 'Completed',
            completedAt: Date.now(),
            resultId: resultId,
            results: results
          });
        } else {
          // Create new candidate record
          await candidatesRef.add({
            email: inviteData.candidateEmail,
            inviteId: inviteData.id,
            status: 'Completed',
            dateInvited: new Date(inviteData.sentAt).toISOString(),
            dateCompleted: new Date().toISOString(),
            projectId: inviteData.projectId,
            resultId: resultId,
            results: results
          });
        }
      } catch (error) {
        console.warn('⚠️ [Game API] Failed to update project/candidate records:', error);
      }
    }
    
    console.log('✅ [Game API] Assessment results submitted successfully');

    res.status(200).json({
      success: true,
      resultId: resultId,
      message: 'Results submitted successfully'
    });

  } catch (error) {
    console.error('🚨 [Game API] Error submitting results:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
} 