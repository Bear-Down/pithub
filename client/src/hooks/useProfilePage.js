import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    limit, 
    doc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    serverTimestamp, 
    startAfter 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useProfileSettings } from './useProfileSettings';

export const useProfilePage = () => {
	const { userId } = useParams();
	const { user } = useAuth();
	const [profileData, setProfileData] = useState({ visibility: 'private' });
	const [classes, setClasses] = useState([]);
	const [recentFiles, setRecentFiles] = useState([]);
	const [page, setPage] = useState(1);
	const [hasNext, setHasNext] = useState(false);
	const [pageAnchors, setPageAnchors] = useState([]); // Stores the last doc snapshot of each page
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [inputModal, setInputModal] = useState({ isOpen: false, mode: 'create', data: null });
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileEditData, setProfileEditData] = useState({
		major: '',
		minor: '',
		gradSemester: '',
		bio: '',
		website: ''
	});

	const effectiveUserId = userId || user?.uid;
	const isOwner = !userId || userId === user?.uid;

	// Modular hook for field visibility (PROFILE-002)
	const { 
		toggleGlobalVisibility, 
		setProfileFieldVisibility, 
		isGlobalLoading, 
		isFieldLoading 
	} = useProfileSettings(user?.uid);

	// Fetch User Profile Data
	useEffect(() => {
		if (!effectiveUserId) return;
		const userRef = doc(db, 'users', effectiveUserId);
		const unsubscribe = onSnapshot(userRef, (docSnap) => {
			if (docSnap.exists()) {
				const data = docSnap.data();
				setProfileData(data);
				setProfileEditData({
					major: data.major || '',
					minor: data.minor || '',
					gradSemester: data.gradSemester || '',
					bio: data.bio || '',
					website: data.website || ''
				});
			}
		});
		return () => unsubscribe();
	}, [effectiveUserId]);

	// Fetch User's Classes
	useEffect(() => {
		if (!effectiveUserId) return;

		let q = query(
			collection(db, 'classes'), 
			where('ownerId', '==', effectiveUserId)
		);

		if (!isOwner) {
			q = query(q, where('visibility', '==', 'public'));
		}

		const unsubscribe = onSnapshot(q, (snapshot) => {
			setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
		});

		return () => unsubscribe();
	}, [effectiveUserId, isOwner]);

	// Reset pagination when switching profiles
	useEffect(() => {
		setPage(1);
		setPageAnchors([]);
	}, [effectiveUserId]);

	// Fetch User's Recent Uploads (limited to 10 with pagination)
	useEffect(() => {
		if (!effectiveUserId) return;
		const pageSize = 10;

		let q = query(
			collection(db, 'files'),
			where('ownerId', '==', effectiveUserId),
			orderBy('createdAt', 'desc'),
			limit(pageSize + 1)
		);

		if (!isOwner) {
			q = query(q, where('visibility', '==', 'public'));
		}

		// Apply pagination anchor
		if (page > 1 && pageAnchors[page - 2]) {
			q = query(q, startAfter(pageAnchors[page - 2]));
		}

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const docs = snapshot.docs;
			const hasMore = docs.length > pageSize;
			setHasNext(hasMore);

			const items = hasMore ? docs.slice(0, pageSize) : docs;
			setRecentFiles(items.map(doc => ({ id: doc.id, ...doc.data() })));

			if (items.length > 0) {
				setPageAnchors(prev => {
					const next = [...prev];
					next[page - 1] = docs[items.length - 1];
					return next;
				});
			}
		}, (err) => {
			console.error("Profile recent files error:", err);
		});

		return () => unsubscribe();
	}, [effectiveUserId, isOwner, page]);

	const handleCreateClass = () => setInputModal({ isOpen: true, mode: 'create', data: null });
	const handleEditClass = (classData) => setInputModal({ isOpen: true, mode: 'edit', data: classData });

	const handleModalSubmit = async (name) => {
		try {
			if (inputModal.mode === 'create') {
				await addDoc(collection(db, 'classes'), {
					name,
					ownerId: user.uid,
					ownerName: user.displayName || 'Anonymous',
					createdAt: serverTimestamp(),
					visibility: 'private'
				});
			} else if (inputModal.mode === 'edit' && inputModal.data) {
				const classRef = doc(db, 'classes', inputModal.data.id);
				await updateDoc(classRef, { name });
			}
		} catch (error) {
			console.error(`Error ${inputModal.mode === 'create' ? 'creating' : 'updating'} class:`, error);
		}
		setInputModal({ ...inputModal, isOpen: false, data: null });
	};

	const handleProfileVisibilityChange = async (currentVisibility) => {
		try {
			await toggleGlobalVisibility(currentVisibility);
		} catch (error) {
			console.error("Error updating profile visibility:", error);
		}
	};

	const handleUpdateProfile = async () => {
		try {
			const userRef = doc(db, 'users', user.uid);
			await setDoc(userRef, profileEditData, { merge: true });
			setIsEditingProfile(false);
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	/**
	 * Toggles visibility for specific profile fields.
	 * @param {string} field - The field name (e.g., 'showMajor')
	 */
	const handleToggleFieldVisibility = (field) => {
		if (!profileData) return;
		// Use current state to flip visibility
		const currentConfig = profileData.profileConfig || {};
		const isVisible = currentConfig[field] !== false; // Default to true if undefined
		setProfileFieldVisibility(field, !isVisible);
	};

	const handleDeleteClass = async (classData) => {
		setIsDeleting(true);
		try {
			const q = query(collection(db, 'files'), where('classId', '==', classData.id));
			const querySnapshot = await getDocs(q);
			const deletePromises = querySnapshot.docs.map(async (fileDoc) => {
				const file = fileDoc.data();
				try {
					const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
					await deleteObject(storageRef);
					if (file.thumbnailPath) await deleteObject(ref(storage, file.thumbnailPath));
				} catch (err) {}
				await deleteDoc(doc(db, 'files', fileDoc.id));
			});
			await Promise.all(deletePromises);
			await deleteDoc(doc(db, 'classes', classData.id));
		} catch (error) {
			console.error("Error deleting class:", error);
		} finally {
			setIsDeleting(false);
			setConfirmDelete(null);
		}
	};

	return {
		user,
		profileData,
		classes,
		recentFiles,
		page,
		setPage,
		hasNext,
		confirmDelete,
		setConfirmDelete,
		inputModal,
		setInputModal,
		isDeleting,
		isEditingProfile,
		setIsEditingProfile,
		profileEditData,
		setProfileEditData,
		isOwner,
		handleCreateClass,
		handleEditClass,
		handleModalSubmit,
		handleProfileVisibilityChange,
		handleUpdateProfile,
		handleDeleteClass,
		handleToggleFieldVisibility,
		isGlobalLoading,
		isFieldLoading
	};
};