import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, onSnapshot, updateDoc, getCountFromServer, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { app } from '../../../lib/firebase'; // Assuming firebase.js exports 'app'
import { adminService } from '../services/adminService'; // Import adminService for actions

/**
 * @file useAdminData.js
 * @description A custom hook for fetching and managing data required by the Admin Dashboard.
 *              It provides system statistics, recent uploads, and flagged content.
 *              It also includes a mechanism to refresh cached statistics.
 */

export const useAdminData = () => {
	const db = getFirestore(app);
	const storage = getStorage(app);

	const [totalUsers, setTotalUsers] = useState(0);
	const [totalClasses, setTotalClasses] = useState(0);
	const [totalFiles, setTotalFiles] = useState(0);
	const [recentUploads, setRecentUploads] = useState([]);
	const [flaggedContent, setFlaggedContent] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Function to fetch and update cached statistics
	const fetchAndCacheStats = useCallback(async () => {
		try {
		// Get counts from server
		const usersCount = await getCountFromServer(collection(db, 'users'));
		const classesCount = await getCountFromServer(collection(db, 'classes'));
		const filesCount = await getCountFromServer(collection(db, 'files'));

		setTotalUsers(usersCount.data().count);
		setTotalClasses(classesCount.data().count);
		setTotalFiles(filesCount.data().count);

		// Optionally, update a 'system/stats' document in Firestore with these counts
		// This would make subsequent dashboard loads faster if you read from this doc
		// await updateDoc(doc(db, 'system', 'stats'), {
		//   totalUsers: usersCount.data().count,
		//   totalClasses: classesCount.data().count,
		//   totalFiles: filesCount.data().count,
		//   lastUpdated: serverTimestamp(),
		// });

		} catch (err) {
		console.error("Error fetching and caching stats:", err);
		setError("Failed to fetch statistics.");
		}
	}, [db]);

	// Initial fetch for cached stats (or live if 'system/stats' isn't used)
	useEffect(() => {
		fetchAndCacheStats();
	}, [fetchAndCacheStats]);

	useEffect(() => {
		setLoading(true);
		setError(null);

		const unsubscribe = [];

		// Fetch recent uploads (metadata only for private files handled by UI)
		const qRecentUploads = query(collection(db, 'files'), orderBy('createdAt', 'desc'), limit(50));
		unsubscribe.push(onSnapshot(qRecentUploads, (snapshot) => {
		const uploads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
		setRecentUploads(uploads);
		}, (err) => {
		console.error("Error fetching recent uploads:", err);
		setError("Failed to load recent uploads.");
		}));

		// Fetch flagged content (pending reports)
		const qFlaggedContent = query(collection(db, 'reports'), adminService.whereReportStatus('pending'), orderBy('latestReportedAt', 'desc'));
		unsubscribe.push(onSnapshot(qFlaggedContent, async (snapshot) => {
		const reports = snapshot.docs.map(doc => ({ fileId: doc.id, ...doc.data() }));
		// For each report, fetch the file owner's name for display
		const reportsWithOwners = await Promise.all(reports.map(async (report) => {
			const fileDoc = await getDoc(doc(db, 'files', report.fileId));
			return {
			...report,
			ownerName: fileDoc.exists() ? fileDoc.data().ownerName : 'Unknown User',
			fileName: fileDoc.exists() ? fileDoc.data().name : 'Unknown File',
			};
		}));
		setFlaggedContent(reportsWithOwners);
		}, (err) => {
		console.error("Error fetching flagged content:", err);
		setError("Failed to load flagged content.");
		}));

		setLoading(false);

		return () => unsubscribe.forEach(unsub => unsub());
	}, [db, storage]);

	const refreshStats = () => {
		setLoading(true);
		fetchAndCacheStats().finally(() => setLoading(false));
	};

	return { totalUsers, totalClasses, totalFiles, recentUploads, flaggedContent, loading, error, refreshStats };
};