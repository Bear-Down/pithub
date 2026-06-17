import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { app } from '../../../lib/firebase'; // Assuming firebase.js exports 'app'
import { useAuth } from '../../../context/AuthContext'; // Assuming AuthContext provides user

/**
 * @file useAdminAuth.js
 * @description A custom hook to manage and verify admin authentication status.
 *              It checks if the currently logged-in user is an administrator
 *              and redirects them if they try to access admin routes without permission.
 */

export const useAdminAuth = () => {
  const { user, loading: authLoading } = useAuth(); // Get current user from AuthContext
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [adminCheckError, setAdminCheckError] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore(app);

  useEffect(() => {
    if (authLoading) return; // Wait for Firebase Auth to initialize

    if (!user) {
      // Not logged in, redirect to admin login
      navigate('/admin/login');
      setAdminCheckLoading(false);
      return;
    }

    // Listen for changes in the user's Firestore document to get their role
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/'); // Redirect non-admins to the main page
      }
      setAdminCheckLoading(false);
    }, (error) => {
      console.error("Error fetching admin role:", error);
      setAdminCheckError(error);
      setAdminCheckLoading(false);
      navigate('/'); // Redirect on error
    });

    return () => unsubscribe(); // Clean up the listener
  }, [user, authLoading, navigate, db]);

  return { isAdmin, adminCheckLoading, adminCheckError };
};
