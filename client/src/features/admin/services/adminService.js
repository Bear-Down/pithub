import {
	getFirestore,
	doc,
	getDoc,
	deleteDoc,
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	addDoc,
	serverTimestamp,
	increment,
	setDoc,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { app } from '../../../lib/firebase';

const db = getFirestore(app);
const storage = getStorage(app);

const logAdminAction = async (action, targetId, targetName, adminName, adminEmail, reason) => {
	await addDoc(collection(db, 'admin_logs'), {
		action,
		targetId,
		targetName,
		performedBy: adminName,
		adminEmail,
		reason,
		timestamp: serverTimestamp(),
	});
};

const deleteFileFromStorage = async (fileData) => {
	try {
		const storageRef = fileData.storagePath
			? ref(storage, fileData.storagePath)
			: ref(storage, fileData.url);
		await deleteObject(storageRef);
		if (fileData.thumbnailPath) {
			await deleteObject(ref(storage, fileData.thumbnailPath));
		}
	} catch (err) {
		console.warn('Storage deletion warning:', err.message);
	}
};

export const adminService = {
	deleteFile: async (fileId, adminName, adminEmail, reason) => {
		if (!fileId || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for file deletion.');
		}

		const fileRef = doc(db, 'files', fileId);
		const fileSnap = await getDoc(fileRef);
		if (!fileSnap.exists()) throw new Error('File not found.');

		const fileData = fileSnap.data();
		await deleteFileFromStorage(fileData);
		await deleteDoc(fileRef);

		const reportRef = doc(db, 'reports', fileId);
		const reportSnap = await getDoc(reportRef);
		if (reportSnap.exists()) {
			await updateDoc(reportRef, {
				status: 'resolved',
				resolution: 'purged',
				resolvedBy: { adminName, adminEmail, timestamp: serverTimestamp() },
				reason,
			});
		}

		await logAdminAction('DELETE_FILE', fileId, fileData.name, adminName, adminEmail, reason);
	},

	resolveReport: async (fileId, adminName, adminEmail, reason) => {
		if (!fileId || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for report resolution.');
		}

		const reportRef = doc(db, 'reports', fileId);
		await updateDoc(reportRef, {
			status: 'resolved',
			resolution: 'dismissed',
			resolvedBy: { adminName, adminEmail, timestamp: serverTimestamp() },
			reason,
			resolvedAt: serverTimestamp(),
		});

		await logAdminAction('RESOLVE_REPORT', fileId, `Report for file ${fileId}`, adminName, adminEmail, reason);
	},

	suspendUser: async (userId, adminName, adminEmail, reason) => {
		if (!userId || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for suspension.');
		}

		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) throw new Error('User not found.');

		const userData = userSnap.data();
		await updateDoc(userRef, {
			isSuspended: true,
			suspendedAt: serverTimestamp(),
			suspensionReason: reason,
		});

		await logAdminAction(
			'SUSPEND_USER',
			userId,
			userData.displayName || userData.email || userId,
			adminName,
			adminEmail,
			reason,
		);
	},

	unsuspendUser: async (userId, adminName, adminEmail, reason) => {
		if (!userId || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for unsuspension.');
		}

		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) throw new Error('User not found.');

		const userData = userSnap.data();
		await updateDoc(userRef, {
			isSuspended: false,
			suspendedAt: null,
			suspensionReason: null,
		});

		await logAdminAction(
			'UNSUSPEND_USER',
			userId,
			userData.displayName || userData.email || userId,
			adminName,
			adminEmail,
			reason,
		);
	},

	updateUserRole: async (userId, newRole, adminName, adminEmail, reason) => {
		if (!userId || !newRole || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for role update.');
		}
		if (!['user', 'admin'].includes(newRole)) {
			throw new Error('Invalid role. Must be "user" or "admin".');
		}

		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) throw new Error('User not found.');

		const userData = userSnap.data();
		await updateDoc(userRef, { role: newRole });

		await logAdminAction(
			'UPDATE_USER_ROLE',
			userId,
			`${userData.displayName || userData.email} → ${newRole}`,
			adminName,
			adminEmail,
			reason,
		);
	},

	deleteClass: async (classId, adminName, adminEmail, reason) => {
		if (!classId || !adminName || !adminEmail || !reason) {
			throw new Error('Missing required parameters for class deletion.');
		}

		const classRef = doc(db, 'classes', classId);
		const classSnap = await getDoc(classRef);
		if (!classSnap.exists()) throw new Error('Class not found.');

		const classData = classSnap.data();
		const filesQuery = query(collection(db, 'files'), where('classId', '==', classId));
		const filesSnap = await getDocs(filesQuery);

		for (const fileDoc of filesSnap.docs) {
			const fileData = fileDoc.data();
			await deleteFileFromStorage(fileData);
			await deleteDoc(doc(db, 'files', fileDoc.id));

			const reportRef = doc(db, 'reports', fileDoc.id);
			const reportSnap = await getDoc(reportRef);
			if (reportSnap.exists()) {
				await deleteDoc(reportRef);
			}
		}

		await deleteDoc(classRef);
		await logAdminAction(
			'DELETE_CLASS',
			classId,
			classData.name,
			adminName,
			adminEmail,
			reason,
		);

		return filesSnap.size;
	},

	whereReportStatus: (status) => where('status', '==', status),
};

export const reportService = {
	submitReport: async (fileId, userId, userEmail, reason, fileVisibility) => {
		if (!fileId || !userId || !userEmail || !reason) {
			throw new Error('Missing required parameters for report.');
		}

		const reportRef = doc(db, 'reports', fileId);
		const reportSnap = await getDoc(reportRef);

		if (reportSnap.exists()) {
			const data = reportSnap.data();
			if (data.reporters?.[userId]) {
				throw new Error('You have already reported this content.');
			}
			await updateDoc(reportRef, {
				reportCount: increment(1),
				[`reporters.${userId}`]: {
					timestamp: serverTimestamp(),
					email: userEmail,
					reason,
				},
				latestReportedAt: serverTimestamp(),
				status: 'pending',
			});
		} else {
			await setDoc(reportRef, {
				fileId,
				reportCount: 1,
				status: 'pending',
				reporters: {
					[userId]: {
						timestamp: serverTimestamp(),
						email: userEmail,
						reason,
					},
				},
				latestReportedAt: serverTimestamp(),
				fileVisibility: fileVisibility || 'public',
			});
		}
	},
};
