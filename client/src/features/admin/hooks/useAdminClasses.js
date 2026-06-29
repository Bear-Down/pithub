import { useMemo } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';

const db = getFirestore(app);

export const useAdminClasses = () => {
	const baseQueryFactory = useMemo(
		() => () => query(collection(db, 'classes'), orderBy('createdAt', 'desc')),
		[],
	);

	return usePaginatedQuery(baseQueryFactory, []);
};
