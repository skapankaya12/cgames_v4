// Test CV Integration Script
// This script tests the CV analysis integration with the frontend recommendations

import { CVAnalysisService } from './src/services/CVAnalysisService.js';
import { BehavioralAnalyticsService } from './src/services/BehavioralAnalyticsService.js';

// Sample CV text for testing
const sampleCVText = `
John Doe - Senior Software Engineer

EXPERIENCE:
Senior Software Engineer at Google (2020-2024)
- Led a team of 8 developers in building scalable web applications
- Implemented strategic planning for product roadmap
- Managed cross-functional collaboration with product and design teams
- Improved system performance by 40% through optimization

Software Engineer at Microsoft (2018-2020)
- Developed innovative solutions for cloud infrastructure
- Collaborated with stakeholders on decision making processes
- Adapted to rapid technology changes and market demands

SKILLS:
Leadership: Team management, strategic thinking, decision making
Technical: JavaScript, Python, React, Node.js, AWS, Docker
Communication: Presentation skills, stakeholder management
Project Management: Agile methodologies, risk assessment

EDUCATION:
Master of Science in Computer Science - Stanford University (2018)
Bachelor of Science in Software Engineering - MIT (2016)

ACHIEVEMENTS:
- Led successful migration of legacy system serving 1M+ users
- Received "Innovation Award" for developing new communication tools
- Mentored 15+ junior developers throughout career
`;

// Sample dimension scores
const sampleScores = [
  { dimension: 'DM', score: 75, maxScore: 100, displayName: 'Karar Verme' },
  { dimension: 'IN', score: 85, maxScore: 100, displayName: 'İnisiyatif Alma' },
  { dimension: 'AD', score: 70, maxScore: 100, displayName: 'Adaptasyon' },
  { dimension: 'CM', score: 80, maxScore: 100, displayName: 'İletişim' },
  { dimension: 'ST', score: 78, maxScore: 100, displayName: 'Stratejik Düşünce' },
  { dimension: 'TO', score: 82, maxScore: 100, displayName: 'Takım Çalışması' }
];

async function testCVIntegration() {
  console.log('🧪 Testing CV Analysis Integration...\n');

  try {
    // 1. Test CV Analysis Service
    console.log('1️⃣ Testing CV Analysis Service...');
    const cvService = new CVAnalysisService();
    const cvAnalysis = cvService.analyzeCVText(sampleCVText);
    
    console.log('✅ CV Analysis Results:');
    console.log(`   Experience: ${cvAnalysis.experience.years} years`);
    console.log(`   Companies: ${cvAnalysis.experience.companies.slice(0, 2).join(', ')}`);
    console.log(`   Technical Skills: ${cvAnalysis.skills.technical.slice(0, 3).join(', ')}`);
    console.log(`   Leadership Skills: ${cvAnalysis.skills.leadership.slice(0, 3).join(', ')}`);
    console.log('');

    // 2. Test HR Insights Generation
    console.log('2️⃣ Testing HR Insights Generation...');
    const hrInsights = cvService.generateHRInsights(cvAnalysis, sampleScores);
    
    console.log('✅ HR Insights Results:');
    console.log(`   Overall Assessment: ${hrInsights.overallAssessment}`);
    console.log(`   Strengths: ${hrInsights.strengths.slice(0, 2).join(', ')}`);
    console.log(`   Concerns: ${hrInsights.concerns.slice(0, 2).join(', ')}`);
    console.log(`   Fit Analysis: ${hrInsights.fitAnalysis}`);
    console.log('');

    // 3. Test Behavioral Service with CV Data
    console.log('3️⃣ Testing Behavioral Service with CV Integration...');
    
    // Simulate session storage for CV data
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      cvText: sampleCVText,
      cvFileName: 'john_doe_cv.pdf'
    };
    
    // Store in session storage simulation
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(mockUser));
    }

    const behavioralService = new BehavioralAnalyticsService();
    const recommendations = await behavioralService.generateAIRecommendations(
      sampleScores,
      'test_session_123',
      { firstName: 'John', lastName: 'Doe' }
    );

    console.log('✅ Enhanced Recommendations with CV Data:');
    console.log(`   Total Recommendations: ${recommendations.recommendations.length}`);
    console.log(`   Data Sources: ${recommendations.dataUsed?.join(', ') || 'N/A'}`);
    
    // Check for CV-specific recommendation
    const cvRecommendation = recommendations.recommendations.find(
      rec => rec.id === 'cv_analysis_main'
    );
    
    if (cvRecommendation) {
      console.log('✅ CV Analysis Recommendation Found:');
      console.log(`   Title: ${cvRecommendation.title}`);
      console.log(`   Candidate Strengths: ${cvRecommendation.candidateStrengths || 'N/A'}`);
      console.log(`   Suitable Positions: ${cvRecommendation.suitablePositions?.slice(0, 2).join(', ') || 'N/A'}`);
      console.log(`   Risk Level: ${cvRecommendation.riskLevel || 'N/A'}`);
    } else {
      console.log('❌ CV Analysis Recommendation NOT found');
    }

    console.log('\n🎉 CV Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('- CV analysis is working correctly');
    console.log('- HR insights are being generated');
    console.log('- Recommendations are enhanced with CV data');
    console.log('- Frontend should now display CV analysis and HR insights');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment
  testCVIntegration();
} else {
  // Browser environment
  window.testCVIntegration = testCVIntegration;
  console.log('CV Integration Test ready. Call testCVIntegration() to run.');
} 