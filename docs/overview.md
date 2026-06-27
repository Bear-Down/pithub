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

All active development should take place in the `dev` branch. We recommend creating feature-specific branches off of `dev` to keep your work isolated.

 **First-time setup:** If you have just cloned the repository, your local repository may only contain the `main` branch even though the remote repository has both `main` and `dev`. Fetch the latest remote branches and create a local `dev` branch that tracks the remote branch:

```bash
# Check for remote dev branch
git branch -r       # you should see 'origin/dev' and 'origin/main'
git switch dev
# or
git fetch origin
git checkout -b dev origin/dev
```
You only need to do this once. Afterward, you can switch to the `dev` branch normally using:
```bash
git checkout dev
```

A normal workflow would be like this:
```bash
# Switch to the development branch
git checkout dev

# Pull the latest changes from the remote dev branch
git pull origin dev

# Create a feature branch from dev
git checkout -b <your-feature>

# Work on your feature
git add .
git commit -m "<your-commit-message>"

# Merge your feature branch back into dev
git checkout dev
git merge <your-feature>

# Optional: Delete your local feature branch when finished
git branch -d <your-feature>

# Push the updated dev branch to GitHub
git push origin dev
```

Once your changes have been pushed to the remote `dev` branch, create a Pull Request to merge `dev` into `main` through GitHub. This allows the team to review, test, and approve your changes before they are merged into the production branch.

> **Note**
>
> Running `npm run dev` starts local Firebase emulators (e.g., Authentication, Firestore, and Storage). These emulators do **not** contain real user data, allowing you to safely develop and test features without affecting the production environment.
>
> After verifying that your changes work correctly in the local emulators, you may deploy only the frontend to Firebase Hosting to test your changes against the live backend:
>
> ```bash
> firebase deploy --only hosting
> ```
>
> Before opening a Pull Request, verify that your changes behave as expected in both the local emulators and the deployed application.
>
> If your deployment introduces bugs or unexpected behavior:
>
> * Identify and fix the issue in your local development environment first.
> * Re-test your changes using `npm run dev` before deploying again.
> * Re-deploy to Firebase Hosting if additional verification is needed.
> * Only create or merge the Pull Request once the issue has been resolved and the application is functioning as expected.
>
> Avoid merging changes into the `main` branch until they have been thoroughly tested and confirmed to be stable.

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

If a manual deployment is necessary for testing or specific updates (as specified above in **Note**), then we use Firebase Hosting. This requires building the frontend locally before pushing the assets.

```bash
# Manual deployment steps
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## Firebase Integration

*   **Firestore (NoSQL)**: Stores metadata for classes and files. It also tracks ownership using the user's UID to ensure security rules are enforced.
*   **Cloud Storage**: Used for storing raw binary data (videos, images, etc.). 
*   **Environment Variables**: API keys and identifiers are managed via `.env` (ask, and it will be given) files locally and through Secret Manager for App Hosting on Firebase Console.

## Troubleshooting and Contact

If any significant issues arise during development or deployment that cannot be resolved through the documentation, please reach out to us.

- [Kevin Dacanay](kevinbrianfdacanay@lewisu.edu)
- [Erick Hernandez](erickrhhernandez@lewisu.edu)
- [Sebastian Jaculbe](sebastiandjaculbe@lewisu.edu)
- [Kaleb Richardson](kalebjrichardon@lewisu.edu)
- [Eddy Rodriguez](edwardhrodriguez@lewisu.edu)
