# Product Backlog Modified (DO NOT USE FOR CLASS)

| **ID** | **User Story / Task** | **Status** |
|--------|------------------------|--------------|
| SECURITY-001 | **[Consolidated] Security & Access Control**: Implement Firebase rules and frontend route protection to enforce university-only access and owner-based permissions. | In Progress |
| ADMIN-001 | **[Consolidated] Moderation Suite**: Admin dashboard for reviewing reports, logging actions, and moderating content/users. | In Progress |
| ADMIN-002 | As an administrator, I want to log in to a dedicated admin portal using specific credentials. | In Progress |
| ADMIN-DASH-001 | As an administrator, I want to view an overview dashboard showing total users, classes, files, storage usage, active users, global recent uploads (bypassing visibility), and flagged content count. | In Progress |
| ADMIN-USER-001 | As an administrator, I want to view, search, and filter all users, manage their roles, suspend accounts, and track their activity and storage usage. | In Progress |
| ADMIN-CLASS-002 | As an administrator, I want to browse all classes, view their details and associated files, toggle their visibility, and have the ability to delete or archive classes. | In Progress |
| ADMIN-MEDIA-001 | As an administrator, I want to browse all uploaded files and media regardless of their visibility settings, preview them, and delete inappropriate files with audit logs. | In Progress |
| ADMIN-REPORT-001 | As an administrator, I want to review a queue of flagged/reported content, including reporter information, and take action (dismiss report, remove content, suspend uploader). | In Progress |
| ADMIN-ANALYTICS-002 | As an administrator, I want to monitor platform analytics including uploads, class creation, active users, engagement trends, search activity, and email domain distribution. | In Progress |
| ADMIN-SECURITY-001 | As an administrator, I want to detect orphaned files, ensure private content is not leaked, and monitor abnormal usage patterns. | In Progress |
| ADMIN-CONFIG-001 | As an administrator, I want to manage platform configuration controls such as allowed email domains, upload size limits, feature toggles, and platform-wide announcements. | In Progress |
| ADMIN-AUDIT-001 | As an administrator, I want to track and log all admin actions with timestamps, actor details, and have the ability to export user, class, and file data for reporting. | In Progress |
| UPLOAD-001 | As a user, I want to upload large video files with progress feedback so that I can track upload completion. | In Progress |
| PERMISSIONS-001 | As a developer, I want to implement role-based permissions (future) so that professors and students may have different capabilities. | In Progress |
| ERROR-HANDLING-001 | As a developer, I want to implement centralized frontend error handling so that all application errors are managed consistently. | In Progress |
| CLASSPAGE-001 | **[Consolidated] Class Resource Management**: Support for creating, editing, and pinning formatted notes and organizing documents into folders. | In Progress |
| CLASSPAGE-002 | As a user, I want to toggle visibility of specific class information fields (e.g., Instructor, Office, Time) when editing class details. | In Progress |
| CLASSPAGE-003 | As a user, I want to toggle the public/private visibility of a class directly from its dedicated class page. | In Progress |
| DOCUMENT-001 | As a user, I want to preview documents (PDFs) directly in the browser so that I do not need to download them first. | In Progress |
| UI-RESPONSIVE-001 | As a user, I want to access the platform on different screen sizes so that I can use it on mobile and desktop devices. | In Progress |
| UI-002 | As a user, I want to switch between dark and light mode for the application interface. | In Progress |
| DASHBOARD-001 | **[Consolidated] Recommendation Engine**: Algorithm and UI to display prioritized, relevant content on the dashboard. | In Progress |
| ONBOARDING-001 | **[Consolidated] User Onboarding Flow**: Interactive walkthrough and tutorials for first-time users, including progress tracking. | In Progress |
| SECURITY-002 | As a developer, I want to verify the security of logins and video files. | In Progress |
| PERFORMANCE-001 | As a developer, I want to index frequently queried fields in Firestore so that search and retrieval performance is optimized. | In Progress |
| UI-FEEDBACK-001 | As a user, I want to view a loading indicator when videos or classes are being fetched. | In Progress |
| DOWNLOAD-001 | As a user, I want to download videos when permitted so that I can access them offline. | In Progress |
| CLASS-MEMBERSHIP-001 | **[Consolidated] Class Membership**: Ability to view class members, invite others, and receive joining notifications. | In Progress |
| SOCIAL-001 | **[Consolidated] Social Engagement**: Star/Favorite videos, profiles, classes, and notes for quick access on the dashboard. | In Progress |
| PROFILE-001 | **[Consolidated] Public Profiles**: View user activity and manage profile visibility (Public/Private). | In Progress |
| PROFILE-002 | As a user, I want to toggle visibility of specific profile information fields (e.g., Major, Minor, Graduation, About Me) on my profile page. | In Progress |
| PERFORMANCE-002 | As a developer, I want to implement caching strategies for frequently accessed data so that performance is improved. | In Progress |
| SEARCH-FILTER-001 | As a user, I want to filter videos by date and class so that I can narrow down content efficiently. | In Progress |
| VIDEO-METADATA-001 | As a user, I want to edit video metadata (title, description, visibility) so that my content remains accurate. | In Progress |
| SEARCH-SORT-001 | As a user, I want to sort videos by upload date or title. | In Progress |
| CLASS-SHARE-001 | As a user, I want to be able to share my classes to other users via generated links. | In Progress |
| ANALYTICS-001 | **[Consolidated] Engagement Analytics**: Track and display view counts and usage metrics for content. | In Progress |
| COMMENT-001 | As a user, I would like to commment on videos. | In Progress |
| VIDEO-THUMBNAIL-001 | As a user, I want to upload a custom thumbnail for my videos. | In Progress |
| DOCUMENT-RENAME-001 | As a user, I want to rename uploaded documents. | In Progress |
| DOCUMENT-SIZE-001 | As a user, I want to see file sizes before downloading. | In Progress |
| SEARCH-FEEDBACK-001 | As a user, I want to see a message when no search results are found. | In Progress |
| DASHBOARD-002 | **[Dashboard Refactor]**: View recently uploaded content and recently visited classes. | In Progress |

| **ID** | **Deferred / Low Priority** | **Status** |
|--------|------------------------|--------------|
| DEFERRED-API-001 | [Legacy] Implement rate limiting on API endpoints (Note: Limited applicability in serverless Firestore). | In Progress |
| DEFERRED-API-002 | [Legacy] Log API requests and errors (Note: Use Firebase Console logs instead). | In Progress |
| DEFERRED-CLI-001 | [Out of Scope] Command line interface (CLI) in GO for file uploads. | In Progress |
| DEFERRED-EXTERNAL-001 | [External] Support for Capstone "Celebration of Scholarship Lite" events. | In Progress |
| DEFERRED-LOGISTICS-001 | [Logistics] Verify team attendance for May 14 Product Presentation. | In Progress |
| ADMIN-ENHANCE-001 | As a developer, I want to explore AI-assisted moderation and auto-flagging capabilities for content. | In Progress |
| ADMIN-ENHANCE-002 | As a developer, I want to explore implementing usage heatmaps and granular moderator roles. | In Progress |
| ADMIN-ENHANCE-003 | As a developer, I want to explore backup solutions for critical platform data. | In Progress |