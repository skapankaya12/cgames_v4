# HR Tech SaaS Invite Flow - Backend Implementation

## Overview

This document describes the complete backend implementation for the HR tech SaaS platform's invite and result flow, including company license tracking and candidate status updates.

## Architecture

### Data Model Updates

#### Company Collection (`/companies/{companyId}`)
```typescript
interface Company {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  licenseCount: number;        // NEW: Total licenses available
  usedLicensesCount: number;   // NEW: Number of licenses currently used
}
```

#### HR Users Collection (`/hrUsers/{hrId}`)
```typescript
interface HrUser {
  id: string;
  email: string;
  companyId: string;           // NEW: Links HR to company
  createdAt: number;
  updatedAt: number;
}
```

#### Invites Collection (`/invites/{inviteId}`)
```typescript
interface Invite {
  id: string;
  candidateEmail: string;
  token: string;
  status: 'pending' | 'started' | 'completed' | 'expired';
  projectId: string;
  companyId: string;
  timestamp: number;           // When invite was created
  expiresAt: number;          // 7 days from creation
  lastOpenedAt?: number;      // When candidate opened the link
  completedAt?: number;       // When assessment was completed
  result: Record<string, any>; // Assessment results
  sentBy?: string;            // HR user ID who sent the invite
  roleTag?: string;           // Role/position for the assessment
}
```

## API Endpoints

### 1. `/api/hr/sendInvite` - Send Assessment Invite

**Method:** `POST`

**Purpose:** Allows HR users to send assessment invites with license validation.

**Request Body:**
```json
{
  "candidateEmail": "candidate@example.com",
  "projectId": "project-123",
  "hrId": "hr-user-456",
  "roleTag": "Senior Developer" // Optional
}
```

**Process Flow:**
1. Validate input data and email format
2. Fetch HR user by `hrId` to get `companyId`
3. Fetch company data and check license availability
4. If licenses available:
   - Generate unique token and invite ID
   - Create invite document in Firestore
   - Increment `usedLicensesCount` (atomic transaction)
   - Send email via SendGrid
   - Log analytics event
5. If no licenses: Return `429 - License limit reached`

**Success Response (201):**
```json
{
  "success": true,
  "invite": {
    "id": "invite-123",
    "candidateEmail": "candidate@example.com",
    "token": "abc123...",
    "status": "pending",
    "projectId": "project-123",
    "companyId": "company-789",
    "timestamp": 1640995200000,
    "expiresAt": 1641600000000
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid email
- `404` - HR user or company not found
- `429` - License limit reached
- `500` - Internal server error

### 2. `/api/invite/open` - Track Invite Opens

**Method:** `GET` or `POST`

**Purpose:** Tracks when candidates open the invite link and validates tokens.

**Parameters:**
- **GET:** Query parameter `?token=abc123...`
- **POST:** Body `{"token": "abc123..."}`

**Process Flow:**
1. Validate token parameter
2. Find invite by token in Firestore
3. Check if invite is still valid (not completed/expired)
4. Update invite:
   - Set `status` to `'started'` (if currently `'pending'`)
   - Set `lastOpenedAt` to current timestamp
5. Log analytics event `invite_opened`
6. Return invite info for frontend

**Success Response (200):**
```json
{
  "success": true,
  "invite": {
    "id": "invite-123",
    "candidateEmail": "candidate@example.com",
    "projectId": "project-123",
    "companyId": "company-789",
    "status": "started",
    "timestamp": 1640995200000,
    "expiresAt": 1641600000000,
    "lastOpenedAt": 1640995800000,
    "token": "abc123..."
  }
}
```

**Error Responses:**
- `400` - Token parameter required
- `404` - Invalid invite token
- `410` - Invite already completed or expired
- `500` - Internal server error

### 3. `/api/candidate/submitResult` - Submit Assessment Results

**Method:** `POST`

**Purpose:** Handles result submission after candidates complete assessments.

**Request Body:**
```json
{
  "token": "abc123...",
  "result": {
    "totalScore": 85,
    "competencyBreakdown": {
      "leadership": 90,
      "communication": 80,
      "problemSolving": 85,
      "teamwork": 88
    },
    "completionTime": 1800000,
    "answers": [
      {"questionId": 1, "answer": "A", "timeSpent": 45000},
      {"questionId": 2, "answer": "B", "timeSpent": 50000}
    ]
  }
}
```

**Process Flow:**
1. Validate token and result data
2. Find invite by token
3. Check if invite is not already completed or expired
4. Update invite:
   - Set `status` to `'completed'`
   - Store `result` data
   - Set `completedAt` timestamp
5. Log analytics event `assessment_completed` with score data
6. Return confirmation

**Success Response (200):**
```json
{
  "success": true,
  "message": "Assessment results submitted successfully",
  "invite": {
    "id": "invite-123",
    "candidateEmail": "candidate@example.com",
    "projectId": "project-123",
    "companyId": "company-789",
    "status": "completed",
    "completedAt": 1640996400000,
    "totalScore": 85
  }
}
```

**Error Responses:**
- `400` - Token or result data missing/invalid
- `404` - Invalid invite token
- `409` - Assessment already completed
- `410` - Invite expired
- `500` - Internal server error

## Testing

### Automated Test Suite

Run the comprehensive test suite via:
```
GET/POST /api/test-invite-flow
```

The test suite covers:

1. **License Validation Test**
   - Create company with `licenseCount: 1, usedLicensesCount: 0`
   - Send first invite → Should succeed and increment counter
   - Try second invite → Should fail with "License limit reached"

2. **Invite Flow Test**
   - Open invite link → Should update status to 'started'
   - Submit results → Should update status to 'completed'
   - Try duplicate submission → Should fail

3. **Edge Cases**
   - Invalid tokens → 404 responses
   - Missing required fields → 400 responses
   - Expired invites → 410 responses

### Manual Testing

To manually test the flow:

1. **Setup Test Data:**
   ```javascript
   // Create test company in Firestore
   {
     "name": "Test Company",
     "licenseCount": 5,
     "usedLicensesCount": 0,
     "createdAt": Date.now(),
     "updatedAt": Date.now()
   }
   
   // Create test HR user
   {
     "email": "hr@testcompany.com",
     "companyId": "your-company-id",
     "createdAt": Date.now(),
     "updatedAt": Date.now()
   }
   ```

2. **Test Invite Creation:**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/hr/sendInvite \
     -H "Content-Type: application/json" \
     -d '{
       "candidateEmail": "test@example.com",
       "projectId": "test-project",
       "hrId": "your-hr-id"
     }'
   ```

