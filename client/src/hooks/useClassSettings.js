import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

/**
 * Hook to manage Class-specific settings including global visibility 
 * and individual field visibility (CLASSPAGE-002, CLASSPAGE-003).
 */
export const useClassSettings = (classId, initialData) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    const [isFieldLoading, setIsFieldLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Toggle global visibility (Public vs Private)
     * @param {string} currentVisibility - Current visibility state
     * @param {string} ownerId - The UID of the class owner to check profile status
     */
    const toggleGlobalVisibility = async (currentVisibility, ownerId) => {
        setIsGlobalLoading(true);
        const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

        if (newVisibility === 'public') {
            // Verification: Master Profile Visibility Check
            const userRef = doc(db, 'users', ownerId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists() && userSnap.data().visibility === 'private') {
                setIsGlobalLoading(false);
                return { success: false, error: 'PROFILE_PRIVATE' };
            }
        }
        
        try {
            const classRef = doc(db, 'classes', classId);
            await updateDoc(classRef, {
                visibility: newVisibility
            });

            // propagate visibility change to all files within this class (Requirement #1)
            const filesQuery = query(collection(db, 'files'), where('classId', '==', classId));
            const fileSnaps = await getDocs(filesQuery);
            const updatePromises = fileSnaps.docs.map(fileDoc => 
                updateDoc(doc(db, 'files', fileDoc.id), { visibility: newVisibility })
            );
            await Promise.all(updatePromises);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error("Failed to update class visibility:", err);
        } finally {
            setIsGlobalLoading(false);
        }
    };

    // Toggle visibility of specific metadata fields (Instructor, Office, etc.)
    const toggleFieldVisibility = async (fieldName, currentValue) => {
        setIsFieldLoading(true);
        try {
            const classRef = doc(db, 'classes', classId);
            // We store these in a nested object 'displayConfig' to keep the root doc clean
            await updateDoc(classRef, {
                [`displayConfig.${fieldName}`]: !currentValue
            });
        } catch (err) {
            setError(err.message);
            console.error(`Failed to update visibility for ${fieldName}:`, err);
        } finally {
            setIsFieldLoading(false);
        }
    };

    return {
        toggleGlobalVisibility,
        toggleFieldVisibility,
        isGlobalLoading,
        isFieldLoading,
        error
    };
};