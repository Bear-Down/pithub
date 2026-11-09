import React from 'react';
import VideoList from '../../components/VideoList';
import ConfirmationModal from '../../components/ConfirmationModal';
import UploadProgressModal from '../../components/UploadProgressModal';
import { useClasslessUpload } from '../../hooks/useClasslessUpload';
import '../../styles/style.css';

const UploadsPage = () => {
	const {
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
	} = useClasslessUpload();
	return (
		<div className="home-wrapper">
			<div className="container">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h1>Your Uploads</h1>
					<button className="add-content-btn" onClick={handleAddClick} disabled={uploading}>
						{uploading ? `Uploading ${uploadProgress}%` : '+ Upload Video'}
					</button>
				</div>
				<input
					type="file"
					ref={fileInputRef}
					style={{ display: 'none' }}
					accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.flv"
					onChange={handleFileChange}
				/>
				<p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
					Showing all personal file and video uploads across your account regardless of class.
				</p>
				<VideoList userOnly={true} showVisibilityBadge={true} showClassLink={true} />
				<UploadProgressModal
					isOpen={uploading}
					progress={uploadProgress}
					fileName={uploadingName}
					onCancel={handleCancelUpload}
				/>
				<ConfirmationModal
					isOpen={showUploadSuccess}
					title="Upload Complete"
					message={<>Your video <strong>{lastUploadedFile}</strong> was uploaded and is public.</>}
					confirmText="Done"
					onConfirm={() => setShowUploadSuccess(false)}
					onCancel={() => setShowUploadSuccess(false)}
				/>
				<ConfirmationModal
					isOpen={!!uploadError}
					title="Upload Error"
					message={<>{uploadError}</>}
					confirmText="OK"
					cancelText="Close"
					onConfirm={() => setUploadError(null)}
					onCancel={() => setUploadError(null)}
				/>
			</div>
		</div>
	);
};

export default UploadsPage;
