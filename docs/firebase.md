# Firebase Configuration and Services

Firebase serves as the complete backend infrastructure for PitHub. Each service is configured to work in a serverless capacity.

## Authentication

We use Firebase Auth with the Google Provider. To maintain a university-exclusive environment, we implemented a domain restriction in the `AuthContext`.

```javascript
// Domain restriction logic
if (user && user.email.endsWith('@lewisu.edu')) {
  setAuthState(user);
} else {
  logout(); // Automatically eject non-university accounts
}
```

## Firestore (NoSQL Database)

Structured data is organized into three primary collections:

1.  **users**: Profile info and global visibility settings.
2.  **classes**: Metadata for courses (name, `ownerId`, `visibility`).
3.  **files**: An index of Storage objects, mapping file names to URLs, `classId`, and `thumbnailUrl`.

## Cloud Storage

Raw binary data (videos, PDFs, etc.) is stored with the following hierarchy:
*   `/classes/{classId}/` : Original files.
*   `/thumbnails/{classId}/` : Auto-generated preview images for videos.

## Hosting and Emulators

We use both traditional Firebase Hosting for static assets and the **App Hosting** stack. App Hosting manages the Vite build pipeline and handles environment variables via `apphosting.yaml`.

For development, we use the Firebase Emulators. Running `npm run dev` from the root starts both the Vite server and the emulators concurrently. The app detects the local environment and redirects SDK calls to `localhost` ports.

## Security Rules

Security is enforced via server-side rules in `firestore.rules`.

```text
// Logical summary of Firestore rules:
allow read: if resource.data.visibility == 'public' || request.auth.uid == resource.data.ownerId;
allow write: if request.auth.uid == resource.data.ownerId;
```

Refer to either the `.rules` files in the root directory for the full implementation or the Rules section within Firebase Storage and Firestore (in your Firebase Console).