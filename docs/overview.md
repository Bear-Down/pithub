# PitHub Project Overview

PitHub is a centralized platform designed for students and creators to organize their media and documents into "Classes." It provides a seamless interface for managing files, viewing recent uploads, and maintaining a structured learning or project environment.

## Directory Structure

```text
pithub-test/
├── .gitignore              # Project-wide git exclusions
├── overview.md             # This document
├── apphosting.yaml         # App Hosting configuration
├── firebase.json           # Firebase deployment configuration
├── decisions.md            # Architectural and design decisions
└── client/                 # React Frontend (Vite)
    ├── src/
    │   ├── main.jsx        # App entry point
    │   ├── app/
    │   │   └── App.jsx     # Main Router and Layout configuration
    │   ├── lib/
    │   │   └── firebase.js # Firebase Initialization (Firestore & Storage)
    │   ├── context/
    │   │   └── AuthContext.jsx # Mock user state management
    │   ├── features/
    │   │   ├── classes/    # Class-specific components (List, Card, Page)
    │   │   └── videos/     # Video/File listing and custom hooks
    │   └── styles/
    │       └── style.css   # Global PitHub theme and layouts
```
## Architecture
PitHub uses a **Serverless React Architecture**:
- **Frontend**: React.js built with Vite for high-performance development and bundling.
- **State Management**: React Context API for user authentication state and local React state with Firestore real-time listeners (`onSnapshot`) for data.
- **Backend-as-a-Service (BaaS)**: Google Firebase handles data persistence, file storage, and future cloud logic.
- **Hosting**: Static assets are served via **Firebase Hosting**, optimized for Single Page Applications (SPAs).

## Firebase Integration
- **Firestore (NoSQL)**: Stores metadata for `classes` (name, owner, timestamp) and `files` (URL, type, class association).
- **Storage**: Stores raw binary data for videos and documents. Files are organized into paths: `classes/{classId}/{timestamp}_{filename}`.
- **Environment Variables**: Managed via `.env` and accessed through Vite's `import.meta.env`.

## Deployment Workflow
To deploy the project to Firebase Hosting:

1.  **Build the Frontend**:
    Navigate to the client directory and run the build script:
    ```bash
    cd client
    npm run build
    ```
2.  **Deploy to Firebase**:
    From the project root, deploy only the hosting component to avoid Cloud Functions timeouts:
    ```bash
    firebase deploy --only hosting
    ```
