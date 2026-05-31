# PitHub Project Overview

PitHub is a university-exclusive media and document sharing platform, designed to help students and faculty members to organize resources into "Classes," giving them a centralized interface for managing and viewing files.

## Directory Structure

The project is organized into a root workspace that manages the frontend and overall configuration.
Please view [`directory-structure.md`](directory-structure.md) within the `docs/` folder.

## Architecture

The project follows a serverless React architecture. This means the frontend communicates directly with Firebase services, so we don't need a separate backend Node.js server.

*   **Frontend**: React with Vite for a fast development cycle and optimized production builds.
*   **State Management**: Global state is handled via the React Context API (such as the AuthContext), while local data is managed through real-time Firestore listeners.
*   **Backend**: Google Firebase provides NoSQL data persistence, binary file storage, and authentication.

## Development Workflow

When working on this project, consistency with Git and dependencies is important to avoid integration issues.

### Working with Git and Branches

All active development should take place in the `dev` branch. It is recommended to create feature-specific branches off of `dev` to keep work isolated. 

```bash
# Standard workflow for starting a new feature
git checkout dev        # use 'dev' branch
git pull origin dev     # fetch latest changes from remote branch of 'dev' 
git push origin dev     # push your changes onto 'dev' branch which creates a pull request
```

Once changes are ready, pushing the code to the remote `dev` branch will usually trigger a Pull Request process in GitHub, or you can also create one manually through the GitHub interface. This then allows us to review the latest code changes before code is merged to production.

### Managing Dependencies

If any errors occur related to missing modules or conflicting versions, the first step should be to refresh the dependencies from the root directory.

```bash
# Clear and reinstall dependencies across the workspace
rm -rf node_modules
rm -rf client/node_modules
rm package-lock.json

npm install                     # reinstall everything

npm audit fix                   # verify and fix packages/vulnerabilitiess
```

## Deployment and Hosting

There are two ways the project is currently hosted, depending on whether changes are being finalized or manually deployed.

### Firebase App Hosting (Automated)

This project is configured to use Firebase App Hosting. When code is merged into the `main` branch, the App Hosting pipeline automatically detects these changes and initiates a build and deployment. This makes sure that our live site always reflects the latest stable state of the `main` branch.

### Manual Firebase Hosting (CLI)

If a manual deployment is necessary for testing or specific updates, then we use Firebase Hosting. This requires building the frontend locally before pushing the assets.

```bash
# Manual deployment steps
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## Firebase Integration

*   **Firestore (NoSQL)**: Stores metadata for classes and files. It also tracks ownership using the user's UID to ensure security rules are enforced.
*   **Cloud Storage**: Used for storing raw binary data. 
*   **Environment Variables**: API keys and identifiers are managed via `.env` (ask, and it will be given) files locally and through Secret Manager for App Hosting on Firebase Console.

## Troubleshooting and Contact

If any significant issues arise during development or deployment that cannot be resolved through the documentation, please reach out to us.

- [Kevin Dacanay](kevinbrianfdacanay@lewisu.edu)
- [Erick Hernandez](erickrdhernandez@lewisu.edu)
- [Seb Jaculbe](sebastiandjaculbe@lewisu.edu)
- [Kaleb Richardson](kalebrrichardon@lewisu.edu)
- [Eddy Rodriguez](edwardjrodriguez@lewisu.edu)
