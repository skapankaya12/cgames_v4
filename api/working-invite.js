const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function initializeFirebase() {
  if (!getApps().length) {
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
          projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
          clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
          privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 Firebase initialization error:', error);
      throw error;
    }
  }
}

async function createInvite(data) {
  console.log('🔄 [CreateInvite] Starting invite creation for:', data.candidateEmail);
  
  try {
    const db = getFirestore();
    
    // Get company ID from authenticated user
    let companyId = data.companyId;
    if (!companyId) {
      throw new Error('Company ID is required for invite creation');
    }
    
    // Game ID mapping for better routing
    const getGameIdFromName = (gameName) => {
      const gameMapping = {
        'Space Mission': 'space-mission',
        'Leadership Scenario Game': 'leadership-scenario', 
        'Team Building Simulation': 'team-building'
      };
      return gameMapping[gameName] || 'leadership-scenario';
    };

    // If projectId is provided, get the selected game from project
    let selectedGameName = data.selectedGame;
    if (data.projectId && !selectedGameName) {
      try {
        const projectDoc = await db.collection('companies').doc(companyId).collection('projects').doc(data.projectId).get();
        if (projectDoc.exists) {
          const projectData = projectDoc.data();
          // Priority: assessmentType > gamePreferences > suggestedGames > default
          selectedGameName = projectData?.assessmentType || 
                            projectData?.customization?.gamePreferences?.[0] || 
                            projectData?.recommendations?.suggestedGames?.[0] || 
                            'Space Mission';
        }
      } catch (error) {
        console.warn('⚠️ [CreateInvite] Could not fetch project game preferences:', error);
        selectedGameName = 'Space Mission'; // Default fallback
      }
    }

    // Convert to game ID for cleaner URLs and better routing
    const selectedGameId = getGameIdFromName(selectedGameName || 'Leadership Scenario Game');
    
    // Generate simple ID and token with 7-day expiry
    const inviteId = 'invite_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const token = Math.random().toString(36).substr(2, 32);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const invite = {
      id: inviteId,
      candidateEmail: data.candidateEmail,
      token,
      status: 'pending',
      sentAt: Date.now(),
      expiresAt: expiresAt,
      sentBy: data.sentBy,
      projectId: data.projectId || '',
      roleTag: data.roleTag || 'candidate',
      selectedGame: selectedGameId, // Store game ID for routing
      selectedGameName: selectedGameName || 'Space Mission', // Store name for display
      companyId: companyId,
    };

    console.log('💾 [CreateInvite] Saving invite to Firestore:', inviteId);
    // Save to Firestore
    await db.collection('invites').doc(inviteId).set(invite);
    
    console.log('✅ [CreateInvite] Invite created successfully:', inviteId);
    return invite;
    
  } catch (error) {
    console.error('🚨 [CreateInvite] Error:', error);
    throw error;
  }
}

