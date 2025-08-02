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
  console.log('🔄 [Game API] Update Invite Status');
  console.log('   Method:', req.method);
  console.log('   Body:', req.body);

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ [Game API] Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { token, status } = req.body;

    if (!token || !status) {
      res.status(400).json({ 
        success: false, 
        error: 'Token and status are required' 
      });
      return;
    }

    console.log('🔄 [Game API] Updating invite status:', { token: token.substring(0, 8) + '...', status });
    
    // Update invite status in Firestore
    const db = getFirestore();
    const invitesRef = db.collection('invites');
    const query = await invitesRef.where('token', '==', token).get();
    
    if (query.empty) {
      res.status(404).json({
        success: false,
        error: 'Invite not found'
      });
      return;
    }

    const inviteDoc = query.docs[0];
    const inviteData = inviteDoc.data();
    
    // Update the status
    await inviteDoc.ref.update({
      status: status,
      updatedAt: Date.now(),
      ...(status === 'started' && { startedAt: Date.now() }),
      ...(status === 'completed' && { completedAt: Date.now() })
    });

    // Also update candidate status in project if projectId exists
    if (inviteData.projectId) {
      try {
        const projectsRef = db.collection('companies').doc('default').collection('projects').doc(inviteData.projectId);
        const candidatesRef = projectsRef.collection('candidates');
        const candidateQuery = await candidatesRef.where('email', '==', inviteData.candidateEmail).get();
        
        if (!candidateQuery.empty) {
          const candidateDoc = candidateQuery.docs[0];
          await candidateDoc.ref.update({
            status: status === 'started' ? 'InProgress' : status === 'completed' ? 'Completed' : 'Invited',
            updatedAt: Date.now()
          });
        }
      } catch (error) {
        console.warn('⚠️ [Game API] Failed to update candidate status in project:', error);
      }
    }
    
    console.log('✅ [Game API] Invite status updated successfully');

    res.status(200).json({
      success: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('🚨 [Game API] Error updating invite status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
} 