const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load engagement questions data
let engagementQuestionsData = null;
try {
  const questionsPath = path.join(__dirname, '../../data/employee_engagement_questions.json');
  if (fs.existsSync(questionsPath)) {
    engagementQuestionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  } else {
    console.warn('⚠️ [Submit Results API] Engagement questions JSON not found, using fallback logic');
  }
} catch (error) {
  console.warn('⚠️ [Submit Results API] Failed to load engagement questions:', error.message);
}

// Load team assessment questions data
let teamQuestionsData = null;
try {
  const teamQuestionsPath = path.join(__dirname, '../../data/team_assessment_questions.json');
  if (fs.existsSync(teamQuestionsPath)) {
    teamQuestionsData = JSON.parse(fs.readFileSync(teamQuestionsPath, 'utf8'));
  } else {
    console.warn('⚠️ [Submit Results API] Team questions JSON not found, using fallback logic');
  }
} catch (error) {
  console.warn('⚠️ [Submit Results API] Failed to load team questions:', error.message);
}

// Load manager assessment questions data
let managerQuestionsData = null;
try {
  const managerQuestionsPath = path.join(__dirname, '../../data/manager_assessment_questions.json');
  if (fs.existsSync(managerQuestionsPath)) {
    managerQuestionsData = JSON.parse(fs.readFileSync(managerQuestionsPath, 'utf8'));
  } else {
    console.warn('⚠️ [Submit Results API] Manager questions JSON not found, using fallback logic');
  }
} catch (error) {
  console.warn('⚠️ [Submit Results API] Failed to load manager questions:', error.message);
}

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

