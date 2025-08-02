# Role-Based Access Control System - Implementation Guide

## Overview

This document describes the complete role-based access control (RBAC) implementation for the HR tech SaaS platform, distinguishing between internal platform users and external company users.

## Role Structure

### Internal Platform Roles (Firebase Auth Custom Claims)
- **`super_admin`**: Full backend access to manage companies and licenses
  - Can create new companies
  - Can set license limits and user quotas
  - Can create initial HR admin users
  - Has access to all platform management functions

### External Company Roles (Stored in `/hrUsers`)
- **`admin`**: HR manager at company level
  - Can create projects within their company
  - Can send assessment invites to candidates
  - Can view all candidate results and analytics
  - Has full access to company-level functions

- **`employee`**: View-only access at company level
  - Can view candidate results and analytics
  - Cannot create projects or send invites
  - Read-only access to company data

## Updated Data Model

### HR Users Collection (`/hrUsers/{hrId}`)
```typescript
interface HrUser {
  id: string;
  email: string;
  name: string;                    // NEW: Full name
  companyId: string;
  role: 'admin' | 'employee';      // NEW: Role-based permissions
  createdAt: number;
  updatedAt: number;
  createdBy?: string;              // NEW: ID of super_admin who created user
}
```

### Companies Collection (`/companies/{companyId}`)
```typescript
interface Company {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  licenseCount: number;
  usedLicensesCount: number;
  maxUsers: number;                // NEW: Maximum HR users allowed
  createdBy?: string;              // NEW: ID of super_admin who created company
}
```

## API Endpoints

### 1. `/api/superadmin/createCompany` - Super Admin Only

**Authentication Required:** Firebase Auth with `super_admin` custom claim

**Method:** `POST`

**Headers:**
```
Authorization: Bearer {firebase-jwt-token-with-super-admin-claim}
Content-Type: application/json
```

**Request Body:**
```json
{
  "companyName": "Acme Corporation",
  "licenseCount": 100,
  "maxUsers": 25,
  "hrEmail": "hr-admin@acme.com",
  "hrName": "Jane Smith",
  "createFirebaseAuth": true
}
```

**Process Flow:**
1. Validate Firebase Auth token and `super_admin` custom claim
2. Check if company name and HR email are unique
3. Create company document with license tracking
4. Create HR admin user document
5. Optionally create Firebase Auth user with temporary password
6. Return company and user details

**Success Response (201):**
```json
{
  "success": true,
  "company": {
    "id": "company-uuid",
    "name": "Acme Corporation",
    "licenseCount": 100,
    "maxUsers": 25,
    "usedLicensesCount": 0
  },
  "hrUser": {
    "id": "hr-uuid",
    "email": "hr-admin@acme.com",
    "name": "Jane Smith",
    "role": "admin",
    "companyId": "company-uuid"
  },
  "firebaseAuthUserId": "firebase-uid",
  "note": "Firebase Auth user created with temporary password. User should reset password on first login."
}
```

**Error Responses:**
- `401` - Missing or invalid authentication token
- `403` - Insufficient permissions (not super_admin)
- `409` - Company name or HR email already exists
- `400` - Invalid input data
- `500` - Internal server error

### 2. `/api/hr/createProject` - Admin Only

**Role Required:** `admin`

**Method:** `POST`

**Request Body:**
```json
{
  "projectName": "Senior Developer Assessment",
  "description": "Leadership assessment for senior dev positions",
  "hrId": "hr-admin-uuid",
  "gamePreferences": ["Leadership Scenario Game"],
  "roleTag": "Senior Developer"
}
```

**Process Flow:**
1. Verify HR user exists and has `admin` role
2. Create project in company's projects subcollection
3. Return project details

**Success Response (201):**
```json
{
  "success": true,
  "project": {
    "id": "project-uuid",
    "name": "Senior Developer Assessment",
    "description": "Leadership assessment for senior dev positions",
    "companyId": "company-uuid",
    "createdBy": "hr-admin-uuid",
    "createdAt": 1640995200000,
    "gamePreferences": ["Leadership Scenario Game"],
    "roleTag": "Senior Developer",
    "status": "active",
    "candidateCount": 0
  }
}
```

**Error Responses:**
- `403` - Insufficient permissions (not admin role)
- `404` - HR user not found
- `400` - Missing required fields
- `500` - Internal server error

### 3. `/api/hr/sendInvite` - Admin Only (Updated)

**Role Required:** `admin`

**Process Changes:**
- Added role validation before license checking
- Enhanced analytics with role information
- Improved error handling for permission issues

**Error Responses (Added):**
- `403` - Insufficient permissions: admin role required

### 4. `/api/hr/getProjectCandidates` - Admin or Employee

**Role Required:** `admin` OR `employee`

**Method:** `GET`

**Query Parameters:**
- `projectId`: Project ID to fetch candidates for
- `hrId`: HR user ID for permission validation

**Process Flow:**
1. Verify HR user exists and has `admin` OR `employee` role
2. Verify project belongs to user's company
3. Fetch all invites/candidates for the project
4. Return candidate list with role-based permissions

