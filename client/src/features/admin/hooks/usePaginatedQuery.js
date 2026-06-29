import { useState, useEffect, useRef } from 'react';
import { getDocs, limit, startAfter, query } from 'firebase/firestore';

const PAGE_SIZE = 20;

/**
 * Client-side Firestore cursor pagination helper.
 */
export const usePaginatedQuery = (baseQueryFactory, deps = []) => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [hasNext, setHasNext] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const cursorsRef = useRef([null]);
	const depsKey = JSON.stringify(deps);

	useEffect(() => {
		cursorsRef.current = [null];
		setPage(1);
	}, [depsKey, baseQueryFactory]);

	useEffect(() => {
		let cancelled = false;

		const fetchPage = async () => {
			setLoading(true);
			setError(null);
			try {
				const baseQuery = baseQueryFactory();
				const cursor = cursorsRef.current[page - 1] ?? null;
				const q = cursor
					? query(baseQuery, startAfter(cursor), limit(PAGE_SIZE + 1))
					: query(baseQuery, limit(PAGE_SIZE + 1));

				const snapshot = await getDocs(q);
				if (cancelled) return;

				const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
				setHasNext(docs.length > PAGE_SIZE);
				setItems(docs.slice(0, PAGE_SIZE));

				if (snapshot.docs.length > 0) {
					const lastVisible = snapshot.docs[Math.min(PAGE_SIZE - 1, snapshot.docs.length - 1)];
					cursorsRef.current[page] = lastVisible;
				}
			} catch (err) {
				if (!cancelled) {
					console.error('Pagination fetch error:', err);
					setError(err.message || 'Failed to load data.');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchPage();
		return () => { cancelled = true; };
	}, [page, refreshKey, depsKey, baseQueryFactory]);

	const nextPage = () => {
		if (hasNext) setPage((p) => p + 1);
	};

	const prevPage = () => {
		if (page > 1) setPage((p) => p - 1);
	};

	const refresh = () => {
		cursorsRef.current = [null];
		setPage(1);
		setRefreshKey((k) => k + 1);
	};

	return { items, loading, error, page, hasNext, nextPage, prevPage, refresh, pageSize: PAGE_SIZE };
};
