const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// CORS headers for cross-origin requests from app.olivinhr.com
const allowedOrigins = [
  'https://app.olivinhr.com',
  'https://game.olivinhr.com',
  'https://cgames-v4-hr-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Helper function to get assessment display name
function getAssessmentDisplayName(assessmentType) {
  const displayNames = {
    'calisan-bagliligi': 'Çalışan Bağlılığı Değerlendirmesi',
    'takim-degerlendirme': 'Takım Değerlendirme Anketi',
    'yonetici-degerlendirme': 'Yönetici Değerlendirme Anketi',
    'space-mission': 'Space Mission',
    'leadership-scenario': 'Leadership Scenario'
  };
  return displayNames[assessmentType] || 'Assessment';
}

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    console.log('🔥 [Submit Results API] Initializing Firebase Admin...');
    
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
    
    console.log('✅ [Submit Results API] Firebase Admin initialized successfully');
  }
  
  return getFirestore();
}

// Calculate scores based on assessment type
function calculateAssessmentScores(results, assessmentType) {
  console.log('🧮 [Submit Results API] Calculating scores for assessment type:', assessmentType);
  
  // Handle new assessment types
  if (assessmentType === 'calisan-bagliligi') {
    return calculateEngagementScores(results);
  } else if (assessmentType === 'takim-degerlendirme') {
    return calculateTeamScores(results);
  } else if (assessmentType === 'yonetici-degerlendirme') {
    return calculateManagerScores(results);
  } else {
    // Default to space mission competency scoring
    return calculateCompetencyScores(results);
  }
}

