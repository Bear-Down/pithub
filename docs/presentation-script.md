# PitHub Product Showcase Presentation Script

**Team Members:** Kevin, Sebastian, Erick, Edward, Kaleb

---

## Part 1: Product Overview (Team Lead / Intro)

**Speaker:** [Intro Speaker]

"Welcome everyone! Today, our team is excited to showcase **PitHub**—a centralized platform designed for students and educators to share, discover, and manage educational content like videos and documents. Our goal was to create a seamless, collaborative environment that feels both professional and easy to navigate.

PitHub allows users to create classes, upload course materials, and maintain academic profiles. Whether you're a student looking for a specific lecture or a teacher organizing resources, PitHub provides the tools to make that process efficient.

Today, each of our team members will walk you through a specific feature they’ve pioneered, including a look at the production environment and the code that powers it."

---

## Part 2: Search Functionality

**Speaker: Kevin**

### **The Demonstration**
"I’ll start with the **Search Bar**, which is the primary way users discover content across the platform. In the production environment, as I type into the search bar at the top, you’ll notice it instantly categorizes results into Users, Classes, and Videos/Docs. 

If I type 'Calculus', the dropdown immediately shows me any public classes or documents matching that name. It even handles thumbnails for videos and placeholders for documents, giving users a visual hint of what they’re about to click."

### **Customer Benefit**
"The benefit here is speed and discoverability. Users don't have to navigate through endless menus to find what they need. By aggregating multiple data types into a single search interface, we reduce friction and help students get to their study materials faster."

### **Code Review**
"Taking a look at `SearchBar.jsx`, I implemented a **debouncing** mechanism using `setTimeout` within a `useEffect` hook. This ensures we don't spam Firestore with a request for every single keystroke, waiting instead for a 400ms pause in typing.

Technically, I’m using `Promise.all` to execute three separate Firestore queries in parallel—one each for classes, users, and files. This maximizes performance. I also implemented a 'click outside' listener using a React `useRef` to ensure the dropdown closes naturally when the user interacts with other parts of the page."

### **Code Snippet**
**File:** `client/src/features/search/SearchBar.jsx` (Lines 35-46)
```javascript
// Execute all queries in parallel for better performance
const [classSnap, userSnap, fileSnap] = await Promise.all([
    getDocs(classQuery),
    getDocs(userQuery),
    getDocs(fileQuery)
]);

const matchedClasses = classSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(c => c.name.toLowerCase().includes(term));
```

---

## Part 3: Pagination Systems

**Speaker: Sebastian**

### **The Demonstration**
"Next, I’d like to show how we handle large amounts of data using **Pagination**. You can see this in action on the main page under 'Recent Uploads' and also on any 'Profile Page'. 

Instead of loading every file in the database at once, we load them in batches of 5 or 10. As I click 'Next', the list updates smoothly. If I go to a user's profile, you'll see the same consistent experience, allowing you to browse their history without slowing down the page."

### **Customer Benefit**
"Pagination is critical for scalability and performance. For users with hundreds of uploads, loading everything at once would cause significant lag and consume excessive data. This system keeps the interface snappy and the load times minimal, regardless of how much content is on the platform."

### **Code Review**
"I implemented this using Firestore **cursors**. In `useVideos.js`, I maintain a `lastDocs` array that stores the document snapshot for the end of each page. 

When a user clicks 'Next', we use the `startAfter(cursor)` method in our query. This is much more efficient than offset-based pagination because it allows Firestore to jump directly to the next set of results without reading all previous documents. I also used the `onSnapshot` listener to ensure that if a new file is uploaded while a user is on the first page, the list updates in real-time."

### **Code Snippet**
**File:** `client/src/hooks/useVideos.js` (Lines 16-22)
```javascript
// To get page N, we startAfter the last doc of page N-1
const cursor = page > 1 ? lastDocs[page - 2] : null;

// Create a query to get recent files from Firestore
const filesQuery = cursor 
    ? query(collection(db, "files"), orderBy("createdAt", "desc"), startAfter(cursor), limit(pageSize))
    : query(collection(db, "files"), orderBy("createdAt", "desc"), limit(pageSize));
```

---

## Part 4: Interactive Confirmation Modals

**Speaker: Erick**