**Success Response (200):**
```json
{
  "success": true,
  "project": {
    "id": "project-uuid",
    "name": "Senior Developer Assessment",
    "candidateCount": 5
  },
  "candidates": [
    {
      "id": "invite-uuid",
      "email": "candidate@example.com",
      "status": "Completed",
      "dateInvited": "2024-01-01T10:00:00.000Z",
      "dateCompleted": "2024-01-01T12:30:00.000Z",
      "totalScore": 88,
      "competencyBreakdown": {
        "leadership": 92,
        "communication": 85,
        "problemSolving": 90,
        "teamwork": 85
      },
      "lastOpenedAt": "2024-01-01T10:05:00.000Z"
    }
  ],
  "hrUser": {
    "role": "admin",
    "canSendInvites": true
  }
}
```

**Role-Based Response Differences:**
- `admin` users: `canSendInvites = true`
- `employee` users: `canSendInvites = false`

## Authentication & Authorization

### Firebase Auth Custom Claims
Super admins must have their Firebase Auth user configured with custom claims:

```javascript
// Set custom claims for super admin
await admin.auth().setCustomUserClaims(uid, {
  role: 'super_admin'
});
```

### Server-Side Validation
All endpoints validate permissions server-side:

```typescript
// Super admin validation
const { uid, email } = await verifySuperAdmin(authHeader);

// HR role validation
const hrUser = await verifyHrUserRole(hrId, ['admin']);
const hrUser = await verifyHrUserRole(hrId, ['admin', 'employee']);
```

### Security Features
- **Double validation**: Both Firebase Auth claims AND Firestore role documents
- **Server-side only**: Frontend roles are never trusted
- **Atomic operations**: Company and user creation uses Firestore transactions
- **Audit trail**: All operations include `createdBy` tracking
- **User limits**: Companies have `maxUsers` limits enforced

## Permission Matrix

| Action | Super Admin | HR Admin | HR Employee | Notes |
|--------|-------------|----------|-------------|-------|
| Create Company | ✅ | ❌ | ❌ | Platform-level operation |
| Create Project | ❌ | ✅ | ❌ | Company-level operation |
| Send Invites | ❌ | ✅ | ❌ | Requires license usage |
| View Candidates | ❌ | ✅ | ✅ | Read-only for employees |
| View Analytics | ❌ | ✅ | ✅ | Read-only for employees |
| Manage Company Settings | ❌ | ✅ | ❌ | Admin-only company operations |

## Testing

### Comprehensive Test Suite

Run the permission test suite:
```
GET/POST /api/test-permissions-flow
```

The test suite validates:

#### Super Admin Tests
- ✅ Create company with valid super_admin token
- ❌ Create company without authentication
- ❌ Create company with invalid role

#### Admin User Tests
- ✅ Create projects
- ✅ Send invites
- ✅ View candidates
- ✅ Access admin functions

#### Employee User Tests
- ❌ Create projects (403 Forbidden)
- ❌ Send invites (403 Forbidden)
- ✅ View candidates (read-only)
- ✅ View analytics (read-only)

#### Invalid User Tests
- ❌ Non-existent HR users
- ❌ Users from different companies
- ❌ Expired or invalid tokens

### Test Categories
1. **Authentication Tests**: Token validation and custom claims
2. **Authorization Tests**: Role-based permission enforcement
3. **Cross-Company Tests**: Data isolation between companies
4. **Edge Cases**: Invalid inputs, missing users, expired sessions

## Error Handling

### Standard Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authorization header required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Insufficient permissions: admin role required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "HR user not found"
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": "Company with name 'Acme Corp' already exists"
}
```

## Implementation Notes

### Firebase Auth Setup
1. Configure Firebase project with Authentication enabled
2. Set up custom claims for super admin users
3. Configure Firestore security rules to validate roles
4. Set up proper CORS and security headers

### Company Creation Workflow
1. Super admin authenticates with Firebase Auth
2. Super admin calls `/api/superadmin/createCompany`
3. System creates company and initial HR admin user
4. Optional Firebase Auth user creation with temporary password
5. HR admin receives credentials and resets password

### Role Assignment
- Super admins are assigned via Firebase Auth custom claims
- HR roles are stored in Firestore `/hrUsers` documents
- All role validation happens server-side
- Frontend receives role information but never makes authorization decisions

### Scalability Considerations
- Firestore security rules enforce data isolation
- Company subcollections for project organization
- Indexed queries for efficient candidate lookups
- Atomic transactions for consistency

## Migration Guide

### Existing Data Migration
If migrating from an existing system:

1. **Add role fields** to existing HR users (default to 'admin')
2. **Add maxUsers field** to existing companies
3. **Add createdBy tracking** for audit purposes
4. **Update security rules** to enforce new role structure
5. **Test permission enforcement** before production deployment

### Frontend Integration
Frontend applications should:
1. Store role information from API responses
2. Show/hide UI elements based on permissions
3. Handle 403 errors gracefully with user-friendly messages
4. Never make authorization decisions client-side
5. Always validate permissions on the server

This role-based access control system provides a secure, scalable foundation for managing permissions across your HR tech SaaS platform. 