// Calculate engagement assessment scores with new P/N logic
function calculateEngagementScores(results) {
  console.log('🧮 [Submit Results API] Calculating engagement scores with new P/N logic');
  
  if (!engagementQuestionsData) {
    console.warn('⚠️ [Submit Results API] No engagement questions data, using fallback scoring');
    return calculateEngagementScoresFallback(results);
  }

  const scores = {};
  const dimensionMap = new Map();
  
  // Initialize dimensions and subdimensions from questions data
  engagementQuestionsData.forEach(question => {
    const dimension = question.dimension;
    const subDimension = question.sub_dimension;
    const dimId = dimension.toLowerCase().replace(/\s+/g, '_');
    const subId = subDimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
    
    if (!dimensionMap.has(dimId)) {
      dimensionMap.set(dimId, {
        name: dimension,
        total: 0,
        count: 0,
        subdimensions: new Map()
      });
    }
    
    if (!dimensionMap.get(dimId).subdimensions.has(subId)) {
      dimensionMap.get(dimId).subdimensions.set(subId, {
        name: subDimension,
        total: 0,
        count: 0
      });
    }
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers with P/N logic
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const question = engagementQuestionsData.find(q => q.id === questionId);
    if (question) {
      const rawValue = parseInt(answerId); // 1-10 scale
      
      if (rawValue >= 1 && rawValue <= 10) {
        let normalizedScore;
        if (question.orientation === 'P') {
          // Positive question: raw score stays the same
          normalizedScore = rawValue;
        } else {
          // Negative question: reverse score (11 - raw)
          normalizedScore = 11 - rawValue;
        }
        
        totalScore += normalizedScore;
        totalQuestions++;
        
        // Add to dimension and subdimension totals
        const dimId = question.dimension.toLowerCase().replace(/\s+/g, '_');
        const subId = question.sub_dimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        
        if (dimensionMap.has(dimId)) {
          const dim = dimensionMap.get(dimId);
          dim.total += normalizedScore;
          dim.count += 1;
          
          if (dim.subdimensions.has(subId)) {
            const sub = dim.subdimensions.get(subId);
            sub.total += normalizedScore;
            sub.count += 1;
          }
        }
      }
    }
  });

  // Calculate final scores
  const finalScores = {};
  
  dimensionMap.forEach((dimData, dimId) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100), // Scale to 10-point system
      total: dimData.total,
      count: dimData.count,
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    dimData.subdimensions.forEach((subData, subId) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 10) * 100),
        total: subData.total,
        count: subData.count
      };
    });
  });

  // Calculate overall engagement score
  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.min(scorePercentage, 100)
  };

  console.log('✅ [Submit Results API] Engagement scores calculated:', {
    totalQuestions,
    overallScore: finalScores.overall.score,
    dimensions: Object.keys(finalScores).filter(k => k !== 'overall')
  });

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Fallback scoring for when questions data is not available
function calculateEngagementScoresFallback(results) {
  console.log('🧮 [Submit Results API] Using fallback engagement scoring');
  
  const scores = {
    duygusal_bağlılık: { total: 0, count: 0 },
    devam_bağlılığı: { total: 0, count: 0 },
    normatif_bağlılık: { total: 0, count: 0 }
  };

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers assuming 1-10 scale and simple dimension mapping
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const rawValue = parseInt(answerId);
    
    if (rawValue >= 1 && rawValue <= 10) {
      // Assume positive orientation for fallback
      const normalizedScore = rawValue;
      
      totalScore += normalizedScore;
      totalQuestions++;
      
      // Simple dimension mapping based on question ID patterns
      if (questionId.startsWith('1.')) {
        scores.duygusal_bağlılık.total += normalizedScore;
        scores.duygusal_bağlılık.count++;
      } else if (questionId.startsWith('2.')) {
        scores.devam_bağlılığı.total += normalizedScore;
        scores.devam_bağlılığı.count++;
      } else if (questionId.startsWith('3.')) {
        scores.normatif_bağlılık.total += normalizedScore;
        scores.normatif_bağlılık.count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Calculate team assessment scores with new P/N logic
function calculateTeamScores(results) {
  console.log('🧮 [Submit Results API] Calculating team scores with new P/N logic');
  
  if (!teamQuestionsData) {
    console.warn('⚠️ [Submit Results API] No team questions data, using fallback scoring');
    return calculateTeamScoresFallback(results);
  }

  const scores = {};
  const dimensionMap = new Map();
  
  // Initialize dimensions and subdimensions from questions data
  teamQuestionsData.forEach(question => {
    const dimension = question.dimension;
    const subDimension = question.sub_dimension;
    const dimId = dimension.toLowerCase().replace(/\s+/g, '_');
    const subId = subDimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
    
    if (!dimensionMap.has(dimId)) {
      dimensionMap.set(dimId, {
        name: dimension,
        total: 0,
        count: 0,
        subdimensions: new Map()
      });
    }
    
    if (!dimensionMap.get(dimId).subdimensions.has(subId)) {
      dimensionMap.get(dimId).subdimensions.set(subId, {
        name: subDimension,
        total: 0,
        count: 0
      });
    }
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers with P/N logic
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const question = teamQuestionsData.find(q => q.id === questionId);
    if (question) {
      const rawValue = parseInt(answerId); // 1-10 scale
      
      if (rawValue >= 1 && rawValue <= 10) {
        let normalizedScore;
        if (question.orientation === 'P') {
          // Positive question: raw score stays the same
          normalizedScore = rawValue;
        } else {
          // Negative question: reverse score (11 - raw)
          normalizedScore = 11 - rawValue;
        }
        
        totalScore += normalizedScore;
        totalQuestions++;
        
        // Add to dimension and subdimension totals
        const dimId = question.dimension.toLowerCase().replace(/\s+/g, '_');
        const subId = question.sub_dimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        
        if (dimensionMap.has(dimId)) {
          const dim = dimensionMap.get(dimId);
          dim.total += normalizedScore;
          dim.count += 1;
          
          if (dim.subdimensions.has(subId)) {
            const sub = dim.subdimensions.get(subId);
            sub.total += normalizedScore;
            sub.count += 1;
          }
        }
      }
    }
  });

  // Calculate final scores
  const finalScores = {};
  
  dimensionMap.forEach((dimData, dimId) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100), // Scale to 10-point system
      total: dimData.total,
      count: dimData.count,
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    dimData.subdimensions.forEach((subData, subId) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 10) * 100),
        total: subData.total,
        count: subData.count
      };
    });
  });

  // Calculate overall team effectiveness score
  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.min(scorePercentage, 100)
  };

  console.log('✅ [Submit Results API] Team scores calculated:', {
    totalQuestions,
    overallScore: finalScores.overall.score,
    dimensions: Object.keys(finalScores).filter(k => k !== 'overall')
  });

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Fallback scoring for when questions data is not available
function calculateTeamScoresFallback(results) {
  console.log('🧮 [Submit Results API] Using fallback team scoring');
  
  const scores = {
    takım_iletişimi: { total: 0, count: 0 },
    ortak_hedefler_ve_vizyon: { total: 0, count: 0 },
    destek_ve_iş_birliği: { total: 0, count: 0 },
    güven_ve_şeffaflık: { total: 0, count: 0 },
    takım_motivasyonu: { total: 0, count: 0 }
  };

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers assuming 1-10 scale and simple dimension mapping
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const rawValue = parseInt(answerId);
    
    if (rawValue >= 1 && rawValue <= 10) {
      // Assume positive orientation for fallback
      const normalizedScore = rawValue;
      
      totalScore += normalizedScore;
      totalQuestions++;
      
      // Simple dimension mapping based on question ID patterns
      if (questionId.startsWith('01-')) {
        scores.takım_iletişimi.total += normalizedScore;
        scores.takım_iletişimi.count++;
      } else if (questionId.startsWith('04-')) {
        scores.ortak_hedefler_ve_vizyon.total += normalizedScore;
        scores.ortak_hedefler_ve_vizyon.count++;
      } else if (questionId.startsWith('07-')) {
        scores.destek_ve_iş_birliği.total += normalizedScore;
        scores.destek_ve_iş_birliği.count++;
      } else if (questionId.startsWith('10-')) {
        scores.güven_ve_şeffaflık.total += normalizedScore;
        scores.güven_ve_şeffaflık.count++;
      } else if (questionId.startsWith('13-')) {
        scores.takım_motivasyonu.total += normalizedScore;
        scores.takım_motivasyonu.count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Calculate manager/team assessment scores with P/N scoring
function calculateManagerScores(results) {
  const dimensions = ['team_communication', 'shared_goals_vision', 'support_collaboration', 'trust_transparency', 'team_motivation'];
  const scores = {};
  
  // Question scoring map: P = Positive, N = Negative
  const questionScoring = {
    1: 'P', 2: 'N', 3: 'P', 4: 'N', 5: 'P', 6: 'N', // Team Communication
    7: 'P', 8: 'P', 9: 'N', 10: 'P', 11: 'N', 12: 'N', // Shared Goals and Vision
    13: 'P', 14: 'N', 15: 'P', 16: 'P', 17: 'N', 18: 'N', // Support and Collaboration
    19: 'P', 20: 'P', 21: 'N', 22: 'N', 23: 'P', 24: 'N', // Trust and Transparency
    25: 'P', 26: 'N', 27: 'N', 28: 'P', 29: 'N', 30: 'P'  // Team Motivation
  };
  
  dimensions.forEach(dim => {
    scores[dim] = { total: 0, count: 0 };
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers with P/N scoring
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const qId = parseInt(questionId);
    const answerValue = parseInt(answerId); // 1-5 scale
    
    if (answerValue >= 1 && answerValue <= 5 && questionScoring[qId]) {
      let score;
      
      if (questionScoring[qId] === 'P') {
        // Positive question: 1=1, 2=2, 3=3, 4=4, 5=5
        score = answerValue;
      } else {
        // Negative question: 1=5, 2=4, 3=3, 4=2, 5=1 (reverse)
        score = 6 - answerValue;
      }
      
      totalScore += score;
      totalQuestions++;
      
      // Map questions to dimensions (6 questions per dimension)
      const dimIndex = Math.floor((qId - 1) / 6);
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

// Calculate manager assessment scores with new P/N logic
function calculateManagerScores(results) {
  console.log('🧮 [Submit Results API] Calculating manager scores with new P/N logic');
  
  if (!managerQuestionsData) {
    console.warn('⚠️ [Submit Results API] No manager questions data, using fallback scoring');
    return calculateManagerScoresFallback(results);
  }

  const scores = {};
  const dimensionMap = new Map();
  
  // Initialize dimensions and subdimensions from questions data
  managerQuestionsData.forEach(question => {
    const dimension = question.dimension;
    const subDimension = question.sub_dimension;
    const dimId = dimension.toLowerCase().replace(/\s+/g, '_');
    const subId = subDimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
    
    if (!dimensionMap.has(dimId)) {
      dimensionMap.set(dimId, {
        name: dimension,
        total: 0,
        count: 0,
        subdimensions: new Map()
      });
    }
    
    if (!dimensionMap.get(dimId).subdimensions.has(subId)) {
      dimensionMap.get(dimId).subdimensions.set(subId, {
        name: subDimension,
        total: 0,
        count: 0
      });
    }
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers with P/N logic
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const question = managerQuestionsData.find(q => q.id === questionId);
    if (question) {
      const rawValue = parseInt(answerId); // 1-10 scale
      
      if (rawValue >= 1 && rawValue <= 10) {
        let normalizedScore;
        if (question.orientation === 'P') {
          // Positive question: raw score stays the same
          normalizedScore = rawValue;
        } else {
          // Negative question: reverse score (11 - raw)
          normalizedScore = 11 - rawValue;
        }
        
        totalScore += normalizedScore;
        totalQuestions++;
        
        // Add to dimension and subdimension totals
        const dimId = question.dimension.toLowerCase().replace(/\s+/g, '_');
        const subId = question.sub_dimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        
        if (dimensionMap.has(dimId)) {
          const dim = dimensionMap.get(dimId);
          dim.total += normalizedScore;
          dim.count += 1;
          
          if (dim.subdimensions.has(subId)) {
            const sub = dim.subdimensions.get(subId);
            sub.total += normalizedScore;
            sub.count += 1;
          }
        }
      }
    }
  });

  // Calculate final scores
  const finalScores = {};
  
  dimensionMap.forEach((dimData, dimId) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100), // Scale to 10-point system
      total: dimData.total,
      count: dimData.count,
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    dimData.subdimensions.forEach((subData, subId) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 10) * 100),
        total: subData.total,
        count: subData.count
      };
    });
  });

  // Calculate overall manager effectiveness score
  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.min(scorePercentage, 100)
  };

  console.log('✅ [Submit Results API] Manager scores calculated:', {
    totalQuestions,
    overallScore: finalScores.overall.score,
    dimensions: Object.keys(finalScores).filter(k => k !== 'overall')
  });

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
  };
}

