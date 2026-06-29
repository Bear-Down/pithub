import { useMemo } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { adminService } from '../services/adminService';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';

const db = getFirestore(app);

export const useAdminReports = (status = 'pending') => {
	const baseQueryFactory = useMemo(
		() => () => query(
			collection(db, 'reports'),
			adminService.whereReportStatus(status),
			orderBy('latestReportedAt', 'desc'),
		),
		[status],
	);

	return usePaginatedQuery(baseQueryFactory, [status]);
};
