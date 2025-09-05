# CGames V4 - Complete Technical Documentation

## 🎯 System Overview

CGames V4 is a comprehensive HR assessment platform consisting of three main applications:
- **Game Platform** (`hub.olivinhr.com`) - Interactive assessments for candidates
- **HR Platform** (`app.olivinhr.com`) - Management interface for HR professionals  
- **API Services** (`api.olivinhr.com`) - Backend services and data processing

## 🏗️ Architecture

### Deployment Structure
```
cgames_v4/
├── apps/
│   ├── game-platform/     # Candidate assessment interface
│   └── hr-platform/       # HR management interface
├── api/                   # Backend API services
└── packages/              # Shared libraries
    ├── services/          # Business logic services
    ├── types/             # TypeScript type definitions
    └── ui-kit/            # Shared UI components
```

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Vercel Serverless Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Email**: SendGrid
- **Deployment**: Vercel
- **Build System**: Turbo (monorepo)

## 🚀 Complete Workflow

### 1. Company & Project Setup
1. **Super Admin** creates company via `/admin/create-company`
2. **HR User** logs in and creates assessment project
3. **Project Configuration** includes:
   - Role information (position, department, experience level)
   - Assessment type selection
   - Customization preferences
   - Game preferences

### 2. Candidate Invitation Flow
1. **HR User** adds candidate emails via multi-invite interface
2. **API** (`/api/hr/sendInvite`) processes invitations:
   - Creates invite records in Firestore
   - Generates unique tokens
   - Associates selected assessment type from project
   - Sends email invitations via SendGrid
3. **Email** contains unique assessment link with token

### 3. Assessment Execution
1. **Candidate** clicks email link → redirected to `hub.olivinhr.com?token=xyz`
2. **Token Validation** via `/api/invite/open`
3. **Identity Collection** - candidate enters personal information
4. **Assessment Execution** - interactive game scenarios
5. **Results Submission** via `/api/candidate/submitResult`

### 4. Results Processing & Viewing
1. **Results Storage** in `candidateResults` collection
2. **Competency Scoring** using weighted algorithms
3. **HR Dashboard** displays candidate results
4. **Detailed Analysis** available via "View" button

## 🔧 Critical Technical Implementations

### Firebase Configuration
**Environment Variables Required:**
```bash
# Primary (direct key)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Alternative (base64 encoded - RECOMMENDED)
FIREBASE_PRIVATE_KEY_B64=base64_encoded_private_key
```

**Initialization Pattern (all API endpoints):**
```javascript
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
    const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
    
    // Support both direct and base64-encoded keys
    let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const firebasePrivateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64 || process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (!firebasePrivateKey && firebasePrivateKeyB64) {
      firebasePrivateKey = Buffer.from(firebasePrivateKeyB64, 'base64').toString('utf-8');
    }

    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}
```

### CORS Configuration
**API Endpoints** (`/api/vercel.json`):
```json
{
  "version": 2,
  "functions": {
    "**/*.ts": { "runtime": "@vercel/node@3.0.0" },
    "**/*.js": { "runtime": "@vercel/node@3.0.0" }
  }
}
```

