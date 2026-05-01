import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { doc, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

const ClassPage = () => {
	const { classId } = useParams();
	const { user } = useAuth();
	const fileInputRef = useRef(null);
	const [files, setFiles] = useState([]);
	const [classData, setClassData] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [showUploadSuccess, setShowUploadSuccess] = useState(false);
	const [lastUploadedFile, setLastUploadedFile] = useState('');
	const [isEditingClass, setIsEditingClass] = useState(false);
	const [classEditData, setClassEditData] = useState({
		instructor: '',
		office: '',
		officeHours: '',
		email: '',
		room: '',
		meetingTime: '',
		description: '',
		syllabusUrl: ''
	});

	// 1. Listen for the specific class document metadata
	useEffect(() => {
		if (!classId) return;

		const docRef = doc(db, 'classes', classId);
		const unsubscribe = onSnapshot(docRef, (docSnap) => {
		if (docSnap.exists()) {
			const data = docSnap.data();
			setClassData(data);
			setClassEditData({
				instructor: data.instructor || '',
				office: data.office || '',
				officeHours: data.officeHours || '',
				email: data.email || '',
				room: data.room || '',
				meetingTime: data.meetingTime || '',
				description: data.description || '',
				syllabusUrl: data.syllabusUrl || ''
			});
		} else {
			console.error("No such class document found!");
			setClassData({ name: "Class Not Found" });
		}
		});

		return () => unsubscribe();
	}, [classId]);

	// 2. Listen for files in real-time from Firestore
	useEffect(() => {
		if (!classId) return;

		// Query files collection where classId matches the current route
		const q = query(
		collection(db, 'files'),
		where('classId', '==', classId)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
		const fetchedFiles = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));
		setFiles(fetchedFiles);
		});

		return () => unsubscribe();
	}, [classId]);

	const handleAddClick = () => {
		fileInputRef.current.click();
	};

	const generateVideoThumbnail = (file) => {
		return new Promise((resolve) => {
			const video = document.createElement('video');
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');

			video.src = URL.createObjectURL(file);
			video.load();
			
			video.onloadeddata = () => {
				// Seek to 1 second to get a good frame
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
		if (file) {
		try {
			setUploading(true);
			setUploadProgress(0);
			
			let thumbnailUrl = null;
			let thumbnailPath = null;
			
			// 1. Upload raw file to Firebase Storage
			const storagePath = `classes/${classId}/${Date.now()}_${file.name}`;
			const storageRef = ref(storage, storagePath);

			const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

			// Using a promise to wrap the resumable upload for cleaner async/await usage
			await new Promise((resolve, reject) => {
				uploadTask.on('state_changed', 
					(snapshot) => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						setUploadProgress(Math.round(progress));
					},
					(error) => reject(error),
					async () => {
						try {
							// 2. Get the public Download URL
							const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
							
							// 2.5 Generate and upload thumbnail if it's a video
							if (file.type.startsWith('video/')) {
								const thumbBlob = await generateVideoThumbnail(file);
								if (thumbBlob) {
									thumbnailPath = `thumbnails/${classId}/${Date.now()}_thumb.jpg`;
									const thumbRef = ref(storage, thumbnailPath);
									await uploadBytes(thumbRef, thumbBlob);
									thumbnailUrl = await getDownloadURL(thumbRef);
								}
							}
							
							// 3. Save Metadata to Firestore
							const fileData = {
								name: file.name,
								url: downloadURL,
								storagePath: storagePath,
								thumbnailUrl: thumbnailUrl,
								thumbnailPath: thumbnailPath,
								classId: classId,
								ownerId: user?.uid || 'dev_user_789',
								ownerName: user?.displayName || 'Anonymous',
								className: classData?.name || 'General',
								type: file.type,
								createdAt: serverTimestamp(),
								visibility: classData?.visibility || 'private'
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
			console.log("File successfully uploaded and indexed!");
		} catch (error) {
			console.error("Firebase Upload Error:", error);
			if (error.message.includes('ERR_CONNECTION_REFUSED') || error.code === 'storage/retry-limit-exceeded') {
				alert("Network Error: Access to Firebase Storage is being refused. If you are on a University Wi-Fi, they may be blocking uploads. Try using a VPN or mobile data.");
			} else if (error.code === 'storage/unauthorized') {
			alert("Permission Denied: Update your Firebase Storage Rules in the console.");
			} else {
			alert(`Upload failed: ${error.message}`);
			}
		} finally {
			setUploading(false);
			setUploadProgress(0);
			// Reset input so the same file can be selected again if deleted
			event.target.value = null;
		}
		}
	};

	const handleDeleteFile = async (file) => {
		try {
			// 1. Delete from Firebase Storage
			// Fallback to URL if storagePath isn't present in legacy documents
			const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
			await deleteObject(storageRef);

			// Also delete thumbnail if it exists
			if (file.thumbnailPath) {
				await deleteObject(ref(storage, file.thumbnailPath));
			}
		} catch (error) {
			// If storage deletion fails (e.g. file missing), we still want to clean up the Firestore record
			console.warn("Storage deletion error (file may not exist):", error.message);
		}

		try {
			// 2. Delete Metadata from Firestore
			const fileRef = doc(db, 'files', file.id);
			await deleteDoc(fileRef);
			console.log("File metadata successfully removed!");
		} catch (error) {
			console.error("Firestore Deletion Error:", error);
			alert(`Failed to remove file record: ${error.message}`);
		}
	};

	const handleUpdateClass = async () => {
		try {
			const classRef = doc(db, 'classes', classId);
			await updateDoc(classRef, classEditData);
			setIsEditingClass(false);
		} catch (error) {
			console.error("Error updating class info:", error);
			alert("Failed to update class information.");
		}
	};

	return (
		<div className="container class-page">
		{/* Hidden input to handle file selection */}
		<input 
			type="file" 
			ref={fileInputRef} 
			style={{ display: 'none' }} 
			onChange={handleFileChange}
			accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.flv,
			.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.html,.htm,
			.jpg, .jpeg, .png, .gif, .bmp, .webp"
		/>

		<div className="class-page-header">
			<h1>{classData ? classData.name : 'Loading...'}</h1>
			{user?.uid === classData?.ownerId && (
				<button className="add-content-btn" onClick={handleAddClick} disabled={uploading}>
				{uploading ? `Uploading ${uploadProgress}%` : '+ Add Video / Document'}
				</button>
			)}
		</div>

		<div className="class-info-section" style={{ marginTop: '10px', padding: '15px'}}>
			{isEditingClass ? (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Instructor</label>
						<input type="text" value={classEditData.instructor} onChange={(e) => setClassEditData({...classEditData, instructor: e.target.value})} placeholder="Dr. Pogue" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Office & Hours</label>
						<input type="text" value={classEditData.office} onChange={(e) => setClassEditData({...classEditData, office: e.target.value})} placeholder="AS 123" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						<input type="text" value={classEditData.officeHours} onChange={(e) => setClassEditData({...classEditData, officeHours: e.target.value})} placeholder="MW 2:00 PM - 4:00 PM" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Email</label>
						<input type="email" value={classEditData.email} onChange={(e) => setClassEditData({...classEditData, email: e.target.value})} placeholder="prof@lewisu.edu" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Room & Time</label>
						<input type="text" value={classEditData.room} onChange={(e) => setClassEditData({...classEditData, room: e.target.value})} placeholder="AS 104 G" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						<input type="text" value={classEditData.meetingTime} onChange={(e) => setClassEditData({...classEditData, meetingTime: e.target.value})} placeholder="T/TH 11:00 AM" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Syllabus URL</label>
						<input type="text" value={classEditData.syllabusUrl} onChange={(e) => setClassEditData({...classEditData, syllabusUrl: e.target.value})} placeholder="https://drive.google.com/..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
						
						<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Short Description</label>
						<textarea value={classEditData.description} onChange={(e) => setClassEditData({...classEditData, description: e.target.value})} placeholder="Brief overview of the course..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', height: '60px' }} />
					</div>
					<div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
						<button onClick={() => setIsEditingClass(false)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
						<button onClick={handleUpdateClass} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: 'orange', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
					</div>
				</div>
			) : (
				<div style={{ position: 'relative' }}>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
						<div style={{ flex: '1', minWidth: '200px' }}>
							<p style={{ margin: '4px 0' }}><strong>Instructor:</strong> {classData?.instructor || 'Not set'}</p>
							<p style={{ margin: '4px 0' }}><strong>Office:</strong> {classData?.office || 'Not set'}</p>
							<p style={{ margin: '4px 0' }}><strong>Office Hours:</strong> {classData?.officeHours || 'Not set'}</p>
							<p style={{ margin: '4px 0' }}><strong>Email:</strong> {classData?.email ? <a href={`mailto:${classData.email}`} style={{ color: 'blue' }}>{classData.email}</a> : 'Not set'}</p>
						</div>
						<div style={{ flex: '1', minWidth: '200px' }}>
							<p style={{ margin: '4px 0' }}><strong>Room:</strong> {classData?.room || 'Not set'}</p>
							<p style={{ margin: '4px 0' }}><strong>Time:</strong> {classData?.meetingTime || 'Not set'}</p>
							{classData?.syllabusUrl && (
								<p style={{ margin: '4px 0' }}>
									<strong>Syllabus:</strong> <a href={classData.syllabusUrl} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>View Syllabus</a>
								</p>
							)}
						</div>
						<div style={{ flex: '2', minWidth: '250px' }}>
							<p style={{ margin: '4px 0' }}><strong>Course Description:</strong></p>
							<p style={{ margin: '0', fontSize: '0.9rem', color: '#555', fontStyle: classData?.description ? 'normal' : 'italic' }}>
								{classData?.description || 'No description provided.'}
							</p>
						</div>
					</div>
					{user?.uid === classData?.ownerId && (
						<button 
							onClick={() => setIsEditingClass(true)} 
							style={{ 
								position: 'absolute', 
								top: '-5px', 
								right: '-5px', 
								padding: '4px 8px', 
								fontSize: '0.7rem', 
								borderRadius: '4px', 
								border: '1px solid #ccc', 
								backgroundColor: '#fff', 
								cursor: 'pointer',
								color: '#666' 
							}}
						>
							Edit Info
						</button>
					)}
				</div>
			)}
		</div>

		<section className="class-content">
			<h2>Class Files & Videos</h2>
			<ul className="file-list">
			{files.length > 0 ? (
				files.map((file) => (
				<li key={file.id} className="file-item">
					<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
					{file.thumbnailUrl ? (
						<img 
						src={file.thumbnailUrl} 
						alt="thumbnail" 
						style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
						/>
					) : (
						<div style={{ width: '80px', height: '45px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#999' }}>
						DOC
						</div>
					)}
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<a href={file.url} target="_blank" rel="noreferrer" className="file-link">
							{file.name}
						</a>
						<span style={{ fontSize: '0.75rem', color: '#777' }}>
							Uploaded by {file.ownerName ? file.ownerName.split(' ')[0] : 'Unknown'}
						</span>
					</div>
					<span className="file-type" style={{ fontSize: '0.8rem', color: '#888', marginLeft: 'auto', marginRight: '20px' }}>
						{file.type.split('/')[1]?.toUpperCase() || 'FILE'}
					</span>
					</div>
					{user?.uid === file.ownerId && (
					<button onClick={() => setConfirmDelete(file)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
						Delete
					</button>
					)}
				</li>
				))
			) : (
				<li className="file-item">
				<span>No content uploaded yet for this class.</span>
				</li>
			)}
			</ul>
		</section>

		<ConfirmationModal 
			isOpen={!!confirmDelete}
			title="Remove File?"
			message={
				<>
					Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? 
					This will permanently remove the file from PitHub.
				</>
			}
			confirmText="Confirm Delete"
			onConfirm={() => {
				handleDeleteFile(confirmDelete);
				setConfirmDelete(null);
			}}
			onCancel={() => setConfirmDelete(null)}
		/>

		<ConfirmationModal 
			isOpen={showUploadSuccess}
			title="Upload Complete"
			message={
				<>Your file <strong>{lastUploadedFile}</strong> has been successfully uploaded and is now available for the class.</>
			}
			confirmText="Done"
			onConfirm={() => setShowUploadSuccess(false)}
			onCancel={() => setShowUploadSuccess(false)}
		/>

		{/* <div className="status">
			<p>Class ID: {classId}</p>
		</div> */}
		</div>
	);
};

export default ClassPage;