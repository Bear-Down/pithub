import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
 
// Usage: const { isFavorited, toggleFavorite, loading } = useFavorite('class', classId);
export const useFavorite = (entityType, entityId) => {
	const { user } = useAuth();
	const [isFavorited, setIsFavorited] = useState(false);
	const [loading, setLoading] = useState(true);
 
	const favoriteId = user && entityId ? `${user.uid}_${entityType}_${entityId}` : null;
 
	useEffect(() => {
		if (!favoriteId) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const favRef = doc(db, 'favorites', favoriteId);
		const unsubscribe = onSnapshot(favRef, (snap) => {
		    setIsFavorited(snap.exists());
			setLoading(false);
		}, (err) => {
			console.error('Favorite read failed:', err);
			setLoading(false);
		});
		return () => unsubscribe();
	}, [favoriteId]);
 
	const toggleFavorite = async () => {
		if (!user || !entityId) return;
		const favRef = doc(db, 'favorites', favoriteId);
		try {
			if (isFavorited) {
				await deleteDoc(favRef);
			} else {
				await setDoc(favRef, {
					userId: user.uid,
					entityType,
					entityId,
					createdAt: serverTimestamp(),
				});
			}
		} catch (err) {
			console.error('Failed to toggle favorite:', err);
		}
	};
 
	return { isFavorited, toggleFavorite, loading };
};