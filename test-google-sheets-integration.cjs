/**
 * Test script for Google Sheets integration
 * Run this to verify the integration is working correctly
 */

// Set the environment variable for testing
process.env.GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEInShsYOZq1J-dvab06TqO-6RQhUlEuiuSZcuLHSWBWquWuRH8-KYKLGu3A9zVFR1IQ/exec';

const { GoogleSheetsService } = require('./api/services/googleSheetsService');

async function testGoogleSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration');
  console.log('=====================================');

  const googleSheetsService = new GoogleSheetsService();

  // Test 1: Check if service is enabled
  console.log('\n1. Checking service configuration...');
  console.log('   Enabled:', googleSheetsService.enabled);
  console.log('   Script URL:', googleSheetsService.scriptUrl ? 'Configured' : 'Not configured');

  if (!googleSheetsService.enabled) {
    console.log('❌ Google Sheets service is disabled. Set GOOGLE_APPS_SCRIPT_URL environment variable.');
    return;
  }

  // Test 2: Connection test
  console.log('\n2. Testing connection...');
  try {
    const connectionResult = await googleSheetsService.testConnection();
    console.log('   Connection test:', connectionResult ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.log('   Connection test: ❌ Error -', error.message);
  }

  // Test 3: Test each assessment type
  const testAssessments = [
    {
      name: 'Team Assessment',
      data: {
        assessmentType: 'takim-degerlendirme',
        candidateEmail: 'test-team@example.com',
        projectId: 'test-project-team',
        token: 'test-token-team',
        answers: {
          '1': '5', '2': '4', '3': '3', '4': '2', '5': '1',
          '6': '5', '7': '4', '8': '3', '9': '2', '10': '1'
        },
        scores: {
          'team_communication': 85,
          'shared_goals_vision': 78,
          'support_collaboration': 92
        },
        completionTime: '15:30',
        totalQuestions: 30,
        completedQuestions: 30
      }
    },
    {
      name: 'Manager Assessment',
      data: {
        assessmentType: 'yonetici-degerlendirme',
        candidateEmail: 'test-manager@example.com',
        projectId: 'test-project-manager',
        token: 'test-token-manager',
        answers: {
          '1': '4', '2': '5', '3': '3', '4': '4', '5': '5',
          '6': '3', '7': '4', '8': '5', '9': '3', '10': '4'
        },
        scores: {
          'team_communication': 88,
          'trust_transparency': 76,
          'team_motivation': 91
        },
        completionTime: '12:45',
        totalQuestions: 30,
        completedQuestions: 30
      }
    },
    {
      name: 'Engagement Assessment',
      data: {
        assessmentType: 'calisan-bagliligi',
        candidateEmail: 'test-engagement@example.com',
        projectId: 'test-project-engagement',
        token: 'test-token-engagement',
        answers: {
          '1': '5', '2': '4', '3': '5', '4': '3', '5': '4',
          '6': '5', '7': '3', '8': '4', '9': '5', '10': '4'
        },
        scores: {
          'overall': 82
        },
        completionTime: '18:20',
        totalQuestions: 25,
        completedQuestions: 25
      }
    },
    {
      name: 'Space Mission',
      data: {
        assessmentType: 'space-mission',
        candidateEmail: 'test-space@example.com',
        projectId: 'test-project-space',
        token: 'test-token-space',
        answers: {
          '1': 'A', '2': 'B', '3': 'C', '4': 'A', '5': 'D',
          '6': 'B', '7': 'A', '8': 'C', '9': 'B', '10': 'D'
        },
        scores: {
          'DM': 45, 'IN': 38, 'AD': 42, 'CM': 35,
          'ST': 40, 'TO': 37, 'RL': 43, 'RI': 39
        },
        completionTime: '22:15',
        totalQuestions: 16,
        completedQuestions: 16
      }
    }
  ];

  console.log('\n3. Testing assessment data submission...');
  
  for (const assessment of testAssessments) {
    console.log(`\n   Testing ${assessment.name}...`);
    
    try {
      const result = await googleSheetsService.sendAssessmentData(assessment.data);
      console.log(`   ${assessment.name}: ${result ? '✅ Success' : '❌ Failed'}`);
    } catch (error) {
      console.log(`   ${assessment.name}: ❌ Error - ${error.message}`);
    }
  }

  console.log('\n🎉 Test completed!');
  console.log('\nNext steps:');
  console.log('1. Check your Google Spreadsheet for test data');
  console.log('2. Verify that sheets were created for each assessment type');
  console.log('3. Confirm data structure matches expectations');
  console.log('4. Remove test data before production use');
}

// Run the test
if (require.main === module) {
  testGoogleSheetsIntegration().catch(console.error);
}

module.exports = { testGoogleSheetsIntegration };
