import { useMemo } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';

const db = getFirestore(app);

export const useAdminLogs = () => {
	const baseQueryFactory = useMemo(
		() => () => query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc')),
		[],
	);

	return usePaginatedQuery(baseQueryFactory, []);
};