async function sendInvitationEmail(data) {
  console.log('📧 [SendGridService] Starting email send to:', data.candidateEmail);
  
  try {
    console.log('📦 [SendGridService] Importing @sendgrid/mail...');
    const sgMail = (await import('@sendgrid/mail')).default;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    console.log('🔑 [SendGridService] Setting SendGrid API key...');
    sgMail.setApiKey(apiKey);
    
    const gameBaseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_GAME_PLATFORM_URL || 'https://game.olivinhr.com'
      : 'http://localhost:5174'; // Use local development URL
    
    const inviteUrl = `${gameBaseUrl}?token=${data.token}&gameId=${data.selectedGame || 'leadership-scenario'}`;
    
    console.log('✉️ [SendGridService] Invite URL:', inviteUrl);
    console.log('✉️ [SendGridService] Preparing email message...');
    const msg = {
      to: data.candidateEmail,
      from: 'noreply@olivinhr.com',
      subject: `${data.companyName} Assessment Invitation - ${data.selectedGameName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">You're Invited to Complete an Assessment</h2>
          <p>Hello,</p>
                      <p><strong>${data.companyName}</strong> has invited you to complete a <strong>${data.selectedGameName}</strong> assessment.</p>
          ${data.roleTag && data.roleTag !== 'candidate' ? `<p><strong>Company:</strong> ${data.companyName}<br><strong>Role:</strong> ${data.roleTag}</p>` : `<p><strong>Company:</strong> ${data.companyName}</p>`}
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteUrl}" 
               style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Start ${data.selectedGame} Assessment
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            <strong>Assessment Details:</strong><br>
            • Game: ${data.selectedGame}<br>
            • Estimated Duration: 30-45 minutes<br>
            • This link expires in 7 days<br>
            • You can access the assessment multiple times, but can only submit once
          </p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The ${data.companyName} Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            This assessment is powered by OlivinHR. 
            <a href="${inviteUrl}" style="color: #4F46E5;">Click here to start your assessment</a>
          </p>
        </div>
      `,
    };
    
    console.log('📤 [SendGridService] Sending email...');
    await sgMail.send(msg);
    console.log('✅ [SendGridService] Email sent successfully to:', data.candidateEmail);
    
  } catch (error) {
    console.error('🚨 [SendGridService] Error sending email:', error);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  console.log('🚀 [Working Invite API] Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Working Invite API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ [Working Invite API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    const { email, projectId, roleTag } = req.body || {};

    if (!email) {
      console.log('❌ [Working Invite API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'email is required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    // Get user context from Authorization header
    let userCompanyId = null;
    let companyName = 'OlivinHR'; // Default fallback

    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const { getAuth } = await import('firebase-admin/auth');
        const auth = getAuth();
        const token = authHeader.split(' ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;
        
        console.log('🔑 [Working Invite API] Verified user:', userId);
        
        // Get user's company ID from hrUsers collection
        const hrUserDoc = await db.collection('hrUsers').doc(userId).get();
        if (hrUserDoc.exists) {
          const hrUserData = hrUserDoc.data();
          userCompanyId = hrUserData.companyId;
          console.log('🏢 [Working Invite API] User company ID:', userCompanyId);
          
          // Get company name
          if (userCompanyId) {
            const companyDoc = await db.collection('companies').doc(userCompanyId).get();
            if (companyDoc.exists) {
              const companyData = companyDoc.data();
              companyName = companyData.name || companyName;
              console.log('🏢 [Working Invite API] Company name:', companyName);
            }
          }
        }
      }
    } catch (authError) {
      console.warn('⚠️ [Working Invite API] Auth error, using fallback:', authError.message);
      // If auth fails, try to get company ID from project (fallback)
      if (projectId) {
        try {
          // Search all companies for this project
          const companiesSnapshot = await db.collection('companies').get();
          for (const companyDoc of companiesSnapshot.docs) {
            const projectRef = companyDoc.ref.collection('projects').doc(projectId);
            const projectDoc = await projectRef.get();
            if (projectDoc.exists) {
              userCompanyId = companyDoc.id;
              const companyData = companyDoc.data();
              companyName = companyData.name || companyName;
              console.log('🏢 [Working Invite API] Found company via project:', companyName);
              break;
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ [Working Invite API] Fallback failed:', fallbackError.message);
        }
      }
    }

    if (!userCompanyId) {
      console.log('❌ [Working Invite API] Could not determine user company');
      return res.status(403).json({
        success: false,
        error: 'Could not determine user company context'
      });
    }

    console.log('🔄 [Working Invite API] Step 1: Creating invite...');
    
    // Create invite in database
    const invite = await createInvite({
      candidateEmail: email,
      sentBy: 'system',
      projectId: projectId || '',
      roleTag: roleTag || 'candidate',
      companyId: userCompanyId
    });

    console.log('🔄 [Working Invite API] Step 2: Sending invitation email...');
    
    // Send invitation email
    await sendInvitationEmail({
      candidateEmail: email,
      token: invite.token,
      projectId: projectId || '',
      roleTag: roleTag || 'candidate',
      companyName: companyName,
      selectedGame: invite.selectedGame, // Game ID for URL
      selectedGameName: invite.selectedGameName // Game name for display
    });

    console.log('✅ [Working Invite API] Invite created and email sent successfully');

    // Success response
    return res.status(201).json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.candidateEmail,
        roleTag: invite.roleTag,
        selectedGame: invite.selectedGame,
        status: invite.status,
        expiresAt: invite.expiresAt,
        gameUrl: `http://localhost:5174?token=${invite.token}&gameId=${invite.selectedGame}`
      }
    });

  } catch (error) {
    console.error('🚨 [Working Invite API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create invite and send email'
    });
  }
}; 