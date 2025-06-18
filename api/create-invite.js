const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating invite with data:', req.body);
    
    const { email, projectId, role = 'candidate' } = req.body;

    if (!email || !projectId) {
      return res.status(400).json({ 
        error: 'Missing required fields: email and projectId are required' 
      });
    }

    // Create invite document
    const inviteData = {
      email,
      projectId,
      role,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      inviteCode: Math.random().toString(36).substring(2, 15)
    };

    const docRef = await addDoc(collection(db, 'invites'), inviteData);
    
    console.log('Invite created successfully:', docRef.id);

    return res.status(200).json({
      success: true,
      inviteId: docRef.id,
      inviteCode: inviteData.inviteCode,
      message: 'Invite created successfully'
    });

  } catch (error) {
    console.error('Error creating invite:', error);
    return res.status(500).json({
      error: 'Failed to create invite',
      details: error.message
    });
  }
}; 