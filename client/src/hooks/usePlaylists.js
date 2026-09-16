import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { 
	collection, 
	query, 
	onSnapshot, 
	addDoc, 
	serverTimestamp, 
	doc, 
	updateDoc, 
	deleteDoc, 
	getDocs,
	where,
	or
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export const usePlaylists = () => {
	const { user } = useAuth();
	const [playlists, setPlaylists] = useState([]);
	const [fileCounts, setFileCounts] = useState({});
	const [viewMode, setViewModeState] = useState(() => {
		return localStorage.getItem('pithub_playlist_view_mode') || 'grid';
	});
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [inputModal, setInputModal] = useState({ isOpen: false, mode: 'create', data: null });
	const [isDeleting, setIsDeleting] = useState(false);

	const setViewMode = (mode) => {
		setViewModeState(mode);
		localStorage.setItem('pithub_playlist_view_mode', mode);
	};

	// Fetch playlists where current user is owner or a member
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, 'playlists'),
			or(
				where('ownerId', '==', user.uid),
				where(`members.${user.uid}.role`, 'in', ['view', 'upload', 'delete'])
			)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const list = snapshot.docs.map(docSnap => {
				const data = docSnap.data();
				return {
					id: docSnap.id,
					...data,
					isOwner: data.ownerId === user.uid
				};
			});
			setPlaylists(list);
		}, (err) => {
			console.error("Error fetching playlists:", err);
		});

		return () => unsubscribe();
	}, [user?.uid]);

	// Fetch file counts for owned playlists
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, 'files'),
			where('ownerId', '==', user.uid)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const counts = {};
			snapshot.docs.forEach(docSnap => {
				const data = docSnap.data();
				if (data.playlistId) {
					counts[data.playlistId] = (counts[data.playlistId] || 0) + 1;
				}
			});
			setFileCounts(counts);
		}, (err) => {
			console.error("Error fetching file counts:", err);
		});

		return () => unsubscribe();
	}, [user?.uid]);

	const handleCreatePlaylist = () => {
		setInputModal({ isOpen: true, mode: 'create', data: null });
	};

	const handleEditPlaylist = (playlistData) => {
		setInputModal({ isOpen: true, mode: 'edit', data: playlistData });
	};

	const handleModalSubmit = async (name) => {
		if (!name.trim()) return;

		if (inputModal.mode === 'create') {
			await addDoc(collection(db, 'playlists'), {
				name: name.trim(),
				ownerId: user.uid,
				ownerName: user.displayName || user.email || 'Anonymous',
				ownerEmail: user.email || '',
				createdAt: serverTimestamp(),
				visibility: 'private',
				members: {}
			});
		} else if (inputModal.mode === 'edit' && inputModal.data) {
			try {
				const playlistRef = doc(db, 'playlists', inputModal.data.id);
				await updateDoc(playlistRef, { name: name.trim() });
			} catch (error) {
				console.error("Error updating playlist:", error);
			}
		}
		setInputModal({ ...inputModal, isOpen: false });
	};

	const handleDeletePlaylist = async (playlistData) => {
		setIsDeleting(true);
		try {
			// Delete files associated with playlist
			const q = query(collection(db, 'files'), where('playlistId', '==', playlistData.id));
			const querySnapshot = await getDocs(q);
			const deletePromises = querySnapshot.docs.map(async (fileDoc) => {
				const file = fileDoc.data();
				try {
					const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
					await deleteObject(storageRef);
					if (file.thumbnailPath) await deleteObject(ref(storage, file.thumbnailPath));
				} catch (err) {
					console.warn("Storage deletion warning:", err.message);
				}
				await deleteDoc(doc(db, 'files', fileDoc.id));
			});
			await Promise.all(deletePromises);

			// Delete playlist document
			await deleteDoc(doc(db, 'playlists', playlistData.id));
		} catch (error) {
			console.error("Error deleting playlist:", error);
			alert("Failed to delete playlist.");
		} finally {
			setIsDeleting(false);
			setConfirmDelete(null);
		}
	};

	const closeInputModal = () => setInputModal({ ...inputModal, isOpen: false });
	const setConfirmDeleteData = (data) => setConfirmDelete(data);
	const cancelDelete = () => setConfirmDelete(null);

	return {
		playlists,
		fileCounts,
		viewMode,
		setViewMode,
		confirmDelete,
		inputModal,
		isDeleting,
		handleCreatePlaylist,
		handleEditPlaylist,
		handleModalSubmit,
		handleDeletePlaylist,
		closeInputModal,
		setConfirmDeleteData,
		cancelDelete
	};
};