// Fallback scoring for when questions data is not available
function calculateManagerScoresFallback(results) {
  console.log('🧮 [Submit Results API] Using fallback manager scoring');
  
  const scores = {
    iletişim_ve_erişilebilirlik: { total: 0, count: 0 },
    geri_bildirim_kültürü: { total: 0, count: 0 },
    takım_gelişimi: { total: 0, count: 0 },
    karar_alma_ve_adalet: { total: 0, count: 0 },
    motivasyon_ve_ilham_verme: { total: 0, count: 0 }
  };

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers assuming 1-10 scale and simple dimension mapping
  const answersData = results.answers || results;
  Object.entries(answersData).forEach(([questionId, answerId]) => {
    const rawValue = parseInt(answerId);
    
    if (rawValue >= 1 && rawValue <= 10) {
      // Assume positive orientation for fallback
      const normalizedScore = rawValue;
      
      totalScore += normalizedScore;
      totalQuestions++;
      
      // Simple dimension mapping based on question ID patterns
      if (questionId.startsWith('01-')) {
        scores.iletişim_ve_erişilebilirlik.total += normalizedScore;
        scores.iletişim_ve_erişilebilirlik.count++;
      } else if (questionId.startsWith('04-')) {
        scores.geri_bildirim_kültürü.total += normalizedScore;
        scores.geri_bildirim_kültürü.count++;
      } else if (questionId.startsWith('07-')) {
        scores.takım_gelişimi.total += normalizedScore;
        scores.takım_gelişimi.count++;
      } else if (questionId.startsWith('10-')) {
        scores.karar_alma_ve_adalet.total += normalizedScore;
        scores.karar_alma_ve_adalet.count++;
      } else if (questionId.startsWith('13-')) {
        scores.motivasyon_ve_ilham_verme.total += normalizedScore;
        scores.motivasyon_ve_ilham_verme.count++;
      }
    }
  });

  // Calculate averages
  const finalScores = {};
  Object.entries(scores).forEach(([dimId, dimData]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100)
    };
  });

  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);

  return {
    competencyScores: finalScores,
    overallScore: Math.round(totalScore),
    totalQuestions,
    scorePercentage: Math.min(scorePercentage, 100)
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
    console.log('  - Searching for token:', token.substring(0, 8) + '...');
    console.log('  - Searching for email:', candidateEmailValue);
    
    const invitesQuery = await db.collection('invites')
      .where('token', '==', token)
      .where('candidateEmail', '==', candidateEmailValue)
      .limit(1)
      .get();

    let inviteDoc, inviteData;
    
    if (invitesQuery.empty) {
      console.log('❌ [Submit Results API] Invite not found with both token and email');
      
      // Debug: Try to find invite by token only
      const tokenOnlyQuery = await db.collection('invites')
        .where('token', '==', token)
        .limit(1)
        .get();
      
      if (!tokenOnlyQuery.empty) {
        inviteDoc = tokenOnlyQuery.docs[0];
        inviteData = inviteDoc.data();
        
        console.log('🔍 [Submit Results API] Found invite by token only:');
        console.log('  - Stored email:', inviteData.candidateEmail);
        console.log('  - Submitted email:', candidateEmailValue);
        console.log('  - Email match:', inviteData.candidateEmail === candidateEmailValue);
        
        // Use the invite found by token (email might be case-sensitive or have slight differences)
        console.log('✅ [Submit Results API] Using invite found by token, proceeding with stored email');
      } else {
        console.log('❌ [Submit Results API] No invite found even by token only');
        return res.status(404).json({
          success: false,
          error: 'Invalid invite token or candidate email'
        });
      }
    } else {
      inviteDoc = invitesQuery.docs[0];
      inviteData = inviteDoc.data();
    }
    
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
      
      // Candidate Info - use email from invite to ensure consistency
      candidateEmail: inviteData.candidateEmail,
      candidateInfo: candidateInfo || { email: inviteData.candidateEmail },
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
    console.log('  - Saving with projectId:', resultDocument.projectId);
    console.log('  - Saving with candidateEmail:', resultDocument.candidateEmail);
    console.log('  - Saving with assessmentType:', resultDocument.assessmentType);
    
    // Save to candidateResults collection (not testResults)
    await db.collection('candidateResults').doc(resultId).set(resultDocument);
    
    console.log('✅ [Submit Results API] Result saved successfully to candidateResults collection');
    console.log('  - Document ID:', resultId);
    console.log('  - Searchable by projectId:', resultDocument.projectId);

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