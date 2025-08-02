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
async function makeApiCall(endpoint: string, method: string = 'POST', data?: any, headers?: Record<string, string>) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3001';
  
  const url = `${baseUrl}${endpoint}`;
  console.log(`🔄 Making ${method} request to ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
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

// Test setup function with role-based users
async function setupTestData() {
  console.log('\n🔧 Setting up test data with role-based users...');
  
  initializeFirebase();
  const db = getFirestore();
  
  // Create test company
  const testCompanyId = 'test-company-permissions-' + Date.now();
  const companyData = {
    name: 'Permission Test Company Ltd',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    licenseCount: 5,
    usedLicensesCount: 0,
    maxUsers: 10,
    createdBy: 'super-admin-test'
  };
  
  await db.collection('companies').doc(testCompanyId).set(companyData);
  console.log('✅ Created test company:', testCompanyId);
  
  // Create test HR admin user
  const testAdminId = 'test-admin-' + Date.now();
  const adminUserData = {
    email: 'admin@testcompany.com',
    name: 'Admin User',
    companyId: testCompanyId,
    role: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'super-admin-test'
  };
  
  await db.collection('hrUsers').doc(testAdminId).set(adminUserData);
  console.log('✅ Created test admin user:', testAdminId);
  
  // Create test HR employee user
  const testEmployeeId = 'test-employee-' + Date.now();
  const employeeUserData = {
    email: 'employee@testcompany.com',
    name: 'Employee User',
    companyId: testCompanyId,
    role: 'employee',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'super-admin-test'
  };
  
  await db.collection('hrUsers').doc(testEmployeeId).set(employeeUserData);
  console.log('✅ Created test employee user:', testEmployeeId);
  
  // Create test project
  const testProjectId = 'test-project-permissions-' + Date.now();
  const projectData = {
    name: 'Permission Test Project',
    description: 'Test project for permission validation',
    companyId: testCompanyId,
    createdBy: testAdminId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    gamePreferences: ['Leadership Scenario Game'],
    roleTag: 'Test Role',
    status: 'active',
    candidateCount: 0
  };
  
  await db.collection('companies').doc(testCompanyId).collection('projects').doc(testProjectId).set(projectData);
  console.log('✅ Created test project:', testProjectId);
  
  return {
    companyId: testCompanyId,
    adminId: testAdminId,
    employeeId: testEmployeeId,
    projectId: testProjectId
  };
}

// Cleanup test data
async function cleanupTestData(testData: any) {
  console.log('\n🧹 Cleaning up permission test data...');
  
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
    
    // Delete test HR users
    await db.collection('hrUsers').doc(testData.adminId).delete();
    console.log('🗑️ Deleted test admin user');
    
    await db.collection('hrUsers').doc(testData.employeeId).delete();
    console.log('🗑️ Deleted test employee user');
    
    // Delete test company
    await db.collection('companies').doc(testData.companyId).delete();
    console.log('🗑️ Deleted test company');
    
  } catch (error) {
    console.error('⚠️ Error cleaning up test data:', error);
  }
}

// Generate mock super admin JWT token (for testing purposes)
function generateMockSuperAdminToken(): string {
  // In a real implementation, you would create a proper JWT token
  // For testing, we'll return a placeholder that our test endpoints can recognize
  return 'Bearer mock-super-admin-token-test';
}

// Main test function
async function runPermissionTests() {
  console.log('🧪 Starting Permission Flow Tests...\n');
  
  let testData: any;
  let inviteToken: string;
  let projectId: string;
  const testResults: any[] = [];
  
  try {
    // Setup test data
    testData = await setupTestData();
    projectId = testData.projectId;
    
    // === SUPER ADMIN TESTS ===
    console.log('\n🔐 === SUPER ADMIN PERMISSION TESTS ===');
    
    // TEST 1: Create company with super admin token (should succeed)
    console.log('\n📝 TEST 1: Super admin creates company');
    const createCompanyResult = await makeApiCall('/api/superadmin/createCompany', 'POST', {
      companyName: 'New Test Company',
      licenseCount: 10,
      maxUsers: 20,
      hrEmail: 'newhradmin@example.com',
      hrName: 'New HR Admin'
    }, {
      'Authorization': generateMockSuperAdminToken()
    });
    
    testResults.push({
      test: 'Super admin creates company',
      expected: 201,
      actual: createCompanyResult.status,
      passed: createCompanyResult.status === 201,
      details: createCompanyResult.data
    });
    
    // TEST 2: Create company without super admin token (should fail)
    console.log('\n📝 TEST 2: Create company without super admin token');
    const unauthorizedCreateResult = await makeApiCall('/api/superadmin/createCompany', 'POST', {
      companyName: 'Unauthorized Company',
      licenseCount: 5,
      maxUsers: 10,
      hrEmail: 'unauthorized@example.com',
      hrName: 'Unauthorized User'
    });
    
    testResults.push({
      test: 'Create company without auth',
      expected: 401,
      actual: unauthorizedCreateResult.status,
      passed: unauthorizedCreateResult.status === 401,
      details: unauthorizedCreateResult.data
    });
    
    // === ADMIN USER TESTS ===
    console.log('\n👑 === ADMIN USER PERMISSION TESTS ===');
    
    // TEST 3: Admin user creates project (should succeed)
    console.log('\n📝 TEST 3: Admin user creates project');
    const adminCreateProjectResult = await makeApiCall('/api/hr/createProject', 'POST', {
      projectName: 'Admin Created Project',
      description: 'Project created by admin user',
      hrId: testData.adminId,
      gamePreferences: ['Leadership Game'],
      roleTag: 'Manager'
    });
    
    testResults.push({
      test: 'Admin creates project',
      expected: 201,
      actual: adminCreateProjectResult.status,
      passed: adminCreateProjectResult.status === 201,
      details: adminCreateProjectResult.data
    });
    
    // TEST 4: Admin user sends invite (should succeed)
    console.log('\n📝 TEST 4: Admin user sends invite');
    const adminSendInviteResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'candidate@example.com',
      projectId: testData.projectId,
      hrId: testData.adminId,
      roleTag: 'Senior Developer'
    });
    
    testResults.push({
      test: 'Admin sends invite',
      expected: 201,
      actual: adminSendInviteResult.status,
      passed: adminSendInviteResult.status === 201,
      details: adminSendInviteResult.data
    });
    
    if (adminSendInviteResult.status === 201) {
      inviteToken = adminSendInviteResult.data.invite.token;
    }
    
    // TEST 5: Admin user views candidates (should succeed)
    console.log('\n📝 TEST 5: Admin user views candidates');
    const adminViewCandidatesResult = await makeApiCall(
      `/api/hr/getProjectCandidates?projectId=${testData.projectId}&hrId=${testData.adminId}`, 
      'GET'
    );
    
    testResults.push({
      test: 'Admin views candidates',
      expected: 200,
      actual: adminViewCandidatesResult.status,
      passed: adminViewCandidatesResult.status === 200,
      details: adminViewCandidatesResult.data
    });
    
    // === EMPLOYEE USER TESTS ===
    console.log('\n👤 === EMPLOYEE USER PERMISSION TESTS ===');
    
    // TEST 6: Employee user tries to create project (should fail)
    console.log('\n📝 TEST 6: Employee user tries to create project');
    const employeeCreateProjectResult = await makeApiCall('/api/hr/createProject', 'POST', {
      projectName: 'Employee Created Project',
      description: 'Project created by employee user (should fail)',
      hrId: testData.employeeId,
      gamePreferences: ['Leadership Game'],
      roleTag: 'Manager'
    });
    
    testResults.push({
      test: 'Employee tries to create project',
      expected: 403,
      actual: employeeCreateProjectResult.status,
      passed: employeeCreateProjectResult.status === 403,
      details: employeeCreateProjectResult.data
    });
    
    // TEST 7: Employee user tries to send invite (should fail)
    console.log('\n📝 TEST 7: Employee user tries to send invite');
    const employeeSendInviteResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'employee-candidate@example.com',
      projectId: testData.projectId,
      hrId: testData.employeeId,
      roleTag: 'Junior Developer'
    });
    
    testResults.push({
      test: 'Employee tries to send invite',
      expected: 403,
      actual: employeeSendInviteResult.status,
      passed: employeeSendInviteResult.status === 403,
      details: employeeSendInviteResult.data
    });
    
    // TEST 8: Employee user views candidates (should succeed)
    console.log('\n📝 TEST 8: Employee user views candidates');
    const employeeViewCandidatesResult = await makeApiCall(
      `/api/hr/getProjectCandidates?projectId=${testData.projectId}&hrId=${testData.employeeId}`, 
      'GET'
    );
    
    testResults.push({
      test: 'Employee views candidates',
      expected: 200,
      actual: employeeViewCandidatesResult.status,
      passed: employeeViewCandidatesResult.status === 200,
      details: employeeViewCandidatesResult.data
    });
    
    // === CANDIDATE FLOW TESTS ===
    console.log('\n📨 === CANDIDATE FLOW TESTS ===');
    
    if (inviteToken) {
      // TEST 9: Candidate opens invite (should succeed)
      console.log('\n📝 TEST 9: Candidate opens invite');
      const openInviteResult = await makeApiCall(`/api/invite/open?token=${inviteToken}`, 'GET');
      
      testResults.push({
        test: 'Candidate opens invite',
        expected: 200,
        actual: openInviteResult.status,
        passed: openInviteResult.status === 200,
        details: openInviteResult.data
      });
      
      // TEST 10: Candidate submits results (should succeed)
      console.log('\n📝 TEST 10: Candidate submits results');
      const submitResultResult = await makeApiCall('/api/candidate/submitResult', 'POST', {
        token: inviteToken,
        result: {
          totalScore: 88,
          competencyBreakdown: {
            leadership: 92,
            communication: 85,
            problemSolving: 90,
            teamwork: 85
          },
          completionTime: 2100000,
          answers: [
            { questionId: 1, answer: 'A', timeSpent: 55000 },
            { questionId: 2, answer: 'C', timeSpent: 48000 }
          ]
        }
      });
      
      testResults.push({
        test: 'Candidate submits results',
        expected: 200,
        actual: submitResultResult.status,
        passed: submitResultResult.status === 200,
        details: submitResultResult.data
      });
    }
    
    // === INVALID USER TESTS ===
    console.log('\n❌ === INVALID USER TESTS ===');
    
    // TEST 11: Invalid HR user tries to send invite
    console.log('\n📝 TEST 11: Invalid HR user tries to send invite');
    const invalidUserResult = await makeApiCall('/api/hr/sendInvite', 'POST', {
      candidateEmail: 'invalid@example.com',
      projectId: testData.projectId,
      hrId: 'invalid-user-id-12345',
      roleTag: 'Test Role'
    });
    
    testResults.push({
      test: 'Invalid HR user tries to send invite',
      expected: 404,
      actual: invalidUserResult.status,
      passed: invalidUserResult.status === 404,
      details: invalidUserResult.data
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
  console.log('\n📊 PERMISSION TEST SUMMARY');
  console.log('===========================');
  
  let passedTests = 0;
  let totalTests = testResults.length;
  
  const categories = {
    'Super Admin': [],
    'Admin User': [],
    'Employee User': [],
    'Candidate Flow': [],
    'Invalid User': []
  };
  
  testResults.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    console.log(`   Expected: ${result.expected}, Got: ${result.actual}`);
    
    if (!result.passed) {
      console.log(`   Details:`, result.details);
    }
    
    if (result.passed) passedTests++;
    console.log('');
    
    // Categorize results
    if (result.test.includes('Super admin') || result.test.includes('Create company')) {
      categories['Super Admin'].push(result);
    } else if (result.test.includes('Admin')) {
      categories['Admin User'].push(result);
    } else if (result.test.includes('Employee')) {
      categories['Employee User'].push(result);
    } else if (result.test.includes('Candidate')) {
      categories['Candidate Flow'].push(result);
    } else if (result.test.includes('Invalid')) {
      categories['Invalid User'].push(result);
    }
  });
  
  console.log(`📈 Overall Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // Category breakdown
  console.log('\n📋 TEST BREAKDOWN BY CATEGORY:');
  Object.entries(categories).forEach(([category, tests]) => {
    if (tests.length > 0) {
      const categoryPassed = tests.filter(t => t.passed).length;
      console.log(`${category}: ${categoryPassed}/${tests.length} passed`);
    }
  });
  
  return testResults;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Permission Test API] Running permission flow tests...');
  
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

    // Run the permission tests
    const testResults = await runPermissionTests();
    
    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    return res.status(200).json({
      success: true,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: `${successRate}%`,
        testCategories: {
          superAdmin: testResults.filter(t => 
            t.test.includes('Super admin') || t.test.includes('Create company')
          ).length,
          adminUser: testResults.filter(t => t.test.includes('Admin')).length,
          employeeUser: testResults.filter(t => t.test.includes('Employee')).length,
          candidateFlow: testResults.filter(t => t.test.includes('Candidate')).length,
          invalidUser: testResults.filter(t => t.test.includes('Invalid')).length
        }
      },
      results: testResults
    });

  } catch (error: any) {
    console.error('🚨 [Permission Test API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to run permission tests'
    });
  }
} 