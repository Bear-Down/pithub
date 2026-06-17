import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, getAuth } from "firebase/auth";
import { db, provider, app } from "../lib/firebase"; // Assuming 'app' is exported from firebase.js
import { doc, setDoc, serverTimestamp, onSnapshot, getFirestore, updateDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isSuspended, setIsSuspended] = useState(false);

	const auth = getAuth(app); // Get auth instance from the app
	const firestore = getFirestore(app); // Get firestore instance from the app

	useEffect(() => {
		let userDocUnsubscribe = null;

		const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			// Cleanup previous snapshot listener if user changes or logs out
			if (userDocUnsubscribe) {
				userDocUnsubscribe();
				userDocUnsubscribe = null;
			}

			if (firebaseUser) {
				setLoading(true);
				const userDocRef = doc(firestore, 'users', firebaseUser.uid);

				try {
					// 1. Initial verification and sync (One-time fetch)
					const docSnap = await getDoc(userDocRef);
					const userData = docSnap.data();
					const email = firebaseUser.email?.toLowerCase().trim();
					const isAdminEmail = email === "admin@pithub.local";
					const isLewisUser = email?.endsWith("@lewisu.edu");
					const userRole = userData?.role || (isAdminEmail ? 'admin' : 'user');
					const userIsSuspended = userData?.isSuspended ?? false;

					if (isLewisUser || (isAdminEmail && userRole === 'admin')) {
						// 2. Perform Profile Sync (One-time write per login)
						if (!docSnap.exists()) {
							await setDoc(userDocRef, {
								displayName: firebaseUser.displayName,
								email: firebaseUser.email,
								lastLogin: serverTimestamp(),
								role: userRole,
								isSuspended: userIsSuspended,
								visibility: 'private', // Added to prevent security rule errors
							}, { merge: true });
							console.log("New user profile created in Firestore.");
						} else {
							await updateDoc(userDocRef, {
								lastLogin: serverTimestamp(),
								role: userRole, // Use the resolved role
								isSuspended: userIsSuspended,
								visibility: userData?.visibility || 'private',
							});
							console.log("Existing user profile updated in Firestore.");
						}

						// 3. Set global auth state
						setUser(firebaseUser);
						setIsAdmin(userRole === 'admin');
						setIsSuspended(userIsSuspended);
						console.log("Login successful.");

						// 4. Start real-time listener for changes (Read-only for state sync)
						userDocUnsubscribe = onSnapshot(userDocRef, (snap) => {
							const data = snap.data();
							if (data) {
								setIsAdmin(data.role === 'admin');
								setIsSuspended(data.isSuspended || false);
							}
						});
					} else {
						console.log("Rejected email:", firebaseUser.email);
						alert("Access Denied: Please use a Lewis University email or valid admin credentials.");
						await signOut(auth);
					}
				} catch (error) {
					console.error("Auth initialization error:", error);
					await signOut(auth);
				}
				setLoading(false);
			} else {
				setUser(null);
				setIsAdmin(false);
				setIsSuspended(false);
				console.log("User logged out.");
				setLoading(false);
			}
		});

		return () => {
			authUnsubscribe();
			if (userDocUnsubscribe) userDocUnsubscribe();
		};
	}, [auth, firestore]);

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

	return ( // Provide isAdmin and isSuspended to the context
		<AuthContext.Provider value={{ user, loading, logout, loginWithGoogle, isAdmin, isSuspended }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
