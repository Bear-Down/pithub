import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../lib/firebase';

const db = getFirestore(app);

const toDate = (value) => {
	if (!value) return null;
	if (typeof value?.toDate === 'function') return value.toDate();
	if (value instanceof Date) return value;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const getFileType = (file = {}) => {
	const mime = (file.type || '').toLowerCase();
	const name = (file.name || '').toLowerCase();

	if (mime.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
	if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'Word';
	if (mime.includes('presentation') || mime.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'Presentation';
	if (mime.includes('spreadsheet') || mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'Spreadsheet';
	if (mime.startsWith('video/') || ['.mp4', '.mov', '.webm', '.avi'].some((ext) => name.endsWith(ext))) return 'Video';
	if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) => name.endsWith(ext))) return 'Image';
	return 'Other';
};

const sortDescending = (items) => [...items].sort((a, b) => b.value - a.value);

export const useAdminAnalytics = () => {
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadAnalytics = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			const [filesSnap, reportsSnap] = await Promise.all([
				getDocs(collection(db, 'files')),
				getDocs(collection(db, 'reports')),
			]);

			const files = filesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
			const reports = reportsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

			const totalFiles = files.length;
			const totalViews = files.reduce((sum, file) => sum + Number(file.views || 0), 0);
			const publicFiles = files.filter((file) => file.visibility === 'public').length;
			const privateFiles = files.filter((file) => file.visibility !== 'public').length;

			const uploadMap = new Map();
			files.forEach((file) => {
				const date = toDate(file.createdAt);
				if (!date) return;
				const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				uploadMap.set(key, (uploadMap.get(key) || 0) + 1);
			});

			const uploadsByDay = [...uploadMap.entries()]
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([date, value]) => ({
					date,
					label: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
					value,
				}));

			const typeMap = new Map();
			const classMap = new Map();
			files.forEach((file) => {
				const type = getFileType(file);
				typeMap.set(type, (typeMap.get(type) || 0) + 1);
				const className = file.className || 'Unassigned';
				classMap.set(className, (classMap.get(className) || 0) + 1);
			});

			const documentsByType = sortDescending([...typeMap.entries()].map(([label, value]) => ({ label, value })));
			const documentsByClass = sortDescending([...classMap.entries()].map(([label, value]) => ({ label, value })));
			const visibility = [
				{ label: 'Public', value: publicFiles },
				{ label: 'Private', value: privateFiles },
			].filter((item) => item.value > 0);

			const mostViewed = [...files]
				.sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
				.slice(0, 10)
				.map((file) => ({ id: file.id, name: file.name || file.id, className: file.className || 'Unassigned', views: Number(file.views || 0) }));

			const totalReports = reports.reduce((sum, report) => sum + Number(report.reportCount || 0), 0);
			const pendingReports = reports.filter((report) => report.status === 'pending').length;
			const resolvedReports = reports.filter((report) => report.status === 'resolved').length;
			const reportedDocuments = reports.length;
			const reportRate = totalFiles ? (reportedDocuments / totalFiles) * 100 : 0;

			const reportReasonsMap = new Map();
			reports.forEach((report) => {
				Object.values(report.reporters || {}).forEach((reporter) => {
					const reason = reporter?.reason || 'Unspecified';
					reportReasonsMap.set(reason, (reportReasonsMap.get(reason) || 0) + 1);
				});
			});

			const reportsByReason = sortDescending([...reportReasonsMap.entries()].map(([label, value]) => ({ label, value })));
			const reportsByStatus = [
				{ label: 'Pending', value: pendingReports },
				{ label: 'Resolved', value: resolvedReports },
			].filter((item) => item.value > 0);
			const mostReported = [...reports]
				.sort((a, b) => Number(b.reportCount || 0) - Number(a.reportCount || 0))
				.slice(0, 10)
				.map((report) => ({ id: report.fileId || report.id, reports: Number(report.reportCount || 0) }));

			setAnalytics({
				totalFiles,
				totalViews,
				averageViews: totalFiles ? totalViews / totalFiles : 0,
				publicFiles,
				privateFiles,
				uploadsByDay,
				documentsByType,
				documentsByClass,
				visibility,
				mostViewed,
				totalReports,
				pendingReports,
				resolvedReports,
				reportedDocuments,
				reportRate,
				reportsByStatus,
				reportsByReason,
				mostReported,
			});
		} catch (err) {
			console.error('Admin analytics error:', err);
			setError(err.message || 'Unable to load analytics.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadAnalytics();
	}, [loadAnalytics]);

	return { analytics, loading, error, refreshAnalytics: loadAnalytics };
};
