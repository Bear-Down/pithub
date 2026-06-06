import React from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useClassPage } from '../../hooks/useClassPage';

const ClassPage = () => {
	const {
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
		isFieldLoading,
		classId
	} = useClassPage();

	const [showProfileWarning, setShowProfileWarning] = React.useState(false);

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
			{isOwner && (
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<button 
						onClick={async () => {
							const result = await handleToggleVisibility();
							if (result?.error === 'PROFILE_PRIVATE') {
								setShowProfileWarning(true);
							}
						}} 
						disabled={isGlobalLoading}
						style={{ 
							padding: '8px 16px', 
							fontSize: '0.85rem', 
							borderRadius: '6px', 
							border: '1px solid #ccc', 
							fontWeight: 'bold',
							backgroundColor: classData.visibility === 'public' ? '#28a745' : '#ff4d4d',
							color: classData.visibility === 'public' ? '#ffffff' : 'var(--private-text)',
							cursor: 'pointer',
							transition: 'background-color 0.3s ease, color 0.3s ease'
						}}
					>
						{isGlobalLoading ? '...' : (classData?.visibility === 'public' ? 'Public Class' : 'Private Class')}
					</button>
					<button className="add-content-btn" onClick={handleAddClick} disabled={uploading}>
						{uploading ? `Uploading ${uploadProgress}%` : '+ Add Video / Document'}
					</button>
				</div>
			)}
		</div>

		<div className="class-info-section" style={{ marginTop: '10px', padding: '15px'}}>
			{isEditingClass ? (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Instructor</label>
							<button 
								onClick={() => handleToggleFieldVisibility('showInstructor')} 
								disabled={isFieldLoading}
								style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showInstructor ? '#28a745' : 'var(--bg-primary)', color: classData?.displayConfig?.showInstructor ? '#fff' : 'var(--text-main)', transition: 'background-color 0.3s ease, color 0.3s ease' }}
							>
								{classData?.displayConfig?.showInstructor ? 'Visible' : 'Hidden'}
							</button>
						</div>
						<input type="text" value={classEditData.instructor} onChange={(e) => setClassEditData({...classEditData, instructor: e.target.value})} placeholder="Dr. Pogue" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Office & Hours</label>
							<div style={{ display: 'flex', gap: '4px' }}>
								<button disabled={isFieldLoading} onClick={() => handleToggleFieldVisibility('showOffice')} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showOffice ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showOffice ? 'var(--visible-text)' : 'var(--text-main)' }}>Offc</button>
								<button disabled={isFieldLoading} onClick={() => handleToggleFieldVisibility('showOfficeHours')} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showOfficeHours ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showOfficeHours ? 'var(--visible-text)' : 'var(--text-main)' }}>Hrs</button>
							</div>
						</div>
						<input type="text" value={classEditData.office} onChange={(e) => setClassEditData({...classEditData, office: e.target.value})} placeholder="AS 123" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						<input type="text" value={classEditData.officeHours} onChange={(e) => setClassEditData({...classEditData, officeHours: e.target.value})} placeholder="MW 2:00 PM - 4:00 PM" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Email</label>
							<button 
								onClick={() => handleToggleFieldVisibility('showEmail')} 
								disabled={isFieldLoading}
								style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showEmail ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showEmail ? 'var(--visible-text)' : 'var(--text-main)' }}
							>
								{classData?.displayConfig?.showEmail ? 'Visible' : 'Hidden'}
							</button>
						</div>
						<input type="email" value={classEditData.email} onChange={(e) => setClassEditData({...classEditData, email: e.target.value})} placeholder="prof@lewisu.edu" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Room & Time</label>
							<div style={{ display: 'flex', gap: '4px' }}>
								<button disabled={isFieldLoading} onClick={() => handleToggleFieldVisibility('showRoom')} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showRoom ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showRoom ? 'var(--visible-text)' : 'var(--text-main)' }}>Rm</button>
								<button disabled={isFieldLoading} onClick={() => handleToggleFieldVisibility('showMeetingTime')} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showMeetingTime ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showMeetingTime ? 'var(--visible-text)' : 'var(--text-main)' }}>Time</button>
							</div>
						</div>
						<input type="text" value={classEditData.room} onChange={(e) => setClassEditData({...classEditData, room: e.target.value})} placeholder="AS 104 G" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						<input type="text" value={classEditData.meetingTime} onChange={(e) => setClassEditData({...classEditData, meetingTime: e.target.value})} placeholder="T/TH 11:00 AM" style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Syllabus URL</label>
							<button 
								onClick={() => handleToggleFieldVisibility('showSyllabus')} 
								disabled={isFieldLoading}
								style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showSyllabus ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showSyllabus ? 'var(--visible-text)' : 'var(--text-main)' }}
							>
								{classData?.displayConfig?.showSyllabus ? 'Visible' : 'Hidden'}
							</button>
						</div>
						<input type="text" value={classEditData.syllabusUrl} onChange={(e) => setClassEditData({...classEditData, syllabusUrl: e.target.value})} placeholder="https://drive.google.com/..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
						
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Short Description</label>
							<button 
								onClick={() => handleToggleFieldVisibility('showDescription')} 
								disabled={isFieldLoading}
								style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: classData?.displayConfig?.showDescription ? 'var(--visible-bg)' : 'var(--hidden-bg)', color: classData?.displayConfig?.showDescription ? 'var(--visible-text)' : 'var(--text-main)' }}
							>
								{classData?.displayConfig?.showDescription ? 'Visible' : 'Hidden'}
							</button>
						</div>
						<textarea value={classEditData.description} onChange={(e) => setClassEditData({...classEditData, description: e.target.value})} placeholder="Brief overview of the course..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', height: '60px' }} />
					</div>
					<div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
						<button onClick={() => setIsEditingClass(false)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
						<button onClick={handleUpdateClass} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--brand-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
					</div>
				</div>
			) : (
				<div style={{ position: 'relative' }}>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
						<div style={{ flex: '1', minWidth: '200px' }}>
							{/* Instructor */}
							{classData?.instructor && (isOwner || classData?.displayConfig?.showInstructor !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showInstructor === false ? 0.6 : 1 }}>
									<strong>Instructor:</strong> {classData.instructor}
									{isOwner && classData?.displayConfig?.showInstructor === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
							{/* Office */}
							{classData?.office && (isOwner || classData?.displayConfig?.showOffice !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showOffice === false ? 0.6 : 1 }}>
									<strong>Office:</strong> {classData.office}
									{isOwner && classData?.displayConfig?.showOffice === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
							{/* Office Hours */}
							{classData?.officeHours && (isOwner || classData?.displayConfig?.showOfficeHours !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showOfficeHours === false ? 0.6 : 1 }}>
									<strong>Office Hours:</strong> {classData.officeHours}
									{isOwner && classData?.displayConfig?.showOfficeHours === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
							{/* Email */}
							{classData?.email && (isOwner || classData?.displayConfig?.showEmail !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showEmail === false ? 0.6 : 1 }}>
									<strong>Email:</strong> <a href={`mailto:${classData.email}`} style={{ color: 'var(--link-color)' }}>{classData.email}</a>
									{isOwner && classData?.displayConfig?.showEmail === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
						</div>
						<div style={{ flex: '1', minWidth: '200px' }}>
							{/* Room */}
							{classData?.room && (isOwner || classData?.displayConfig?.showRoom !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showRoom === false ? 0.6 : 1 }}>
									<strong>Room:</strong> {classData.room}
									{isOwner && classData?.displayConfig?.showRoom === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
							{/* Meeting Time */}
							{classData?.meetingTime && (isOwner || classData?.displayConfig?.showMeetingTime !== false) && (
								<p style={{ margin: '4px 0', opacity: classData?.displayConfig?.showMeetingTime === false ? 0.6 : 1 }}>
									<strong>Time:</strong> {classData.meetingTime}
									{isOwner && classData?.displayConfig?.showMeetingTime === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
							{(isOwner || classData?.displayConfig?.showSyllabus !== false) && classData?.syllabusUrl && (
								<p style={{ margin: '4px 0' }}>
									<strong>Syllabus:</strong> <a href={classData.syllabusUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--link-color)' }}>View Syllabus</a>
									{isOwner && classData?.displayConfig?.showSyllabus === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
							)}
						</div>
						{/* Description */}
						{classData?.description && (isOwner || classData?.displayConfig?.showDescription !== false) && (
							<div style={{ flex: '2', minWidth: '250px', opacity: classData?.displayConfig?.showDescription === false ? 0.6 : 1 }}>
								<p style={{ margin: '4px 0' }}>
									<strong>Course Description:</strong>
									{isOwner && classData?.displayConfig?.showDescription === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
								</p>
								<p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
									{classData.description}
								</p>
							</div>
						)}
					</div>
					{isOwner && (
						<div style={{ position: 'absolute', top: '-5px', right: '-5px', display: 'flex', gap: '8px' }}>
							<button 
								onClick={() => setIsEditingClass(true)} 
								style={{ 
									padding: '4px 8px', 
									fontSize: '0.7rem', 
									borderRadius: '4px', 
									border: '1px solid var(--border-color)', 
									backgroundColor: 'var(--bg-secondary)', 
									cursor: 'pointer',
									color: 'var(--text-muted)' 
								}}
							>
								Edit Info
							</button>
						</div>
					)}
				</div>
			)}
		</div>

		<section className="class-content">
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<h2>Class Files & Videos</h2>
			</div>
			<ul className="file-list">
			{files.length > 0 ? (
				files.map((file) => (
				<li key={file.id} className="file-item">
					<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
					{file.thumbnailUrl ? (
						<img 
						src={file.thumbnailUrl} 
						alt="thumbnail" 
						style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
						/>
					) : (
						<div style={{ width: '80px', height: '45px', backgroundColor: 'var(--hidden-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
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
			isOpen={showProfileWarning}
			title="Profile is Private"
			message={
				<>
					Your profile page is currently set to <strong>Private</strong>. 
					In order to set a class to public, your profile must be public as well.
				</>
			}
			confirmText="I Understand"
			onConfirm={() => setShowProfileWarning(false)}
			onCancel={() => setShowProfileWarning(false)}
		/>

		<ConfirmationModal 
			isOpen={!!confirmDelete}
			title="Remove File?"
			message={
				<>
					Are you sure you want to delete <strong><>{confirmDelete?.name}</></strong>? 
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
				<>Your file <strong><>{lastUploadedFile}</></strong> has been successfully uploaded and is now available for the class.</>
			}
			confirmText="Done"
			onConfirm={() => setShowUploadSuccess(false)}
			onCancel={() => setShowUploadSuccess(false)}
		/>

		<ConfirmationModal 
			isOpen={!!uploadError}
			title="Upload Error"
			message={<>{uploadError}</>}
			confirmText="Try Again"
			cancelText="Cancel"
			onConfirm={() => {
				setUploadError(null);
				handleAddClick();
			}}
			onCancel={() => setUploadError(null)}
		/>

		{/* 
		// This if for debugging purposes - this shows the specific UID of a user
		within their own classes...
		<div className="status">
			<p>Class ID: {classId}</p>
		</div> 
		*/}
		</div>
	);
};

export default ClassPage;