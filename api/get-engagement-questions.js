const fs = require('fs');
const path = require('path');

// CORS headers for cross-origin requests
const allowedOrigins = [
  'https://app.olivinhr.com',
  'https://hub.olivinhr.com',
  'https://cgames-v4-hr-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Load engagement questions data
let engagementQuestionsData = null;
try {
  const questionsPath = path.join(__dirname, 'data/employee_engagement_questions.json');
  if (fs.existsSync(questionsPath)) {
    engagementQuestionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log('✅ [Get Engagement Questions API] Loaded', engagementQuestionsData.length, 'questions');
  } else {
    console.error('❌ [Get Engagement Questions API] Questions file not found at:', questionsPath);
  }
} catch (error) {
  console.error('❌ [Get Engagement Questions API] Failed to load questions:', error.message);
}

module.exports = async function handler(req, res) {
  console.log('🚀 [Get Engagement Questions API] Request received:', req.method, req.url);
  
  try {
    // Set CORS headers
    const origin = req.headers.origin || '';
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
      console.log('✅ [Get Engagement Questions API] Handling OPTIONS request');
      return res.status(204).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get Engagement Questions API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed - GET required' 
      });
    }

    // Check if questions data is available
    if (!engagementQuestionsData) {
      console.error('❌ [Get Engagement Questions API] No questions data available');
      return res.status(500).json({
        success: false,
        error: 'Engagement questions data not available'
      });
    }

    // Extract query parameters for filtering/pagination if needed
    const { limit, offset, dimension } = req.query;
    
    let questions = engagementQuestionsData;
    
    // Filter by dimension if specified
    if (dimension) {
      questions = questions.filter(q => 
        q.dimension.toLowerCase().includes(dimension.toLowerCase())
      );
    }
    
    // Apply pagination if specified
    const startIndex = offset ? parseInt(offset) : 0;
    const endIndex = limit ? startIndex + parseInt(limit) : questions.length;
    const paginatedQuestions = questions.slice(startIndex, endIndex);
    
    // Generate dimensions summary
    const dimensionsMap = new Map();
    engagementQuestionsData.forEach(question => {
      const dimension = question.dimension;
      const subDimension = question.sub_dimension;
      
      if (!dimensionsMap.has(dimension)) {
        dimensionsMap.set(dimension, {
          name: dimension,
          subdimensions: new Set(),
          questionCount: 0
        });
      }
      
      const dim = dimensionsMap.get(dimension);
      dim.subdimensions.add(subDimension);
      dim.questionCount += 1;
    });
    
    const dimensions = Array.from(dimensionsMap.entries()).map(([key, value]) => ({
      name: key,
      subdimensions: Array.from(value.subdimensions),
      questionCount: value.questionCount
    }));

    console.log('✅ [Get Engagement Questions API] Returning', paginatedQuestions.length, 'questions');

    return res.status(200).json({
      success: true,
      data: {
        questions: paginatedQuestions,
        dimensions,
        pagination: {
          total: questions.length,
          offset: startIndex,
          limit: endIndex - startIndex,
          hasMore: endIndex < questions.length
        },
        metadata: {
          totalQuestions: engagementQuestionsData.length,
          scaleType: '1-10 Likert',
          orientationLogic: 'P = Positive (raw score), N = Negative (11 - raw score)'
        }
      }
    });

  } catch (error) {
    console.error('❌ [Get Engagement Questions API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
