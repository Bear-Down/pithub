import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			console.log("FULL USER:", firebaseUser);
  			console.log("EMAIL RAW:", firebaseUser?.email);
			if (firebaseUser && firebaseUser.email.endsWith("@lewisu.edu")) {
				setUser(firebaseUser);
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
