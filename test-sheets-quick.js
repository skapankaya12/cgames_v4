/**
 * Quick test script for Google Sheets integration
 */

// Test data that matches what the Team Assessment actually sends
const testData = {
  assessmentType: 'takim-degerlendirme',
  candidateEmail: 'kapankayasevval@gmail.com',
  projectId: 'test-project-123',
  token: 'test-token-456',
  answers: {
    '01-1': '8',
    '01-2': '7', 
    '01-3': '9',
    '01-4': '6',
    '01-5': '8',
    '01-6': '7',
    '02-1': '9',
    '02-2': '8',
    '02-3': '7',
    '02-4': '8'
  },
  scores: {
    'takım_iletişimi': {
      score: 7.8,
      percentage: 78,
      total: 47,
      count: 6
    },
    'ortak_hedefler_ve_vizyon': {
      score: 8.2,
      percentage: 82,
      total: 49,
      count: 6
    },
    'destek_ve_iş_birliği': {
      score: 7.5,
      percentage: 75,
      total: 45,
      count: 6
    },
    'güven_ve_şeffaflık': {
      score: 8.0,
      percentage: 80,
      total: 48,
      count: 6
    },
    'takım_motivasyonu': {
      score: 7.9,
      percentage: 79,
      total: 47,
      count: 6
    },
    'overall': {
      score: 7.88,
      percentage: 79
    }
  },
  completionTime: '15:30',
  totalQuestions: 30,
  completedQuestions: 10,
  candidateInfo: {
    firstName: 'Test',
    lastName: 'User',
    email: 'kapankayasevval@gmail.com'
  }
};

console.log('🧪 Testing Google Sheets Integration');
console.log('====================================');

// Test 1: Direct Google Apps Script test
async function testGoogleAppsScript() {
  console.log('\n1. Testing Google Apps Script directly...');
  
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbzEInShsYOZq1J-dvab06TqO-6RQhUlEuiuSZcuLHSWBWquWuRH8-KYKLGu3A9zVFR1IQ/exec';
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      redirect: 'follow'
    });

    console.log('   Response status:', response.status);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('   Response body:', result);
    
    if (response.ok) {
      console.log('   ✅ Google Apps Script test: SUCCESS');
      try {
        const jsonResult = JSON.parse(result);
        console.log('   📊 Parsed result:', jsonResult);
      } catch (e) {
        console.log('   ⚠️ Response is not JSON');
      }
    } else {
      console.log('   ❌ Google Apps Script test: FAILED');
    }
    
  } catch (error) {
    console.error('   ❌ Error testing Google Apps Script:', error);
  }
}

// Test 2: Check if environment variable would be available
console.log('\n2. Environment variable check:');
console.log('   GOOGLE_APPS_SCRIPT_URL:', process.env.GOOGLE_APPS_SCRIPT_URL || 'NOT SET');

// Run tests
testGoogleAppsScript().then(() => {
  console.log('\n🎉 Test completed!');
  console.log('\nNext steps if tests fail:');
  console.log('1. Update Google Apps Script with new code');
  console.log('2. Re-deploy the script as Web App');
  console.log('3. Set GOOGLE_APPS_SCRIPT_URL in Vercel environment variables');
  console.log('4. Check your Google Spreadsheet for new data');
});
