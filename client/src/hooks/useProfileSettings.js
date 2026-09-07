import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Hook to manage User Profile field visibility (PROFILE-002).
 */
export const useProfileSettings = (userId) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    const [isFieldLoading, setIsFieldLoading] = useState(false);

    /**
     * Toggles global profile visibility.
     */
    const toggleGlobalVisibility = async (currentVisibility) => {
    setIsGlobalLoading(true);
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

    try {
        // Step 1: Update user profile first
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { visibility: newVisibility });

        // Step 2: If setting to private, update classes and files safely in chunks
        // Requirement: If profile is private, all classes MUST be private
            if (newVisibility === 'private') {
                const classesQuery = query(collection(db, 'classes'), where('ownerId', '==', userId));
                const classSnaps = await getDocs(classesQuery);
                
                let count = 0;
                let batch = writeBatch(db);
                const commitBatch = async () => {
                    if (count > 0) {
                        await batch.commit();
                        batch = writeBatch(db);
                        count = 0;
                    }
                };

                for (const classDoc of classSnaps.docs) {
                    batch.update(classDoc.ref, { visibility: 'private' });
                    count++;
                    if (count >= 300) await commitBatch();

                    // Only update files owned by this user
                    const filesQuery = query(
                        collection(db, 'files'), 
                        where('classId', '==', classDoc.id),
                        where('ownerId', '==', userId)
                    );
                    const fileSnaps = await getDocs(filesQuery);
                    
                    for (const fileDoc of fileSnaps.docs) {
                        batch.update(fileDoc.ref, { visibility: 'private' });
                        count++;
                        if (count >= 300) await commitBatch();
                    }
                }
                await commitBatch();
            }
    } catch (error) {
        console.error("Profile privacy update failed:", error);
    } finally {
        setIsGlobalLoading(false);
    }
};

    /**
     * Updates the visibility of a profile field.
     * @param {string} fieldName - e.g., 'showMajor', 'showMinor'
     * @param {boolean} isVisible - New visibility state
     */
    const setProfileFieldVisibility = async (fieldName, isVisible) => {
        setIsFieldLoading(true);
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                [`profileConfig.${fieldName}`]: isVisible
            });
        } catch (error) {
            console.error("Error updating profile settings:", error);
            throw error;
        } finally {
            setIsFieldLoading(false);
        }
    };

    return {
        toggleGlobalVisibility,
        setProfileFieldVisibility,
        isGlobalLoading,
        isFieldLoading
    };
};