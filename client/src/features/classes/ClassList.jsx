import React, { useState, useEffect } from 'react';
import ClassCard from './ClassCard';
import { useAuth } from '../../context/AuthContext';
import VideoList from '../videos/VideoList';
import '../../styles/style.css';
import { db, storage } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, where, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';

const ClassList = () => {
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
				visibility: 'private' // Default to private
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

	const handleUpdateClassVisibility = async (classId, newVisibility) => {
		try {
			const classRef = doc(db, 'classes', classId);
			await updateDoc(classRef, { visibility: newVisibility });

			// Update visibility for all files in this class to keep search efficient
			const q = query(collection(db, 'files'), where('classId', '==', classId));
			const fileSnaps = await getDocs(q);
			const updatePromises = fileSnaps.docs.map(fileDoc => 
				updateDoc(doc(db, 'files', fileDoc.id), { visibility: newVisibility })
			);
			await Promise.all(updatePromises);
		} catch (error) {
			console.error("Error updating class:", error);
		}
		setInputModal({ ...inputModal, isOpen: false });
	};

	const handleDeleteClass = async (classData) => {
		setIsDeleting(true);
		try {
			// 1. Fetch all files associated with this class
			const q = query(collection(db, 'files'), where('classId', '==', classData.id));
			const querySnapshot = await getDocs(q);
			
			// 2. Delete each file from Storage and Firestore metadata
			const deletePromises = querySnapshot.docs.map(async (fileDoc) => {
				const file = fileDoc.data();
				try {
					const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
					await deleteObject(storageRef);
				} catch (err) {
					console.warn("Storage deletion error (file may already be gone):", err.message);
				}
				await deleteDoc(doc(db, 'files', fileDoc.id));
			});

			await Promise.all(deletePromises);

			// 3. Delete the class itself
			await deleteDoc(doc(db, 'classes', classData.id));
			console.log("Class and all associated content deleted.");
		} catch (error) {
			console.error("Error deleting class:", error);
			alert("Failed to delete class and its content.");
		} finally {
			setIsDeleting(false);
			setConfirmDelete(null);
		}
	};

	return (
		<div className="home-wrapper">
			{/* Top Section: Recent Files/Videos */}
			<div className="container">
				<h1>Recent Uploads</h1>
				<VideoList />
			</div>

			{/* Bottom Section: Horizontal Classes Grid */}
			<div className="classes-section">
				<div className="classes-header">
				<h2>Your Classes</h2>
				<button className="create-class-btn" onClick={handleCreateClass}>+ Create Class</button>
				</div>
				{classes.length > 0 ? (
				<div className="classes-horizontal-scroll">
					{classes.map((item) => (
					<ClassCard 
						key={item.id} 
						classData={item} 
						onEdit={handleEditClass}
						onDelete={(data) => setConfirmDelete(data)}
						onVisibilityChange={handleUpdateClassVisibility}
					/>
					))}
				</div>
				) : (
				<div className="status">
					<p>No classes created yet. Click the button above to get started!</p>
				</div>
				)}
			</div>

			<InputModal 
				isOpen={inputModal.isOpen}
				title={inputModal.mode === 'create' ? "Create New Class" : "Edit Class Name"}
				placeholder="Enter class name"
				initialValue={inputModal.data?.name || ""}
				onConfirm={handleModalSubmit}
				onCancel={() => setInputModal({ ...inputModal, isOpen: false })}
				confirmText={inputModal.mode === 'create' ? "Create" : "Save Changes"}
			/>

			<ConfirmationModal 
				isOpen={!!confirmDelete}
				title="Delete Class?"
				message={
					<>
						Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? 
						<br /><br />
						<span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Warning:</span> This will permanently delete the class and <strong>all uploaded videos and documents</strong> within it.
					</>
				}
				confirmText={isDeleting ? 'Deleting...' : 'Delete Everything'}
				isLoading={isDeleting}
				onConfirm={() => handleDeleteClass(confirmDelete)}
				onCancel={() => setConfirmDelete(null)}
			/>
		</div>
	);
};

export default ClassList;