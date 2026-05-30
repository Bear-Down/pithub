import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			console.log("FULL USER:", firebaseUser);
  			console.log("EMAIL RAW:", firebaseUser?.email);
			if (firebaseUser && firebaseUser.email.endsWith("@lewisu.edu")) {
				setUser(firebaseUser);
				
				// Sync user profile to Firestore
				try {
					const userRef = doc(db, 'users', firebaseUser.uid);
					await setDoc(userRef, {
						displayName: firebaseUser.displayName,
						email: firebaseUser.email,
						lastLogin: serverTimestamp(),
					}, { merge: true });
					console.log("User profile synced to Firestore.");
				} catch (error) {
					console.error("Error syncing user profile:", error);
				}

				console.log("Login successful.");
			} else {
                // If they sign in with a non-Lewis account, force sign out immediately
                if (firebaseUser) {
					console.log("Rejected email:", firebaseUser.email);
					alert("Please use a Lewis University email.");
					signOut(auth);
				}
				setUser(null);
				console.log("Unauthorized account.");
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const logout = async () => {
		try {
			await signOut(auth);
			console.log("Logout successful.");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}

	const loginWithGoogle = async () => {
		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
