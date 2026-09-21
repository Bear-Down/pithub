import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../lib/firebase';
import { 
	doc, 
	collection, 
	query, 
	where, 
	onSnapshot, 
	addDoc, 
	orderBy, 
	serverTimestamp, 
	deleteDoc, 
	updateDoc,
	getDocs
} from 'firebase/firestore';
import { 
	ref, 
	uploadBytesResumable, 
	getDownloadURL, 
	deleteObject, 
	uploadBytes 
} from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

export const usePlaylistPage = () => {
	const { playlistId } = useParams();
	const { user } = useAuth();
	const fileInputRef = useRef(null);

	const [playlistData, setPlaylistData] = useState(null);
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [uploadError, setUploadError] = useState(null);
	const [showUploadSuccess, setShowUploadSuccess] = useState(false);
	const [lastUploadedFile, setLastUploadedFile] = useState('');

	// Member invitation state
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteRole, setInviteRole] = useState('view');
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteError, setInviteError] = useState(null);
	const [inviteSuccess, setInviteSuccess] = useState(null);

	const isOwner = user?.uid === playlistData?.ownerId;
	const memberInfo = playlistData?.members?.[user?.uid];
	const userRole = isOwner ? 'owner' : (memberInfo?.role || 'none');

	const canUpload = isOwner || userRole === 'upload' || userRole === 'delete';
	const canDeleteFiles = isOwner || userRole === 'delete';

	// Listen for playlist metadata
	useEffect(() => {
		if (!playlistId) return;

		const docRef = doc(db, 'playlists', playlistId);
		const unsubscribe = onSnapshot(docRef, 
			(docSnap) => {
				if (docSnap.exists()) {
					setPlaylistData({ id: docSnap.id, ...docSnap.data() });
				} else {
					setPlaylistData({ name: "Playlist Not Found" });
				}
			},
			(err) => {
				console.error("Error listening to playlist doc:", err);
				setPlaylistData({ name: "Access Error" });
			}
		);

		return () => unsubscribe();
	}, [playlistId]);

	// Listen for files in this playlist
	useEffect(() => {
		if (!playlistId) return;

		const q = query(
			collection(db, 'files'),
			where('playlistId', '==', playlistId),
			orderBy('createdAt', 'desc')
		);

		const unsubscribe = onSnapshot(q, 
			(snapshot) => {
				const fetchedFiles = snapshot.docs.map(docSnap => ({
					id: docSnap.id,
					...docSnap.data()
				}));
				setFiles(fetchedFiles);
			},
			(err) => {
				console.error("Error listening to playlist files:", err);
			}
		);

		return () => unsubscribe();
	}, [playlistId]);

	// Member Invitation Handler
	const handleInviteUser = async (e) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;

		setInviteLoading(true);
		setInviteError(null);
		setInviteSuccess(null);

		try {
			const searchEmail = inviteEmail.trim().toLowerCase();

			// Check if inviting self
			if (user?.email && searchEmail === user.email.toLowerCase()) {
				setInviteError("You are already the owner of this playlist.");
				setInviteLoading(false);
				return;
			}

			// Query users collection by email
			const usersQuery = query(collection(db, 'users'), where('email', '==', searchEmail));
			const querySnapshot = await getDocs(usersQuery);

			if (querySnapshot.empty) {
				setInviteError(`No registered user found with email "${searchEmail}".`);
				setInviteLoading(false);
				return;
			}

			const targetUserDoc = querySnapshot.docs[0];
			const targetUid = targetUserDoc.id;
			const targetUserData = targetUserDoc.data();

			const playlistRef = doc(db, 'playlists', playlistId);
			const updatedMembers = {
				...(playlistData?.members || {}),
				[targetUid]: {
					email: targetUserData.email || searchEmail,
					name: targetUserData.displayName || searchEmail.split('@')[0],
					role: inviteRole,
					addedAt: new Date().toISOString()
				}
			};

			await updateDoc(playlistRef, { members: updatedMembers });

			setInviteSuccess(`Successfully added ${searchEmail} with permission: "${inviteRole}".`);
			setInviteEmail('');
		} catch (err) {
			console.error("Error inviting user:", err);
			setInviteError(`Failed to invite user: ${err.message}`);
		} finally {
			setInviteLoading(false);
		}
	};

	// Update Member Role
	const handleUpdateMemberRole = async (targetUid, newRole) => {
		try {
			const playlistRef = doc(db, 'playlists', playlistId);
			const updatedMembers = { ...(playlistData?.members || {}) };

			if (updatedMembers[targetUid]) {
				updatedMembers[targetUid].role = newRole;
				await updateDoc(playlistRef, { members: updatedMembers });
			}
		} catch (err) {
			console.error("Error updating member role:", err);
			alert("Failed to update role.");
		}
	};

	// Remove Member
	const handleRemoveMember = async (targetUid) => {
		try {
			const playlistRef = doc(db, 'playlists', playlistId);
			const updatedMembers = { ...(playlistData?.members || {}) };

			delete updatedMembers[targetUid];
			await updateDoc(playlistRef, { members: updatedMembers });
		} catch (err) {
			console.error("Error removing member:", err);
			alert("Failed to remove member.");
		}
	};

	const handleAddClick = () => {
		fileInputRef.current?.click();
	};

	const generateVideoThumbnail = (file) => {
		return new Promise((resolve) => {
			const video = document.createElement('video');
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');

			video.src = URL.createObjectURL(file);
			video.load();

			video.onloadeddata = () => {
				video.currentTime = 1;
			};

			video.onseeked = () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);

				canvas.toBlob((blob) => {
					resolve(blob);
					URL.revokeObjectURL(video.src);
				}, 'image/jpeg', 0.7);
			};

			video.onerror = () => resolve(null);
		});
	};

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			setUploading(true);
			setUploadProgress(0);

			let thumbnailUrl = null;
			let thumbnailPath = null;

			const storagePath = `playlists/${playlistId}/${Date.now()}_${file.name}`;
			const storageRef = ref(storage, storagePath);
			const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

			await new Promise((resolve, reject) => {
				uploadTask.on('state_changed',
					(snapshot) => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						setUploadProgress(Math.round(progress));
					},
					(error) => reject(error),
					async () => {
						try {
							const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

							if (file.type.startsWith('video/')) {
								const thumbBlob = await generateVideoThumbnail(file);
								if (thumbBlob) {
									thumbnailPath = `thumbnails/playlists/${playlistId}/${Date.now()}_thumb.jpg`;
									const thumbRef = ref(storage, thumbnailPath);
									await uploadBytes(thumbRef, thumbBlob);
									thumbnailUrl = await getDownloadURL(thumbRef);
								}
							}

							const fileData = {
								name: file.name,
								url: downloadURL,
								storagePath: storagePath,
								thumbnailUrl: thumbnailUrl,
								thumbnailPath: thumbnailPath,
								playlistId: playlistId,
								ownerId: user?.uid || 'anonymous',
								ownerName: user?.displayName || user?.email || 'Anonymous',
								className: playlistData?.name || 'Playlist',
								type: file.type,
								createdAt: serverTimestamp(),
								visibility: 'private'
							};

							await addDoc(collection(db, 'files'), fileData);
							resolve();
						} catch (innerError) {
							reject(innerError);
						}
					}
				);
			});

			setLastUploadedFile(file.name);
			setShowUploadSuccess(true);
		} catch (error) {
			console.error("Firebase Playlist Upload Error:", error);
			setUploadError(`Upload failed: ${error.message}`);
		} finally {
			setUploading(false);
			setUploadProgress(0);
			event.target.value = null;
		}
	};

	const handleDeleteFile = async (file) => {
		try {
			const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
			await deleteObject(storageRef);
			if (file.thumbnailPath) await deleteObject(ref(storage, file.thumbnailPath));
		} catch (error) {
			console.warn("Storage deletion error:", error.message);
		}

		try {
			await deleteDoc(doc(db, 'files', file.id));
		} catch (error) {
			console.error("Firestore File Deletion Error:", error);
			alert(`Failed to remove file: ${error.message}`);
		}
	};

	return {
		playlistId,
		user,
		playlistData,
		files,
		fileInputRef,
		uploading,
		uploadProgress,
		uploadError,
		setUploadError,
		showUploadSuccess,
		setShowUploadSuccess,
		lastUploadedFile,
		confirmDelete,
		setConfirmDelete,
		inviteEmail,
		setInviteEmail,
		inviteRole,
		setInviteRole,
		inviteLoading,
		inviteError,
		inviteSuccess,
		isOwner,
		userRole,
		canUpload,
		canDeleteFiles,
		handleInviteUser,
		handleUpdateMemberRole,
		handleRemoveMember,
		handleAddClick,
		handleFileChange,
		handleDeleteFile
	};
};
