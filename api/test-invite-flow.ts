import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized && !getApps().length) {
    try {
      console.log('🔥 [Firebase] Initializing Firebase Admin...');
      
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      };

      // Check if all required environment variables are present
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
      
      firebaseInitialized = true;
      console.log('✅ [Firebase] Firebase Admin initialized successfully');
    } catch (error) {
      console.error('🚨 [Firebase] Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

// Helper function to make API calls
async function makeApiCall(endpoint: string, method: string = 'POST', data?: any) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3001';
  
  const url = `${baseUrl}${endpoint}`;
  console.log(`🔄 Making ${method} request to ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  const result = await response.json();
  
  console.log(`📊 Response: ${response.status} ${response.statusText}`);
  console.log(`📋 Data:`, result);
  
  return { status: response.status, data: result };
}

// Test setup function
async function setupTestData() {
  console.log('\n🔧 Setting up test data...');
  
  initializeFirebase();
  const db = getFirestore();
  
  // Create test company
  const testCompanyId = 'test-company-' + Date.now();
  const companyData = {
    name: 'Test Company Ltd',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    licenseCount: 1,
    usedLicensesCount: 0
  };
  
  await db.collection('companies').doc(testCompanyId).set(companyData);
  console.log('✅ Created test company:', testCompanyId);
  
  // Create test HR user
  const testHrId = 'test-hr-' + Date.now();
  const hrUserData = {
    email: 'hr@testcompany.com',
    companyId: testCompanyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await db.collection('hrUsers').doc(testHrId).set(hrUserData);
  console.log('✅ Created test HR user:', testHrId);
  
  // Create test project
  const testProjectId = 'test-project-' + Date.now();
  const projectData = {
    name: 'Test Leadership Assessment',
    companyId: testCompanyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await db.collection('companies').doc(testCompanyId).collection('projects').doc(testProjectId).set(projectData);
  console.log('✅ Created test project:', testProjectId);
  
  return {
    companyId: testCompanyId,
    hrId: testHrId,
    projectId: testProjectId
  };
}

// Cleanup test data
async function cleanupTestData(testData: any) {
  console.log('\n🧹 Cleaning up test data...');
  
  const db = getFirestore();
  
  try {
    // Delete test invites
    const invitesQuery = db.collection('invites').where('companyId', '==', testData.companyId);
    const invitesSnapshot = await invitesQuery.get();
    
    for (const doc of invitesSnapshot.docs) {
      await doc.ref.delete();
      console.log('🗑️ Deleted invite:', doc.id);
    }
    
    // Delete test project
    await db.collection('companies').doc(testData.companyId).collection('projects').doc(testData.projectId).delete();
    console.log('🗑️ Deleted test project');
    
    // Delete test HR user
    await db.collection('hrUsers').doc(testData.hrId).delete();
    console.log('🗑️ Deleted test HR user');
    
    // Delete test company
    await db.collection('companies').doc(testData.companyId).delete();
    console.log('🗑️ Deleted test company');
    
  } catch (error) {
    console.error('⚠️ Error cleaning up test data:', error);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Invite Flow Tests...\n');
  
  let testData: any;
  let inviteToken: string;
  const testResults: any[] = [];
  
  try {
    // Setup test data
    testData = await setupTestData();
    
    // TEST 1: Send first invite (should succeed)
    console.log('\n📝 TEST 1: Send first invite with available license');
    const sendInviteResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'candidate@example.com',
      projectId: testData.projectId,
      hrId: testData.hrId,
      roleTag: 'Senior Developer'
    });
    
    testResults.push({
      test: 'Send first invite',
      expected: 201,
      actual: sendInviteResult.status,
      passed: sendInviteResult.status === 201,
      details: sendInviteResult.data
    });
    
    if (sendInviteResult.status === 201) {
      inviteToken = sendInviteResult.data.invite.token;
      console.log('✅ Invite created with token:', inviteToken.substring(0, 8) + '...');
    }
    
    // TEST 2: Try to send second invite (should fail - license limit reached)
    console.log('\n📝 TEST 2: Try to send second invite (should fail - license limit)');
    const secondInviteResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'candidate2@example.com',
      projectId: testData.projectId,
      hrId: testData.hrId,
      roleTag: 'Junior Developer'
    });
    
    testResults.push({
      test: 'Send second invite (license limit)',
      expected: 429,
      actual: secondInviteResult.status,
      passed: secondInviteResult.status === 429,
      details: secondInviteResult.data
    });
    
    if (inviteToken) {
      // TEST 3: Open the invite (should succeed)
      console.log('\n📝 TEST 3: Open the invite link');
      const openInviteResult = await makeApiCall(`/api/invite/open?token=${inviteToken}`, 'GET');
      
      testResults.push({
        test: 'Open invite link',
        expected: 200,
        actual: openInviteResult.status,
        passed: openInviteResult.status === 200,
        details: openInviteResult.data
      });
      
      // TEST 4: Submit assessment results (should succeed)
      console.log('\n📝 TEST 4: Submit assessment results');
      const submitResultResult = await makeApiCall('/api/candidate/submitResult', 'POST', {
        token: inviteToken,
        result: {
          totalScore: 85,
          competencyBreakdown: {
            leadership: 90,
            communication: 80,
            problemSolving: 85,
            teamwork: 88
          },
          completionTime: 1800000, // 30 minutes
          answers: [
            { questionId: 1, answer: 'A', timeSpent: 45000 },
            { questionId: 2, answer: 'B', timeSpent: 50000 }
          ]
        }
      });
      
      testResults.push({
        test: 'Submit assessment results',
        expected: 200,
        actual: submitResultResult.status,
        passed: submitResultResult.status === 200,
        details: submitResultResult.data
      });
      
      // TEST 5: Try to submit results again (should fail - already completed)
      console.log('\n📝 TEST 5: Try to submit results again (should fail)');
      const duplicateSubmitResult = await makeApiCall('/api/candidate/submitResult', 'POST', {
        token: inviteToken,
        result: {
          totalScore: 75,
          note: 'This should fail'
        }
      });
      
      testResults.push({
        test: 'Duplicate result submission',
        expected: 409,
        actual: duplicateSubmitResult.status,
        passed: duplicateSubmitResult.status === 409,
        details: duplicateSubmitResult.data
      });
    }
    
    // TEST 6: Test with invalid token
    console.log('\n📝 TEST 6: Test with invalid token');
    const invalidTokenResult = await makeApiCall('/api/invite/open?token=invalid-token-123', 'GET');
    
    testResults.push({
      test: 'Invalid token test',
      expected: 404,
      actual: invalidTokenResult.status,
      passed: invalidTokenResult.status === 404,
      details: invalidTokenResult.data
    });
    
    // TEST 7: Test missing required fields
    console.log('\n📝 TEST 7: Test missing required fields in sendInvite');
    const missingFieldsResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'test@example.com'
      // Missing projectId and hrId
    });
    
    testResults.push({
      test: 'Missing required fields',
      expected: 400,
      actual: missingFieldsResult.status,
      passed: missingFieldsResult.status === 400,
      details: missingFieldsResult.data
    });
    
  } catch (error) {
    console.error('🚨 Test execution error:', error);
  } finally {
    // Clean up test data
    if (testData) {
      await cleanupTestData(testData);
    }
  }
  
  // Print test summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  let passedTests = 0;
  let totalTests = testResults.length;
  
  testResults.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    console.log(`   Expected: ${result.expected}, Got: ${result.actual}`);
    
    if (!result.passed) {
      console.log(`   Details:`, result.details);
    }
    
    if (result.passed) passedTests++;
    console.log('');
  });
  
  console.log(`📈 Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  return testResults;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Test API] Running invite flow tests...');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Only allow GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Run the tests
    const testResults = await runTests();
    
    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    return res.status(200).json({
      success: true,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: `${successRate}%`
      },
      results: testResults
    });

  } catch (error: any) {
    console.error('🚨 [Test API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to run tests'
    });
  }
} 