**Individual API Functions** handle CORS headers:
```javascript
const allowedOrigins = [
  'https://app.olivinhr.com',
  'https://hub.olivinhr.com',
  'https://cgames-v4-hr-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const origin = req.headers.origin || '';
const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.olivinhr.com';
res.setHeader('Access-Control-Allow-Origin', allowOrigin);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### API Endpoint Structure
**Correct Vercel Deployment Paths:**
```
/api/api/candidate/submitResult.js    → /api/candidate/submitResult
/api/api/hr/getCandidateResults.js    → /api/hr/getCandidateResults  
/api/api/hr/sendInvite.ts            → /api/hr/sendInvite
/api/api/superadmin/createCompany.ts → /api/superadmin/createCompany
```

### Client-Side API Configuration
**Environment Variables:**
```bash
# HR Platform & Game Platform
VITE_API_BASE_URL=https://api.olivinhr.com
```

**API Call Pattern:**
```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const response = await fetch(`${apiBaseUrl}/api/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## 🎮 Assessment System Architecture

### Current Assessment Implementation
**Default Assessment: Space Mission** 
- **Location**: `apps/game-platform/src/pages/candidate/TestScreen/`
- **Type**: Interactive scenario-based assessment
- **Questions**: 16 competency-based scenarios
- **Competencies Measured**: DM, IN, AD, CM, ST, TO, RL, RI

### Assessment Selection Flow
1. **Project Creation**: HR selects assessment type during project setup
2. **Project Storage**: Assessment type stored in `project.customization.assessmentType`
3. **Invite Generation**: Selected assessment linked to invite token
4. **Candidate Experience**: Assessment loads based on project configuration

### Multi-Assessment Architecture (Expandable)
```javascript
// Project Creation - Assessment Selection
const assessmentTypes = [
  {
    id: 'space-mission',
    name: 'Space Mission',
    description: 'Leadership and decision-making scenarios',
    component: 'TestScreen',
    duration: '20-30 minutes'
  },
  // Future assessments can be added here
  {
    id: 'business-simulation',
    name: 'Business Simulation',
    description: 'Strategic business decision scenarios',
    component: 'BusinessTestScreen',
    duration: '25-35 minutes'
  }
];

// Assessment Routing Logic
const getAssessmentComponent = (assessmentType) => {
  switch(assessmentType) {
    case 'space-mission':
      return TestScreen; // Current default
    case 'business-simulation':
      return BusinessTestScreen; // Future implementation
    default:
      return TestScreen; // Fallback to space mission
  }
};
```

### Implementation Points for New Assessments
1. **Component Structure**: Create new assessment component in `/pages/candidate/`
2. **Question Data**: Define questions and scoring in `/data/` directory
3. **Routing Logic**: Update assessment router to handle new types
4. **Project Selection**: Add new options to project creation form
5. **Email Templates**: Customize invitation emails per assessment type

### Assessment Data Flow
```
Project Creation → Assessment Type Selection → Invite Generation → 
Candidate Link → Assessment Loading → Results Submission
```

## 📊 Data Models

### Invite Document (Firestore: `invites`)
```javascript
{
  id: "invite_unique_id",
  token: "unique_token_string",
  candidateEmail: "candidate@example.com",
  projectId: "project_uuid",
  status: "pending|completed|expired",
  createdAt: "2025-01-01T00:00:00Z",
  roleTag: "Software Engineer",
  selectedGame: "space-mission",          // Current default
  assessmentType: "space-mission"         // Links to project.customization.assessmentType
}
```

### Candidate Results (Firestore: `candidateResults`)
```javascript
{
  id: "result_timestamp_random",
  token: "invite_token",
  inviteId: "invite_document_id",
  candidateEmail: "candidate@example.com",
  projectId: "project_uuid",
  gameId: "space-mission",
  gameName: "Space Mission",
  
  // Scoring
  rawScore: 346,
  scorePercentage: 85,
  totalQuestions: 16,
  competencyScores: {
    "DM": 50, "IN": 40, "AD": 42, "CM": 38,
    "ST": 46, "TO": 39, "RL": 40, "RI": 51
  },
  
  // Performance Analysis
  performance: {
    overall: "excellent|good|fair|needs_improvement",
    timeSpent: "completion_time",
    completionRate: 100
  },
  
  // Raw Data
  results: {
    answers: { "1": "A", "2": "B", ... },
    analytics: { /* detailed interaction data */ }
  },
  
  // Metadata
  completedAt: "2025-01-01T00:00:00Z",
  submittedAt: "2025-01-01T00:00:00Z",
  status: "completed",
  reviewStatus: "pending"
}
```

## 🔧 Common Issues & Solutions

### 1. CORS Errors
**Symptom:** `blocked by CORS policy`
**Solution:** 
- Ensure `VITE_API_BASE_URL=https://api.olivinhr.com` is set
- Verify API endpoints include proper CORS headers
- Check allowed origins list includes your domain

### 2. Firebase Authentication Errors
**Symptom:** `FIREBASE_PRIVATE_KEY environment variable is required`
**Solution:**
- Use base64-encoded private key: `FIREBASE_PRIVATE_KEY_B64`
- Ensure all API endpoints use the robust Firebase initialization pattern
- Verify environment variables are set in Vercel deployment

### 3. API Response Structure Mismatch
**Symptom:** `No results found for this candidate`
**Solution:**
- API returns: `{success: true, data: {results: [...]}}`
- Client should access: `data.data.results` not `data.results`

### 4. 404 API Endpoints
**Symptom:** `The page could not be found`
**Solution:**
- Ensure API files are in `/api/api/` directory structure
- Verify Vercel deployment includes all API files
- Check file naming matches URL pattern

### 5. TypeScript Compilation Errors
**Common Fixes:**
- Use type assertions for dynamic properties: `(object as any).property`
- Remove `jsx` attribute from `<style>` tags
- Ensure proper import paths for monorepo packages

## 🚀 Deployment Checklist

### Environment Variables (Vercel)
**API Domain (`api.olivinhr.com`):**
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email  
FIREBASE_PRIVATE_KEY_B64=base64_encoded_private_key
SENDGRID_API_KEY=your_sendgrid_api_key
VITE_GAME_PLATFORM_URL=https://hub.olivinhr.com
```

**HR Platform (`app.olivinhr.com`):**
```bash
VITE_API_BASE_URL=https://api.olivinhr.com
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Game Platform (`hub.olivinhr.com`):**
```bash
VITE_API_BASE_URL=https://api.olivinhr.com
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Deployment Commands
```bash
# Deploy all changes
git add -A
git commit -m "feat: description of changes"
git push origin main

# Vercel will automatically deploy:
# - api.olivinhr.com (from /api directory)
# - app.olivinhr.com (from /apps/hr-platform)  
# - hub.olivinhr.com (from /apps/game-platform)
```

## 🧪 Testing Workflow

### Complete End-to-End Test
1. **Create Company** → Super admin creates new company
2. **Create Project** → HR user creates assessment project with specific assessment type
3. **Send Invite** → HR user invites candidate via email (assessment type auto-linked)
4. **Complete Assessment** → Candidate completes selected assessment (currently Space Mission)
5. **View Results** → HR user views detailed candidate results

### Key Test Points
- ✅ Email delivery (check SendGrid logs)
- ✅ Token validation (unique per invite)
- ✅ Assessment completion (all questions answered)
- ✅ Results submission (data saved to Firestore)
- ✅ Results viewing (data displayed correctly)

## 📈 Performance Considerations

### API Optimization
- Use Firebase composite indexes for complex queries
- Implement caching for frequently accessed data
- Monitor Vercel function execution times

### Frontend Optimization  
- Lazy load assessment components
- Implement proper error boundaries
- Use React.memo for expensive components

### Database Optimization
- Index frequently queried fields
- Use subcollections for large datasets
- Implement proper pagination for results

## 🔒 Security Features

### Authentication & Authorization
- Firebase Auth for user management
- Role-based access control (super_admin, hr_user)
- Token-based invite system

### Data Protection
- CORS policies restrict cross-origin access
- Environment variables for sensitive data
- Firestore security rules for data access

### Input Validation
- Server-side validation for all API endpoints
- Client-side form validation
- Sanitization of user inputs

---

**Last Updated:** August 2025  
**Version:** 4.0  
**Status:** Production Ready ✅

This documentation covers all critical aspects of the CGames V4 system. Keep this file updated when making significant architectural changes.
