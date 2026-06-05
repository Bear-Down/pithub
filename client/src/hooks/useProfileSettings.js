import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { visibility: newVisibility });

            // Requirement: If profile is private, all classes MUST be private
            if (newVisibility === 'private') {
                const classesQuery = query(collection(db, 'classes'), where('ownerId', '==', userId));
                const classSnaps = await getDocs(classesQuery);
                
                const updatePromises = classSnaps.docs.map(async (classDoc) => {
                    // Update the class itself
                    await updateDoc(classDoc.ref, { visibility: 'private' });
                    // Note: useClassSettings logic propagates to files, but we must do it manually here for batch
                    const filesQuery = query(collection(db, 'files'), where('classId', '==', classDoc.id));
                    const fileSnaps = await getDocs(filesQuery);
                    return Promise.all(fileSnaps.docs.map(f => updateDoc(f.ref, { visibility: 'private' })));
                });
                await Promise.all(updatePromises);
            }
        } catch (error) {
            console.error("Error updating profile visibility:", error);
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