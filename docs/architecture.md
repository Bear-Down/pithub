# Project Architecture

The purpose of this documentation is to give you a high-level look at how we are actually have this project set up. The core architecture behind PitHub is a serverless React architecture. We lean heavily on Firebase to avoid the managing a traditional backend server (like using Node.js).

## The Frontend

We are using Vite is to power this React application. We chose this because the development cycle is significantly faster and cleaner than other tools or just plain HTML and CSS. The app is basically a Single Page Application (SPA), which means all view switching happens on the client side using React Router.

## The Backend-as-a-Service

Since there is no dedicated Node.js or Python backend, the client communicates directly with Firebase services.

1.  **Data Flow**: This application uses real-time listeners for features like the dashboard. When a new file is uploaded, the UI updates automatically via Firestore subscriptions.
2.  **Security**: Since the client is exposed to the database, we rely on Firestore and Storage Security Rules. These rules use the user's UID to verify ownership of classes and files before allowing write operations.
3.  **State Management**: We use the React Context API for global state. The `AuthContext` wraps the application, allowing any component to access the current user's session.

```javascript
// High-level look at how we handle real-time updates
const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  const files = snapshot.docs.map(doc => doc.data());
  setFiles(files);
});
```

## Security and Maintenance

We use dependency overrides in the root `package.json` to handle critical security holes in sub-dependencies (like `protobufjs`). This forces the entire workspace to use patched versions regardless of what individual packages request.

```json
"overrides": {
  "protobufjs": "^7.2.6",
  "fast-uri": "^3.0.0"
}
```

## Deployment and Workflow

PitHub oject is deployed using the Firebase App Hosting stack. This supports dynamic, framework-aware deployments. Configuration lives in `apphosting.yaml` at the root, mapping environment variables to Google Cloud secrets.

Regarding the workflow, strict branch protection is enforced on the `main` branch. Direct pushes are disabled; all changes must come through a Pull Request from `dev`. This ensures that any code changes are reviewed before it reaches production.

When starting a new feature, you should branch off `dev`, merge back to `dev` for testing, and then open a PR to `main` when the feature is stable.