3. **Test Invite Opening:**
   ```bash
   curl "https://your-domain.vercel.app/api/invite/open?token=YOUR_TOKEN"
   ```

4. **Test Result Submission:**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/candidate/submitResult \
     -H "Content-Type: application/json" \
     -d '{
       "token": "YOUR_TOKEN",
       "result": {"totalScore": 85, "details": "..."}
     }'
   ```

## Security & Analytics

### Security Features
- Token-based authentication for all operations
- Input validation and sanitization
- Email format validation
- Atomic Firestore transactions for license counting
- Comprehensive error handling with appropriate HTTP status codes

### Analytics Events
The system logs the following events:
- `invite_sent` - When HR sends an invite
- `invite_opened` - When candidate opens invite link
- `assessment_completed` - When candidate submits results

Each event includes relevant metadata like timestamps, user IDs, scores, etc.

### Rate Limiting & Abuse Prevention
- License limits prevent unlimited invite creation
- Token expiration (7 days) prevents long-term abuse
- One-time use tokens prevent replay attacks
- Status tracking prevents duplicate submissions

## Environment Variables

Ensure the following environment variables are configured:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-service-account-private-key

# SendGrid for emails
SENDGRID_API_KEY=your-sendgrid-api-key

# Application URLs
VITE_GAME_PLATFORM_URL=https://game.yourdomain.com
```

## Integration Notes

### Frontend Integration
The frontend should:
1. Call `/api/hr/sendInvite` from HR dashboard when sending invites
2. Call `/api/invite/open` when candidates access tokenized links
3. Call `/api/candidate/submitResult` after assessment completion
4. Handle all error states appropriately with user feedback

### Email Integration
- Uses SendGrid for reliable email delivery
- Email templates include company branding and assessment links
- Supports custom role tags and company names
- Handles email delivery failures gracefully

### Database Consistency
- Uses Firestore transactions for atomic operations
- Implements proper error handling and rollback
- Maintains referential integrity between collections
- Supports horizontal scaling through Firestore's architecture

## Troubleshooting

### Common Issues

1. **"License limit reached" errors:**
   - Check company's `licenseCount` vs `usedLicensesCount`
   - Verify license counting logic is working correctly

2. **Email delivery failures:**
   - Verify SENDGRID_API_KEY is set correctly
   - Check SendGrid account status and quotas
   - Review email templates for compliance

3. **Token validation failures:**
   - Ensure tokens are being passed correctly in requests
   - Check for URL encoding issues with tokens
   - Verify Firestore security rules allow token queries

4. **Firebase connection issues:**
   - Verify all Firebase environment variables are set
   - Check service account permissions
   - Ensure Firestore is enabled for the project

## Performance Considerations

- Firestore queries are optimized with proper indexing
- License checking uses efficient document reads
- Email sending is asynchronous to avoid blocking
- Analytics events are logged without blocking main flow
- Transaction retries are handled automatically by Firestore

This implementation provides a robust, scalable foundation for your HR tech SaaS platform's invite and assessment flow. 