### **The Demonstration**
"I focused on user feedback and safety through **Confirmation Modals**. When a user tries to delete a file in a class page, we don't just delete it immediately. A custom modal pops up, clearly stating the consequences and asking for confirmation. 

Similarly, after a successful upload, we provide a 'Success' modal to give the user peace of mind that their file is now live. You can see these throughout the app—from deleting classes to confirming profile updates."

### **Customer Benefit**
"These modals prevent accidental data loss, which is a major pain point in content management systems. By providing clear, actionable feedback, we build trust with the user and ensure they feel in control of their data at all times."

### **Code Review**
"I built a reusable `ConfirmationModal.jsx` component. It uses a portal-like approach with a high `z-index` and a `backdrop-filter: blur` to create a modern, focused UI. 

The component is highly flexible: it accepts `title`, `message`, `confirmText`, and `isLoading` props. This allows us to use the same logic for deletions—where we might show a 'Deleting...' state—as we do for simple success messages. In `ClassPage.jsx`, I simply manage the `isOpen` state based on the action being performed."

### **Code Snippet**
**File:** `client/src/features/classes/ClassPage.jsx` (Lines 403-412)
```jsx
<ConfirmationModal 
    isOpen={showUploadSuccess}
    title="Upload Complete"
    message={
        <>Your file <strong>{lastUploadedFile}</strong> has been successfully uploaded and is now available for the class.</>
    }
    confirmText="Done"
    onConfirm={() => setShowUploadSuccess(false)}
    onCancel={() => setShowUploadSuccess(false)}
/>
```

---

## Part 5: Enhanced Document Metadata

**Speaker: Edward**

### **The Demonstration**
"I worked on the **Document List** display, specifically adding the uploader's name directly below the file name. In the production app, when you look at any list of videos or docs, you’ll see 'Uploaded by [Name]' right there in the list. This gives immediate context to the content."

### **Customer Benefit**
"Context is everything in a collaborative platform. Knowing who uploaded a document helps students identify trusted sources or find materials from their specific classmates or instructors without having to click into every file."

### **Code Review**
"In the `VideoList.jsx` and `ClassPage.jsx` components, I updated the list item structure to include a sub-span for metadata. I used conditional rendering to handle cases where an uploader's name might be missing, defaulting to 'Anonymous'. This involved mapping through the `ownerName` property we store in our Firestore 'files' collection."

### **Code Snippet**
**File:** `client/src/features/videos/VideoList.jsx` (Lines 31-33)
```jsx
<span style={{ fontSize: '0.75rem', color: '#777' }}>
    {video.ownerName || 'Anonymous'} in {video.className || 'General'}
</span>
```

---

## Part 6: Profile Connectivity

**Speaker: Kaleb**

### **The Demonstration**
"Building on Edward's work, I turned those uploader names into **active links**. Now, when you see a name in the document list, it’s not just text—it’s a clickable link that takes you directly to that user’s profile. From there, you can see all the other public materials they’ve shared."

### **Customer Benefit**
"This creates a 'web' of connectivity. If a student finds a really helpful study guide, they can easily find more content from that same student. It encourages networking and makes the platform feel like a true community rather than just a file dump."

### **Code Review**
"I integrated the React Router `Link` component into the metadata section Edward created. In `VideoList.jsx`, I wrapped the `ownerName` in a `<Link>` that dynamically points to `/profile/${video.ownerId}`. 

I also had to ensure that we were correctly passing the `ownerId` from the backend to make these links functional. This small change significantly improved the site's navigation flow, making it much more interconnected."

### **Code Snippet**
**File:** `client/src/features/videos/VideoList.jsx` (Lines 31-37)
```jsx
<span style={{ fontSize: '0.75rem', color: '#777' }}>
    {video.ownerId ? (
        <Link to={`/profile/${video.ownerId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
            {video.ownerName || 'Anonymous'}
        </Link>
    ) : (
        video.ownerName || 'Anonymous'
    )}
</span>
```

---

## Part 7: Conclusion (Team Lead)

**Speaker: [Intro Speaker]**

"That concludes our showcase of PitHub. By combining powerful search, scalable pagination, safe user interactions, and deep connectivity, we’ve built a platform that we’re truly proud of. Thank you for your time, and we’re happy to answer any questions!"
