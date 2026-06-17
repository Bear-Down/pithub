# Firestore Codebase Analysis

## Collections and Paths
- `/users/{userId}`: User profile and settings.
- `/classes/{classId}`: Class information.
- `/files/{fileId}`: File metadata and storage references.
- `/reports/{fileId}`: Aggregated user reports for specific files.
- `/admin_logs/{logId}`: Audit trail for critical admin actions.

## Data Models

### User (`/users/{userId}`)
- **Document ID**: `auth.uid`
- **Fields**:
  - `role`: string ('user', 'admin') - Default: 'user'
  - `isSuspended`: boolean - Default: false
  - `major`: string (optional, < 100 chars)
  - `minor`: string (optional, < 100 chars)
  - `gradSemester`: string (optional, < 20 chars)
  - `bio`: string (optional, < 500 chars)
  - `website`: string (optional, URL)
  - `visibility`: string ('private', 'public') - Default: 'private'
  - `profileConfig`: map (boolean toggles)
    - `showMajor`: boolean
    - `showMinor`: boolean
    - `showGradSemester`: boolean
    - `showBio`: boolean
    - `showWebsite`: boolean
    - `showEmail`: boolean
  - `displayName`: string (from Auth)
  - `email`: string (from Auth, PII)

### Class (`/classes/{classId}`)
- **Document ID**: auto-generated
- **Fields**:
  - `name`: string (required, 1-100 chars)
  - `ownerId`: string (required, UID)
  - `ownerName`: string (required)
  - `createdAt`: timestamp (required, serverTimestamp)
  - `visibility`: string ('private', 'public') - Default: 'private'
  - `displayConfig`: map (boolean toggles)
    - `showInstructor`: boolean
    - `showOffice`: boolean
    - `showOfficeHours`: boolean
    - `showEmail`: boolean
    - `showRoom`: boolean
    - `showMeetingTime`: boolean
    - `showDescription`: boolean
    - `showSyllabus`: boolean
  - `instructor`: string (optional)
  - `office`: string (optional)
  - `officeHours`: string (optional)
  - `email`: string (optional, email format)
  - `room`: string (optional)
  - `meetingTime`: string (optional)
  - `description`: string (optional, < 1000 chars)
  - `syllabusUrl`: string (optional, URL)

### File (`/files/{fileId}`)
- **Document ID**: auto-generated
- **Fields**:
  - `name`: string (required, 1-255 chars)
  - `url`: string (required, URL)
  - `storagePath`: string (required)
  - `thumbnailUrl`: string (optional, URL)
  - `thumbnailPath`: string (optional)
  - `classId`: string (required, reference to a class)
  - `ownerId`: string (required, UID)
  - `ownerName`: string (required)
  - `className`: string (required)
  - `type`: string (required, mime type)
  - `createdAt`: timestamp (required, serverTimestamp)
  - `visibility`: string ('private', 'public') - Inherited from class

### Report (`/reports/{fileId}`)
- **Document ID**: The ID of the reported file
- **Fields**:
  - `fileId`: string (required)
  - `reportCount`: number (required, total count)
  - `status`: string ('pending', 'resolved')
  - `reporters`: map (key: uid, value: {timestamp, email, reason})
  - `latestReportedAt`: timestamp
  - `fileVisibility`: string (captured at time of report)

### Admin Log (`/admin_logs/{logId}`)
- **Document ID**: auto-generated
- **Fields**:
  - `action`: string (e.g., 'DELETE_FILE', 'DELETE_CLASS', 'RESOLVE_REPORT')
  - `targetId`: string (ID of the item acted upon)
  - `targetName`: string (Name/Title of the item)
  - `performedBy`: string (The name typed by admin in sign-off)
  - `adminEmail`: string (The email typed by admin in sign-off)
  - `reason`: string (Provided in the sign-off modal)
  - `timestamp`: timestamp (serverTimestamp)

## Queries Identified
- `classes`: `where('ownerId', '==', user.uid)`
- `classes`: `where('ownerId', '==', effectiveUserId)` AND `where('visibility', '==', 'public')`
- `files`: `where('classId', '==', classId)` AND `orderBy('createdAt', 'desc')`
- `files`: `where('classId', '==', classId)` AND `where('visibility', '==', 'public')` AND `orderBy('createdAt', 'desc')`
- `files`: `where('ownerId', '==', userId)` AND `orderBy('createdAt', 'desc')` AND `limit(11)`
- `files`: `where('ownerId', '==', userId)` AND `where('visibility', '==', 'public')` AND `orderBy('createdAt', 'desc')` AND `limit(11)`
- `files`: `where('visibility', '==', 'public')` AND `orderBy('createdAt', 'desc')` AND `limit(6)` (for videos)
- `users`: `where('visibility', '==', 'public')` AND `limit(20)` (search)
- `reports`: `where('status', '==', 'pending')` AND `orderBy('reportCount', 'desc')`
- `admin_logs`: `orderBy('timestamp', 'desc')`

## Authentication
- Restricted to `lewisu.edu` email domain.
- `request.auth.token.email.endsWith('@lewisu.edu')`
  - Or specifically for admin: `admin@pithub.local` via Email/Password.

## Access Patterns
- **Users**: Read own always. Read others only if `visibility == 'public'`. Update only own.
 - **Classes**: Read if owner OR `visibility == 'public'`. Create if authenticated AND !isSuspended. Update/Delete if owner OR isAdmin.
 - **Files**: Read if owner OR `visibility == 'public'` OR (isAdmin AND isReported). Create if authenticated AND !isSuspended. Update/Delete if owner OR isAdmin.
 - **Admin**: Can read all metadata. Can read content if public or file has a 'pending' report.

## Phase 3: Devil's Advocate Attack Outcomes

1.  **Public List Exploit**: CANNOT run queries without authentication due to `isUniversityUser()`.
2.  **Unauthorized Read/Write**: CANNOT access private documents of others.
3.  **The "Update Bypass"**: CANNOT inject large strings due to `.size()` checks on all fields.
4.  **Ownership Hijacking (Create)**: CANNOT set `ownerId` to another user's ID during creation.
5.  **Ownership Hijacking (Update)**: CANNOT change `ownerId` on existing documents.
6.  **Immutable Field Modification**: `createdAt` and `classId` are protected.
7.  **Data Corruption (Type Juggling)**: All fields are type-checked (`is string`, `is map`, etc.).
8.  **Validation Bypass**: Both `create` and `update` use the same validator functions.
9.  **Resource Exhaustion / DoS**: (Protected by string size limits).
10. **Required Field Omission**: `hasRequiredFields` ensures all critical data is present.
11. **Privilege Escalation**: No role-based fields are allowed in the schema.
12. **Schema Pollution**: `hasOnlyAllowedFields` prevents injecting arbitrary data.
13. **Invalid State Transition**: Visibility transitions are allowed but restricted to 'private' or 'public'.
14. **Path Traversal**: (Doc paths are strictly matched).
15. **Timestamp Manipulation**: `createdAt` is usually server-generated, and once set, is immutable.
16. **Negative Value / Overflow**: (No numeric fields used).
17. **The "Mixed Content" Leak**: PII (email) is potentially exposed if profile is public. **RECOMENDATION**: Split PII into a private collection.
18. **Counter/Action Replay**: (N/A).
19. **Orphaned Subcollection Access**: (N/A).
20. **Query Mismatch**: Rules align with the specific queries found in the codebase.
21. **Validator Pattern Check**: ALL rules use validator functions.
