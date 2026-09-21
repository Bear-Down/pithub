import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export const useFavoritesPage = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [favoriteClasses, setFavoriteClasses] = useState([]);
	const [favoriteProfiles, setFavoriteProfiles] = useState([]);
	const [favoriteUploads, setFavoriteUploads] = useState([]);
	const [fileCounts, setFileCounts] = useState({});

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}

		const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
		
		const unsubscribe = onSnapshot(q, async (snapshot) => {
			try {
				setLoading(true);
				const favorites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
				
				const classIds = favorites.filter(f => f.entityType === 'class').map(f => f.entityId);
				const profileIds = favorites.filter(f => f.entityType === 'profile').map(f => f.entityId);
				const uploadIds = favorites.filter(f => f.entityType === 'upload').map(f => f.entityId);

				// Fetch Classes
				const fetchedClasses = [];
				const counts = {};
				for (const id of classIds) {
					try {
						const docSnap = await getDoc(doc(db, 'classes', id));
						if (docSnap.exists()) {
							fetchedClasses.push({ id: docSnap.id, ...docSnap.data() });
							// Fetch file count for this class
							try {
								const fileQuery = query(collection(db, 'files'), where('classId', '==', id));
								const fileDocs = await getDocs(fileQuery);
								counts[id] = fileDocs.size;
							} catch (e) {
								counts[id] = 0;
							}
						}
					} catch (e) {
						console.error(`Failed to fetch class ${id}:`, e);
					}
				}

				// Fetch Profiles
				const fetchedProfiles = [];
				for (const id of profileIds) {
					try {
						const docSnap = await getDoc(doc(db, 'users', id));
						if (docSnap.exists()) {
							fetchedProfiles.push({ id: docSnap.id, ...docSnap.data() });
						}
					} catch (e) {
						console.error(`Failed to fetch profile ${id}:`, e);
					}
				}

				// Fetch Uploads
				const fetchedUploads = [];
				for (const id of uploadIds) {
					try {
						const docSnap = await getDoc(doc(db, 'files', id));
						if (docSnap.exists()) {
							fetchedUploads.push({ id: docSnap.id, ...docSnap.data() });
						}
					} catch (e) {
						console.error(`Failed to fetch upload ${id}:`, e);
					}
				}

				setFavoriteClasses(fetchedClasses);
				setFavoriteProfiles(fetchedProfiles);
				setFavoriteUploads(fetchedUploads);
				setFileCounts(counts);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching favorites:', err);
				setError('Failed to load favorites.');
				setLoading(false);
			}
		}, (error) => {
			console.error('onSnapshot error:', error);
			setError('Failed to load favorites.');
			setLoading(false);
		});

		return () => unsubscribe();
	}, [user]);

	return { loading, error, favoriteClasses, favoriteProfiles, favoriteUploads, fileCounts };
};
