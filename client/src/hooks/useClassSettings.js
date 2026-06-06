import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, getDoc, writeBatch } from 'firebase/firestore';

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

        try {
            if (newVisibility === 'public') {
                // Verification: Master Profile Visibility Check
                const userRef = doc(db, 'users', ownerId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists() && userSnap.data().visibility === 'private') {
                    setIsGlobalLoading(false);
                    return { success: false, error: 'PROFILE_PRIVATE' };
                }
            }

            const classRef = doc(db, 'classes', classId);
            const batch = writeBatch(db);
            
            // Add class update to batch
            batch.update(classRef, { visibility: newVisibility });
            
            // propagate visibility change to all files within this class (Requirement #1)
            const filesQuery = query(collection(db, 'files'), where('classId', '==', classId));
            const fileSnaps = await getDocs(filesQuery);
            fileSnaps.docs.forEach(fileDoc => {
                batch.update(doc(db, 'files', fileDoc.id), { visibility: newVisibility });
            });

            // Commit the entire batch as one single network request
            await batch.commit();
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