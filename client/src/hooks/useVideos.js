import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, startAfter } from "firebase/firestore";
import { db } from "../lib/firebase"; // Import db from firebase.js

export function useVideos() {
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [hasNext, setHasNext] = useState(false);
	const [lastDocs, setLastDocs] = useState([]); // Store the last doc snapshot of each page for "Next" navigation
	const pageSize = 5;

	useEffect(() => {
		setLoading(true);
		// To get page N, we startAfter the last doc of page N-1
		const cursor = page > 1 ? lastDocs[page - 2] : null;

		// Create a query to get recent files from Firestore
		const filesQuery = cursor 
			? query(collection(db, "files"), orderBy("createdAt", "desc"), startAfter(cursor), limit(pageSize + 1))
			: query(collection(db, "files"), orderBy("createdAt", "desc"), limit(pageSize + 1));

		const unsubscribe = onSnapshot(filesQuery, 
			(snapshot) => {
				const hasMore = snapshot.docs.length > pageSize;
				setHasNext(hasMore);

				// Only display the current page's items
				const visibleDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

				const fetchedFiles = visibleDocs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));
				setVideos(fetchedFiles);
				
				// Update our cursor history with the last VISIBLE document
				if (visibleDocs.length > 0) {
					setLastDocs(prev => {
						const next = [...prev];
						next[page - 1] = visibleDocs[visibleDocs.length - 1];
						return next;
					});
				}

				setLoading(false);
			}, 
			(err) => {
				console.error("Error fetching recent files from Firestore:", err);
				setError(err.message);
				setLoading(false);
			}
		);

		return () => unsubscribe(); // Cleanup the listener
	}, [page]);

	const nextPage = () => setPage(p => p + 1);
	const prevPage = () => setPage(p => Math.max(1, p - 1));

	return { videos, loading, error, nextPage, prevPage, page, hasNext };
}