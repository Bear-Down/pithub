import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { 
    collection, 
    query, 
    onSnapshot, 
    addDoc, 
    where, 
    serverTimestamp, 
    doc, 
    updateDoc, 
    deleteDoc, 
    getDocs 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export const useClassList = () => {
	const { user } = useAuth();
	const [classes, setClasses] = useState([]);
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [inputModal, setInputModal] = useState({ isOpen: false, mode: 'create', data: null });
	const [isDeleting, setIsDeleting] = useState(false);

	// Fetch classes from Firestore
	useEffect(() => {
		if (!user?.uid) return;

		// Filter query so users only see classes where they are the owner
		const q = query(
			collection(db, 'classes'), 
			where('ownerId', '==', user.uid)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedClasses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClasses(fetchedClasses);
		});
		return () => unsubscribe();
	}, [user?.uid]);

	const handleCreateClass = () => {
		setInputModal({ isOpen: true, mode: 'create', data: null });
	};

	const handleEditClass = (classData) => {
		setInputModal({ isOpen: true, mode: 'edit', data: classData });
	};

	const handleModalSubmit = async (name) => {
		if (inputModal.mode === 'create') {
			await addDoc(collection(db, 'classes'), {
				name: name,
				ownerId: user.uid,
				ownerName: user.displayName,
				createdAt: serverTimestamp(),
				visibility: 'private', // Default to private
				displayConfig: {
					showInstructor: true,
					showOffice: true,
					showOfficeHours: true,
					showEmail: true,
					showRoom: true,
					showMeetingTime: true,
					showDescription: true,
					showSyllabus: true
				}
			});
		} else if (inputModal.mode === 'edit' && inputModal.data) {
			try {
				const classRef = doc(db, 'classes', inputModal.data.id);
				await updateDoc(classRef, { name: name });
			} catch (error) {
				console.error("Error updating class:", error);
			}
		}
		setInputModal({ ...inputModal, isOpen: false });
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
				} catch (err) {
					console.warn("Storage deletion error (file may already be gone):", err.message);
				}
				await deleteDoc(doc(db, 'files', fileDoc.id));
			});
			await Promise.all(deletePromises);
			await deleteDoc(doc(db, 'classes', classData.id));
		} catch (error) {
			console.error("Error deleting class:", error);
			alert("Failed to delete class and its content.");
		} finally {
			setIsDeleting(false);
			setConfirmDelete(null);
		}
	};

    const closeInputModal = () => setInputModal({ ...inputModal, isOpen: false });
    const setConfirmDeleteData = (data) => setConfirmDelete(data);
    const cancelDelete = () => setConfirmDelete(null);

	return {
		classes,
		confirmDelete,
		inputModal,
		isDeleting,
		handleCreateClass,
		handleEditClass,
		handleModalSubmit,
		handleDeleteClass,
        closeInputModal,
        setConfirmDeleteData,
        cancelDelete
	};
};