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
    updateDoc 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject, 
    uploadBytes 
} from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useClassSettings } from './useClassSettings';

export const useClassPage = () => {
    const { classId } = useParams();
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [classData, setClassData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [uploadError, setUploadError] = useState(null);
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

    // Check if the current user is the owner to determine if they can see "hidden" indicators
    const isOwner = user?.uid === classData?.ownerId;

    // Modular hook for visibility toggles (CLASSPAGE-002, CLASSPAGE-003)
    const { 
        toggleGlobalVisibility, 
        toggleFieldVisibility, 
        isGlobalLoading, 
        isFieldLoading,
        error: settingError 
    } = useClassSettings(classId);

    // Listen for the specific class document metadata
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

    // Listen for files in real-time from Firestore
    useEffect(() => {
        if (!classId) return;

        let q = query(
            collection(db, 'files'),
            where('classId', '==', classId),
            orderBy('createdAt', 'desc')
        );

        // Filter for public files if the user is not the owner to satisfy security rules
        if (!isOwner) {
            q = query(q, where('visibility', '==', 'public'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedFiles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFiles(fetchedFiles);
        });

        return () => unsubscribe();
    }, [classId, isOwner]);

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
        if (file) {
            try {
                setUploading(true);
                setUploadProgress(0);
                
                let thumbnailUrl = null;
                let thumbnailPath = null;
                
                const storagePath = `classes/${classId}/${Date.now()}_${file.name}`;
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
                                        thumbnailPath = `thumbnails/${classId}/${Date.now()}_thumb.jpg`;
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
            } catch (error) {
                console.error("Firebase Upload Error:", error);
                let errorMessage = `Upload failed: ${error.message}`;
                if (error.message.includes('net::ERR_CONNECTION_REFUSED') || error.code === 'storage/retry-limit-exceeded' || error.code === 'unavailable') {
                    errorMessage = "Connection Refused: Ensure your Firebase Emulators are running (npm run dev) and you are not blocked by a firewall/VPN.";
                } else if (error.code === 'storage/unauthorized') {
                    errorMessage = "Permission Denied: Update your Firebase Storage Rules in the console.";
                }
                setUploadError(errorMessage);
            } finally {
                setUploading(false);
                setUploadProgress(0);
                event.target.value = null;
            }
        }
    };

    const handleDeleteFile = async (file) => {
        try {
            const storageRef = file.storagePath ? ref(storage, file.storagePath) : ref(storage, file.url);
            await deleteObject(storageRef);
            if (file.thumbnailPath) {
                await deleteObject(ref(storage, file.thumbnailPath));
            }
        } catch (error) {
            console.warn("Storage deletion error (file may not exist):", error.message);
        }

        try {
            const fileRef = doc(db, 'files', file.id);
            await deleteDoc(fileRef);
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

    /**
     * Toggles the global visibility (Public/Private) of the class.
     * This updates the class record and is used directly on the Class Page.
     */
    const handleToggleVisibility = async () => {
        if (!classData || !user) return;
        return await toggleGlobalVisibility(classData.visibility, classData.ownerId);
    };

    /**
     * Toggles visibility for specific metadata fields.
     * @param {string} field - The field name (e.g., 'showInstructor')
     */
    const handleToggleFieldVisibility = (field) => {
        if (!classData) return;
        // Default to true if the config doesn't exist yet
        const currentVal = classData.displayConfig ? classData.displayConfig[field] : true;
        toggleFieldVisibility(field, currentVal);
    };

    return {
        classId,
        user,
        fileInputRef,
        files,
        classData,
        uploading,
        uploadProgress,
        confirmDelete,
        setConfirmDelete,
        uploadError,
        setUploadError,
        showUploadSuccess,
        setShowUploadSuccess,
        lastUploadedFile,
        isEditingClass,
        setIsEditingClass,
        classEditData,
        setClassEditData,
        handleAddClick,
        handleFileChange,
        handleDeleteFile,
        handleUpdateClass,
        handleToggleVisibility,
        handleToggleFieldVisibility,
        isOwner,
        isGlobalLoading,
        isFieldLoading
    };
};