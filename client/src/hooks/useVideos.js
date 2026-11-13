import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, startAfter, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const SORT_OPTIONS = {
	newest: ['createdAt', 'desc'],
	oldest: ['createdAt', 'asc'],
	'title-asc': ['name', 'asc'],
	'title-desc': ['name', 'desc'],
};

export function useVideos({ userOnly = false } = {}) {
	const { user } = useAuth();
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [hasNext, setHasNext] = useState(false);
	const [lastDocs, setLastDocs] = useState([]); // Store the last doc snapshot of each page for "Next" navigation
	const pageSize = 5;
		const [sortBy, setSortBy] = useState('newest');

	useEffect(() => {
		setLoading(true);
		// To get page N, we startAfter the last doc of page N-1
		const cursor = page > 1 ? lastDocs[page - 2] : null;

		let constraints = [];
		if (userOnly) {
			if (!user?.uid) {
				setVideos([]);
				setLoading(false);
				return;
			}
			constraints.push(where("ownerId", "==", user.uid));
		} else {
			constraints.push(where("visibility", "==", "public"));
		}
		const [sortField, sortDirection] = SORT_OPTIONS[sortBy] || SORT_OPTIONS.newest;
		constraints.push(orderBy(sortField, sortDirection));
		if (cursor) constraints.push(startAfter(cursor));
		constraints.push(limit(pageSize + 1));

		const filesQuery = query(collection(db, "files"), ...constraints);

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
	}, [page, userOnly, user?.uid, sortBy]);

	const nextPage = () => setPage(p => p + 1);
	const prevPage = () => setPage(p => Math.max(1, p - 1));

	const changeSort = (newSort) => {
		setSortBy(newSort);
		setPage(1);
		setLastDocs([]);
	};

	return { videos, loading, error, nextPage, prevPage, page, hasNext, sortBy, changeSort };
}