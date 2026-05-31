# Product Features

PitHub is designed to provide an intuitive user experience for Lewis University environment. Below is a breakdown of the current feature set that PitHub contains.

## Class Creation and Management

The core of the application is the "Class" entity. Any authenticated user (user with @lewisu.edu email) can create a class, which generates a document in the `classes` collection in Firestore. The creator's UID is stored as the `ownerId`, granting them exclusive rights to edit or delete the class.

*   **Visibility**: Classes can be toggled between **Public** and **Private**.

## File and Video Uploads

Binary data (of videos, docs, images, etc.) is pushed to Firebase Storage under the path structure: `classes/{classId}/{filename}`.

For video uploads, the client-side logic performs on-the-fly thumbnail generation to save on cloud processing costs. This basically takes the first second of the video using a hidden element, draws it to a canvas, and uploads the result as a JPEG, which becomes the thumbnail.

```javascript
// Pseudocode for client-side thumbnail generation
video.onloadeddata = () => {
  video.currentTime = 1; // Seek to 1 second
};
video.onseeked = () => {
  context.drawImage(video, 0, 0, width, height);
  canvas.toBlob((blob) => uploadThumbnail(blob), 'image/jpeg');
};
```

## Real-time Dashboard and Search

The home page includes a **Recent Uploads** section that uses Firestore snapshots to update the UI instantly when new files are indexed. 

Search functionality let users find classes and files by metadata. The logic is configured to respect visibility settings, making sure that private content is filtered out.

## Profile System

Each user has a dedicated profile page summarizing their activity and owned classes. A global visibility toggle in the header's dropdown menu allows users to set their entire profile to private or public.

The UI uses custom Modal components for critical actions (like deletions) and implements loading states using spinners to maintain a responsive feel while waiting for Firebase responses.