// Calculate engagement assessment scores
function calculateEngagementScores(results) {
  const scores = {
    emotional: { total: 0, count: 0 },
    continuance: { total: 0, count: 0 },
    normative: { total: 0, count: 0 }
  };

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const qId = parseInt(questionId);
    const score = parseInt(answerId); // 1-5 Likert scale
    
    if (score >= 1 && score <= 5) {
      totalScore += score;
      totalQuestions++;
      
      // Map questions to dimensions (simplified mapping)
      if (qId >= 1 && qId <= 9) {
        scores.emotional.total += score;
        scores.emotional.count++;
      } else if (qId >= 10 && qId <= 15) {
        scores.continuance.total += score;
        scores.continuance.count++;
      } else if (qId >= 16 && qId <= 22) {
        scores.normative.total += score;
        scores.normative.count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 5) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 5) * 100);

  return {
    competencyScores: finalScores,
    overallScore: totalScore,
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Calculate team assessment scores
function calculateTeamScores(results) {
  const dimensions = ['communication', 'shared_goals', 'support_collaboration', 'trust_transparency', 'motivation'];
  const scores = {};
  
  dimensions.forEach(dim => {
    scores[dim] = { total: 0, count: 0 };
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const qId = parseInt(questionId);
    const score = parseInt(answerId);
    
    if (score >= 1 && score <= 5) {
      totalScore += score;
      totalQuestions++;
      
      // Map questions to dimensions (5 questions per dimension)
      const dimIndex = Math.floor((qId - 1) / 5);
      if (dimIndex >= 0 && dimIndex < dimensions.length) {
        const dimension = dimensions[dimIndex];
        scores[dimension].total += score;
        scores[dimension].count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 5) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 5) * 100);

  return {
    competencyScores: finalScores,
    overallScore: totalScore,
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Calculate manager assessment scores
function calculateManagerScores(results) {
  const dimensions = ['communication', 'feedback_culture', 'team_development', 'fairness', 'motivation_leadership'];
  const scores = {};
  
  dimensions.forEach(dim => {
    scores[dim] = { total: 0, count: 0 };
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const qId = parseInt(questionId);
    const score = parseInt(answerId);
    
    if (score >= 1 && score <= 5) {
      totalScore += score;
      totalQuestions++;
      
      // Map questions to dimensions (5 questions per dimension)
      const dimIndex = Math.floor((qId - 1) / 5);
      if (dimIndex >= 0 && dimIndex < dimensions.length) {
        const dimension = dimensions[dimIndex];
        scores[dimension].total += score;
        scores[dimension].count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 5) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 5) * 100);

  return {
    competencyScores: finalScores,
    overallScore: totalScore,
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Calculate competency scores for Space Mission (existing logic)
function calculateCompetencyScores(results) {
  // This should ideally import from a shared questions file, but for now we'll use a comprehensive set
  // In production, this should load from the same source as the frontend
  const questionWeights = {
    1: { A: { "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 2, "TO": 5, "RL": 4, "RI": 1 }, B: { "DM": 3, "IN": 5, "AD": 3, "CM": 2, "ST": 4, "TO": 4, "RL": 3, "RI": 2 }, C: { "DM": 4, "IN": 3, "AD": 3, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5 }, D: { "DM": 2, "IN": 2, "AD": 3, "CM": 2, "ST": 5, "TO": 1, "RL": 3, "RI": 2 } },
    2: { A: { "DM": 4, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 5, "RL": 4, "RI": 2 }, B: { "DM": 3, "IN": 4, "AD": 5, "CM": 1, "ST": 2, "TO": 2, "RL": 2, "RI": 5 }, C: { "DM": 2, "IN": 1, "AD": 2, "CM": 2, "ST": 4, "TO": 1, "RL": 3, "RI": 3 }, D: { "DM": 3, "IN": 1, "AD": 3, "CM": 0, "ST": 5, "TO": 1, "RL": 5, "RI": 1 } },
    3: { A: { "DM": 3, "IN": 2, "AD": 2, "CM": 5, "ST": 3, "TO": 4, "RL": 2, "RI": 3 }, B: { "DM": 5, "IN": 4, "AD": 1, "CM": 2, "ST": 4, "TO": 2, "RL": 4, "RI": 2 }, C: { "DM": 2, "IN": 3, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 1, "RI": 4 }, D: { "DM": 4, "IN": 1, "AD": 3, "CM": 1, "ST": 5, "TO": 1, "RL": 3, "RI": 5 } },
    4: { A: { "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 3, "RI": 3 }, B: { "DM": 3, "IN": 4, "AD": 3, "CM": 3, "ST": 3, "TO": 3, "RL": 2, "RI": 4 }, C: { "DM": 2, "IN": 3, "AD": 4, "CM": 2, "ST": 2, "TO": 2, "RL": 1, "RI": 5 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 4, "RI": 2 } },
    5: { A: { "DM": 3, "IN": 3, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 4, "RI": 2 }, B: { "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 4, "TO": 2, "RL": 3, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 2, "RI": 4 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 3, "TO": 1, "RL": 1, "RI": 5 } },
    6: { A: { "DM": 3, "IN": 3, "AD": 4, "CM": 2, "ST": 2, "TO": 3, "RL": 3, "RI": 4 }, B: { "DM": 4, "IN": 2, "AD": 2, "CM": 3, "ST": 3, "TO": 2, "RL": 4, "RI": 3 }, C: { "DM": 2, "IN": 4, "AD": 3, "CM": 4, "ST": 2, "TO": 4, "RL": 2, "RI": 3 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } },
    7: { A: { "DM": 4, "IN": 2, "AD": 2, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 3 }, B: { "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 2, "TO": 2, "RL": 4, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 4, "ST": 2, "TO": 4, "RL": 2, "RI": 2 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } },
    8: { A: { "DM": 4, "IN": 3, "AD": 2, "CM": 2, "ST": 3, "TO": 5, "RL": 2, "RI": 2 }, B: { "DM": 3, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 2, "RI": 5 }, C: { "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 4 }, D: { "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 4, "TO": 2, "RL": 1, "RI": 5 } },
    9: { A: { "DM": 3, "IN": 3, "AD": 2, "CM": 3, "ST": 3, "TO": 4, "RL": 5, "RI": 1 }, B: { "DM": 2, "IN": 2, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 5, "RI": 1 }, C: { "DM": 5, "IN": 1, "AD": 1, "CM": 2, "ST": 5, "TO": 5, "RL": 2, "RI": 3 }, D: { "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 4, "TO": 5, "RL": 3, "RI": 2 } },
    10: { A: { "DM": 3, "IN": 2, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 5, "RI": 2 }, B: { "DM": 5, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 5, "RL": 2, "RI": 3 }, C: { "DM": 2, "IN": 3, "AD": 3, "CM": 2, "ST": 5, "TO": 2, "RL": 3, "RI": 2 }, D: { "DM": 4, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } },
    11: { A: { "DM": 3, "IN": 3, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 4, "RI": 2 }, B: { "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 4, "TO": 2, "RL": 3, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 4, "RL": 2, "RI": 3 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 3, "TO": 1, "RL": 1, "RI": 5 } },
    12: { A: { "DM": 4, "IN": 2, "AD": 2, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 3 }, B: { "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 2, "TO": 2, "RL": 4, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 4, "ST": 2, "TO": 4, "RL": 2, "RI": 2 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } },
    13: { A: { "DM": 3, "IN": 3, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 4, "RI": 2 }, B: { "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 4, "TO": 2, "RL": 3, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 4, "RL": 2, "RI": 3 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 3, "TO": 1, "RL": 1, "RI": 5 } },
    14: { A: { "DM": 4, "IN": 2, "AD": 2, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 3 }, B: { "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 2, "TO": 2, "RL": 4, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 4, "ST": 2, "TO": 4, "RL": 2, "RI": 2 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } },
    15: { A: { "DM": 3, "IN": 3, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 4, "RI": 2 }, B: { "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 4, "TO": 2, "RL": 3, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 4, "RL": 2, "RI": 3 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 3, "TO": 1, "RL": 1, "RI": 5 } },
    16: { A: { "DM": 4, "IN": 2, "AD": 2, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 3 }, B: { "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 2, "TO": 2, "RL": 4, "RI": 4 }, C: { "DM": 2, "IN": 4, "AD": 4, "CM": 4, "ST": 2, "TO": 4, "RL": 2, "RI": 2 }, D: { "DM": 5, "IN": 1, "AD": 1, "CM": 1, "ST": 4, "TO": 1, "RL": 1, "RI": 5 } }
  };

  const competencyScores = {};
  const maxCompetencyScores = {};
  let totalQuestions = 0;
  let overallScore = 0;

  // Initialize scores
  const competencies = ["DM", "IN", "AD", "CM", "ST", "TO", "RL", "RI"];
  competencies.forEach(comp => {
    competencyScores[comp] = 0;
    maxCompetencyScores[comp] = 0;
  });

  // Extract answers data (handle both old and new formats)
  let answersData = {};
  if (results.answers) {
    answersData = results.answers;
  } else {
    // Handle old format where results directly contains answers
    Object.entries(results).forEach(([key, value]) => {
      const questionId = parseInt(key);
      if (!isNaN(questionId) && typeof value === 'string') {
        answersData[questionId] = value;
      }
    });
  }

  // Calculate user scores based on their answers
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const qId = parseInt(questionId);
    const questionWeightData = questionWeights[qId];
    
    if (questionWeightData && questionWeightData[answerId]) {
      totalQuestions++;
      let questionScore = 0;
      const selectedWeights = questionWeightData[answerId];
      
      Object.entries(selectedWeights).forEach(([comp, weight]) => {
        competencyScores[comp] += weight;
        questionScore += weight;
      });
      overallScore += questionScore;
    }
  });

  // Calculate maximum possible scores for each competency
  Object.entries(questionWeights).forEach(([qId, options]) => {
    competencies.forEach(comp => {
      const weights = Object.values(options).map(option => option[comp] || 0);
      const highestWeight = Math.max(...weights);
      maxCompetencyScores[comp] += highestWeight;
    });
  });

  // Calculate average score per question for percentage
  const avgScorePerQuestion = totalQuestions > 0 ? overallScore / totalQuestions : 0;
  const maxPossibleAvgPerQuestion = 5; // Approximate max average per question
  const scorePercentage = Math.round((avgScorePerQuestion / maxPossibleAvgPerQuestion) * 100);

  return {
    competencyScores,
    maxCompetencyScores,
    overallScore,
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100) // Cap at 100%
  };
}

module.exports = async function handler(req, res) {
  console.log('📊 [Submit Results API] Request received:', req.method, req.url);
  
  // Set CORS headers early so all responses match the caller's origin
  const origin = req.headers.origin || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ [Submit Results API] Handling OPTIONS request');
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ [Submit Results API] Method not allowed:', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const db = initializeFirebaseAdmin();
    
    // Extract data from request body
    const {
      token,
      candidateEmail,
      candidateInfo,
      projectId,
      gameId,
      assessmentType,
      assessmentName,
      answers,
      scores,
      results,
      completedAt,
      completionTime,
      totalQuestions,
      completedQuestions,
      metadata = {}
    } = req.body;

    // Validate required fields - support both old and new formats
    const hasResults = results || answers;
    const candidateEmailValue = candidateEmail || candidateInfo?.email;
    
    if (!token || !candidateEmailValue || !hasResults) {
      console.log('❌ [Submit Results API] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: token, candidateEmail/candidateInfo.email, results/answers'
      });
    }

    console.log('📊 [Submit Results API] Processing results submission:');
    console.log('  - Token:', token.substring(0, 8) + '...');
    console.log('  - Candidate:', candidateEmailValue);
    console.log('  - Assessment Type:', assessmentType);
    console.log('  - Assessment Name:', assessmentName);
    console.log('  - Project ID:', projectId);
    console.log('  - Game ID:', gameId);
    console.log('  - Results keys:', Object.keys(hasResults));

    // 1. First, verify the invite exists and get invite data
    console.log('🔍 [Submit Results API] Step 1: Verifying invite...');
    const invitesQuery = await db.collection('invites')
      .where('token', '==', token)
      .where('candidateEmail', '==', candidateEmailValue)
      .limit(1)
      .get();

    if (invitesQuery.empty) {
      console.log('❌ [Submit Results API] Invite not found');
      return res.status(404).json({
        success: false,
        error: 'Invalid invite token or candidate email'
      });
    }

    const inviteDoc = invitesQuery.docs[0];
    const inviteData = inviteDoc.data();
    
    console.log('✅ [Submit Results API] Invite verified');
    console.log('  - Invite ID:', inviteDoc.id);
    console.log('  - Project ID:', inviteData.projectId);
    console.log('  - Status:', inviteData.status);

    // 2. Calculate assessment scores
    console.log('🧮 [Submit Results API] Step 2: Calculating assessment scores...');
    
    // Determine assessment type from invite data or request
    const finalAssessmentType = assessmentType || inviteData.assessmentType || inviteData.selectedGame || 'space-mission';
    
    // Use provided scores if available, otherwise calculate
    let calculatedScores;
    if (scores && Object.keys(scores).length > 0) {
      console.log('  - Using provided scores from frontend');
      calculatedScores = {
        competencyScores: scores,
        overallScore: totalQuestions ? (Object.values(scores).reduce((sum, score) => sum + (score.score || 0), 0)) : 0,
        totalQuestions: totalQuestions || completedQuestions || 0,
        scorePercentage: Object.values(scores).reduce((sum, score) => sum + (score.percentage || 0), 0) / Object.keys(scores).length || 0
      };
    } else {
      console.log('  - Calculating scores on backend');
      const resultsData = results || { answers };
      calculatedScores = calculateAssessmentScores(resultsData, finalAssessmentType);
    }

    console.log('  - Overall Score:', calculatedScores.overallScore, '/', calculatedScores.totalQuestions, `(${calculatedScores.scorePercentage}%)`);

    // 3. Create comprehensive result document for candidateResults collection
    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const resultDocument = {
      // Identification
      id: resultId,
      token: token,
      inviteId: inviteDoc.id,
      
      // Candidate Info
      candidateEmail: candidateEmailValue,
      candidateInfo: candidateInfo || { email: candidateEmailValue },
      projectId: inviteData.projectId,
      
      // Assessment Info
      assessmentType: finalAssessmentType,
      assessmentName: assessmentName || getAssessmentDisplayName(finalAssessmentType),
      gameId: gameId || inviteData.selectedGame || finalAssessmentType,
      gameName: assessmentName || getAssessmentDisplayName(finalAssessmentType),
      
      // Results
      results: results || { answers },
      answers: answers || results?.answers || {},
      rawScore: calculatedScores.overallScore,
      scorePercentage: Math.round(calculatedScores.scorePercentage),
      totalQuestions: calculatedScores.totalQuestions,
      completedQuestions: completedQuestions || calculatedScores.totalQuestions,
      competencyScores: calculatedScores.competencyScores,
      maxCompetencyScores: calculatedScores.maxCompetencyScores || {},
      
      // Performance Analysis
      performance: {
        overall: calculatedScores.scorePercentage >= 80 ? 'excellent' : calculatedScores.scorePercentage >= 60 ? 'good' : calculatedScores.scorePercentage >= 40 ? 'fair' : 'needs_improvement',
        strengths: [], // Can be enhanced later
        improvements: [], // Can be enhanced later
        timeSpent: completionTime || results?.timeSpent || results?.completionTime || null,
        completionRate: calculatedScores.totalQuestions > 0 ? Math.round((completedQuestions || calculatedScores.totalQuestions) / calculatedScores.totalQuestions * 100) : 0
      },
      
      // Metadata
      completedAt: completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        apiVersion: '2.0.0',
        submissionSource: 'game-platform',
        inviteId: inviteDoc.id,
        userAgent: req.headers['user-agent'] || 'unknown'
      },
      
      // Status
      status: 'completed',
      reviewStatus: 'pending'
    };

    console.log('💾 [Submit Results API] Step 3: Saving result document...');
    
    // Save to candidateResults collection (not testResults)
    await db.collection('candidateResults').doc(resultId).set(resultDocument);
    
    console.log('✅ [Submit Results API] Result saved successfully to candidateResults collection');

    // 4. Update invite status to 'completed'
    console.log('🔄 [Submit Results API] Step 4: Updating invite status...');
    
    await inviteDoc.ref.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      resultId: resultId,
      scorePercentage: calculatedScores.scorePercentage,
      rawScore: calculatedScores.overallScore
    });
    
    console.log('✅ [Submit Results API] Invite status updated to completed');

    // 5. Return success response
    const response = {
      success: true,
      message: 'Results submitted successfully',
      resultId: resultId,
      completedAt: resultDocument.completedAt,
      scorePercentage: calculatedScores.scorePercentage,
      performance: resultDocument.performance.overall
    };

    console.log('🎉 [Submit Results API] Success! Results submitted for:', candidateEmailValue);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('🚨 [Submit Results API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to submit results'
    });
  }
}; 