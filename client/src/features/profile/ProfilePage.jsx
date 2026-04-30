import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, deleteDoc, getDocs, setDoc, addDoc, serverTimestamp, startAfter } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import ClassCard from '../classes/ClassCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';

const ProfilePage = () => {
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

	const effectiveUserId = userId || user?.uid;
	const isOwner = !userId || userId === user?.uid;

	// 0. Fetch User Profile Data
	useEffect(() => {
		if (!effectiveUserId) return;
		const userRef = doc(db, 'users', effectiveUserId);
		const unsubscribe = onSnapshot(userRef, (docSnap) => {
			if (docSnap.exists()) {
				setProfileData(docSnap.data());
			}
		});
		return () => unsubscribe();
	}, [effectiveUserId]);

	// 1. Fetch User's Classes
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

	// 2. Fetch User's Recent Uploads (limited to 10 with pagination)
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

			// Save the anchor for the next page
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

	const handleUpdateClassVisibility = async (classId, newVisibility) => {
		try {
			const classRef = doc(db, 'classes', classId);
			await updateDoc(classRef, { visibility: newVisibility });
		} catch (error) {
			console.error("Error updating visibility:", error);
		}
	};

	const handleProfileVisibilityChange = async (newVisibility) => {
		try {
			const userRef = doc(db, 'users', user.uid);
			await setDoc(userRef, { visibility: newVisibility }, { merge: true });
		} catch (error) {
			console.error("Error updating profile visibility:", error);
		}
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

	return (
		<div className="container profile-page">
			<div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h1 style={{ color: 'orange', margin: 0 }}>
					{isOwner ? `Hello, ${user?.displayName || 'User'}!` : `${profileData.displayName || 'User'}'s Profile`}
				</h1>
				{isOwner && (
					<div className="profile-visibility-toggle">
						<label style={{ fontSize: '0.9rem', marginRight: '10px', color: '#666' }}>Profile Visibility:</label>
						<select 
							value={profileData.visibility || 'private'}
							onChange={(e) => handleProfileVisibilityChange(e.target.value)}
							style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: (profileData.visibility === 'public' ? '#e0ffe0' : '#ffe0e0') }}
						>
							<option value="private">Private</option>
							<option value="public">Public</option>
						</select>
					</div>
				)}
			</div>
			
			<section style={{ marginTop: '40px' }}>
				<h2>{isOwner ? 'Your Recent Files & Videos' : 'Recent Files & Videos'}</h2>
				{recentFiles.length > 0 ? (
					<>
						<ul className="file-list">
							{recentFiles.map(file => (
								<li key={file.id} className="file-item">
									<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
										{file.thumbnailUrl ? (
											<img src={file.thumbnailUrl} alt="thumb" style={{ width: '60px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
										) : (
											<div className="thumbnail-placeholder" style={{ width: '60px', height: '35px' }}>DOC</div>
										)}
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<a href={file.url} target="_blank" rel="noreferrer" className="file-link">{file.name}</a>
											<span style={{ fontSize: '0.7rem', color: '#777' }}>
												{file.ownerName || 'Anonymous'} in {file.className || 'General'}
											</span>
										</div>
									</div>
								</li>
							))}
						</ul>
						<div className="pagination-controls" style={{ marginTop: '20px' }}>
							<button 
								className="pagination-btn" 
								onClick={() => setPage(p => Math.max(1, p - 1))} 
								disabled={page === 1}
							>
								Previous
							</button>
							<span className="page-indicator">Page {page}</span>
							<button 
								className="pagination-btn" 
								onClick={() => setPage(p => p + 1)} 
								disabled={!hasNext}
							>
								Next
							</button>
						</div>
					</>
				) : (
					<p className="status">{isOwner ? "You haven't uploaded anything yet." : "No public uploads found."}</p>
				)}
			</section>

			<section style={{ marginTop: '40px' }}>
				<div className="classes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2>{isOwner ? 'Your Classes' : 'Classes'}</h2>
					{isOwner && (
						<button className="create-class-btn" onClick={handleCreateClass}>+ Create Class</button>
					)}
				</div>
				{classes.length > 0 ? (
					<div className="classes-horizontal-scroll">
						{classes.map((item) => (
							<ClassCard 
								key={item.id} 
								classData={item} 
								onEdit={isOwner ? handleEditClass : null}
								onDelete={isOwner ? (data) => setConfirmDelete(data) : null}
								onVisibilityChange={isOwner ? handleUpdateClassVisibility : null}
								isOwner={isOwner}
							/>
						))}
					</div>
				) : (
					<p className="status">{isOwner ? "You haven't created any classes yet." : "No public classes found."}</p>
				)}
			</section>

			{isOwner && (
				<>
					<InputModal 
						isOpen={inputModal.isOpen}
						title={inputModal.mode === 'create' ? "Create New Class" : "Edit Class Name"}
						placeholder="Enter class name"
						initialValue={inputModal.data?.name || ""}
						onConfirm={handleModalSubmit}
						onCancel={() => setInputModal({ ...inputModal, isOpen: false, data: null })}
						confirmText={inputModal.mode === 'create' ? "Create" : "Save Changes"}
					/>

					<ConfirmationModal 
						isOpen={!!confirmDelete}
						title="Delete Class?"
						message={<>Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This will permanently delete the class and all files within it.</>}
						confirmText={isDeleting ? 'Deleting...' : 'Delete Everything'}
						isLoading={isDeleting}
						onConfirm={() => handleDeleteClass(confirmDelete)}
						onCancel={() => setConfirmDelete(null)}
					/>
				</>
			)}
		</div>
	);
};

export default ProfilePage;