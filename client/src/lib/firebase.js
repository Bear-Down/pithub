import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

// Helper to clean env variables from potential whitespace/corruption
const getEnv = (key) => (import.meta.env[key] || "").trim();

const firebaseConfig = {
	apiKey: getEnv("VITE_FIREBASE_API_KEY"),
	authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
	projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
	storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
	appId: getEnv("VITE_FIREBASE_APP_ID")
};

// Detect if .env variables are concatenated or malformed
if (import.meta.env.DEV) {
    Object.entries(firebaseConfig).forEach(([key, value]) => {
        if (value.includes("VITE_") || value.includes(" ") || value.includes("=")) {
            console.error(`%c CORE SECURITY ERROR %c Your .env variable for %c${key}%c is corrupted.\n\nIt currently contains: %c"${value}"%c\n\nThis usually means your .env file is missing a newline between variables.`, 
            'background: red; color: white; font-weight: bold; padding: 2px 4px; border-radius: 2px;', '', 'color: #3498db; font-weight: bold;', '', 'color: #e74c3c; font-style: italic;', '');
        }
    });
    console.log("Firebase App Initialized for Project:", firebaseConfig.projectId);
}

// Catch empty env vars early
const missingVars = Object.entries(firebaseConfig)
	.filter(([_, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
  	console.warn(`Firebase Config Warning: Missing from .env: ${missingVars.join(", ")}`);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Connect to emulators if running locally
if (import.meta.env.DEV) {
	console.log("Connecting to Firebase Emulators...");
	const host = window.location.hostname || "127.0.0.1";
	
    // Only connecting Firestore emulator as requested
	connectFirestoreEmulator(db, host, 8085);
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
	hd: "lewisu.edu",
	prompt: "select_account"
});
export { app, db, storage, auth, provider};