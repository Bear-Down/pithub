# Directory Structure

The project uses npm workspaces to manage the frontend and shared configurations. Most dependencies are hoisted to the root `node_modules`.

## Full Directory Map

```text
pithub-test/
├── .github/                # GitHub specific configuration.
│   └── workflows/          # CI/CD pipelines including CodeQL security scans.
├── backlogs/               # Project management documentation.
│   ├── product-backlog.md  # Long-term feature tracking.
│   └── sprint-backlog.md   # Current active task list.
├── docs/                   # Technical and project documentation.
├── client/                 # The React frontend application.
│   ├── src/                # Frontend source code.
│   │   ├── app/            # Main entry point, global layouts, and routing.
│   │   ├── context/        # Global React Contexts (e.g., Authentication).
│   │   ├── features/       # Domain-specific modules (Classes, Videos, Profile).
│   │   ├── lib/            # Third-party library initializations (Firebase).
│   │   └── styles/         # Global CSS and theme files.
│   ├── public/             # Static assets that bypass the build process.
│   ├── dist/               # Compiled production build output.
│   └── package.json        # Frontend-specific dependencies.
├── firestore.rules         # Security rules for the NoSQL database.
├── storage.rules           # Security rules for file and video storage.
├── firebase.json           # Firebase CLI configuration for hosting and emulators.
├── apphosting.yaml         # Configuration for the Firebase App Hosting pipeline.
├── package.json            # Root workspace configuration and scripts.
└── package-lock.json       # Locked dependency versions for the entire project.
```

## Key File Descriptions

*   **package.json (root)**: Defines the `dev` script which runs Vite and the Firebase Emulators concurrently.
*   **client/src/lib/firebase.js**: The single source of truth for Firebase SDK initialization.
*   **client/src/context/AuthContext.jsx**: Manages user login state and enforces university domain restrictions.
*   **client/dist/**: This directory is generated during the build process and contains the code served to users.