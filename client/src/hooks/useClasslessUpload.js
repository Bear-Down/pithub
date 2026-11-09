import { useState, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

// Uploads ONE video that is not attached to any class. Classless videos will be public until we add the ability to add descriptions, titles and thumbnails
export const useClasslessUpload = () => {
	const { user } = useAuth();
	const fileInputRef = useRef(null);
	const uploadTaskRef = useRef(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadingName, setUploadingName] = useState('');
	const [uploadError, setUploadError] = useState(null);
	const [showUploadSuccess, setShowUploadSuccess] = useState(false);
	const [lastUploadedFile, setLastUploadedFile] = useState('');

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

			video.onerror = () => {
				resolve(null);
			};
		});
	};

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		event.target.value = null;
		if (!file || !user) return;

		if (!file.type.startsWith('video/')) {
			setUploadError('Only video files can be uploaded without a class. To upload documents, add them inside a class.');
			return;
		}

		try {
			setUploading(true);
			setUploadProgress(0);
			setUploadingName(file.name);

			let thumbnailUrl = null;
			let thumbnailPath = null;

			const storagePath = `uploads/${user.uid}/${Date.now()}_${file.name}`;
			const storageRef = ref(storage, storagePath);
			const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });
			uploadTaskRef.current = uploadTask;

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

							const thumbBlob = await generateVideoThumbnail(file);
							if (thumbBlob) {
								thumbnailPath = `thumbnails/uploads/${user.uid}/${Date.now()}_thumb.jpg`;
								const thumbRef = ref(storage, thumbnailPath);
								await uploadBytes(thumbRef, thumbBlob);
								thumbnailUrl = await getDownloadURL(thumbRef);
							}

							// No classId / className on purpose: this is a classless video.
							await addDoc(collection(db, 'files'), {
								name: file.name,
								url: downloadURL,
								storagePath: storagePath,
								thumbnailUrl: thumbnailUrl,
								thumbnailPath: thumbnailPath,
								ownerId: user.uid,
								ownerName: user.displayName || 'Anonymous',
								type: file.type,
								createdAt: serverTimestamp(),
								visibility: 'public'
							});
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
			if (error.code === 'storage/canceled') {
				console.log('Upload cancelled by user.');
				return;
			}
			console.error('Classless upload error:', error);
			setUploadError(
				error.code === 'storage/unauthorized'
					? 'Permission Denied: Storage rules do not allow uploads to this location yet.'
					: `Upload failed: ${error.message}`
			);
		} finally {
			uploadTaskRef.current = null;
			setUploading(false);
			setUploadProgress(0);
		}
	};

	const handleCancelUpload = () => {
		if (uploadTaskRef.current) {
			uploadTaskRef.current.cancel();
		}
	};

	return {
		fileInputRef,
		uploading,
		uploadProgress,
		uploadingName,
		uploadError,
		setUploadError,
		showUploadSuccess,
		setShowUploadSuccess,
		lastUploadedFile,
		handleAddClick,
		handleFileChange,
		handleCancelUpload
	};
};