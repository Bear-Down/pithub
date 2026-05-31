# PitHub 

PitHub is a Lewis University-exclusive media and document sharing platform designed for students and faculty members to organize their resources into "Classes." It provides a seamless interface for managing files, viewing recent uploads, and maintaining a structured learning environment.

## [Architecture](docs/architecture.md)

PitHub is built on a **Serverless React Architecture**:
- **Frontend**: A high-performance Single Page Application (SPA).
- **State Management**: React Context API for global state (Auth) and local React state combined with Firestore real-time listeners (`onSnapshot`).
- **Cloud Infrastructure**: Google Firebase handles data persistence, binary storage, and hosting.
- **CI/CD**: Integrated GitHub Actions for security scanning and automated deployments via App Hosting.

## [Key Features](docs/features.md)

- **Class Creation**: Organize content by specific courses with "Public" or "Private" visibility.
- **File & Video Uploads**: Upload media with auto-generated thumbnails and metadata indexing.
- **Real-time Dashboard**: A "Recent Uploads" section that updates instantly as new files are added.
- **Profile System**: Personal user pages to manage owned classes and media.
- **Search & Filtering**: Efficiently search for content by metadata.

## [Firebase Configuration](docs/firebase.md)

- **Authentication**: Uses Firebase Auth with Google Provider, restricted to valid university email domains (`@lewisu.edu`).
- **Firestore (NoSQL)**: Stores structured metadata for `users`, `classes`, and `files`. 
- **Cloud Storage**: Stores raw binary data (videos/docs/etc.). Organized at `classes/{classId}/{timestamp}_{filename}`.
- **Hosting / App Hosting**: Managed via `firebase.json` and `apphosting.yaml` for optimized delivery and server-side features.

## [Development Workflow](docs/overview.md)

### Local Setup
1. **Install Dependencies**: Run `npm install` at the project root.
2. **Start Dev Environment**: Run `cd client && npm run dev`. 
   - This uses `concurrently` to launch the React frontend and the Firebase Emulators simultaneously.

### Branching & PRs
- **`dev` Branch**: All active development happens here.
- **`main` Branch**: Reserved for production-ready code.
- **Process**: Team members must create a **Pull Request (PR)** from `dev` (or feature branches) to `main`. Direct pushes to `main` are disabled to ensure code quality.

### Security & Quality

- **Dependency Patching**: Critical vulnerabilities in sub-dependencies are mitigated via the `overrides` field in the root `package.json`.
- **Branch Protection**: Strict rules are enforced on `main`, requiring linear history and successful status checks before merging.

---
*Created by the **Bear Down** Scrum Team for CPSC44000.*