import React from 'react';
import ClassCard from '../classes/ClassCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useProfilePage } from '../../hooks/useProfilePage';

const ProfilePage = () => {
	const {
		user,
		profileData,
		classes,
		recentFiles,
		page,
		setPage,
		hasNext,
		confirmDelete,
		setConfirmDelete,
		inputModal,
		setInputModal,
		isDeleting,
		isEditingProfile,
		setIsEditingProfile,
		profileEditData,
		setProfileEditData,
		isOwner,
		handleCreateClass,
		handleEditClass,
		handleModalSubmit,
		handleProfileVisibilityChange,
		handleUpdateProfile,
		handleDeleteClass,
		handleToggleFieldVisibility,
		isGlobalLoading,
		isFieldLoading
	} = useProfilePage();

	return (
		<div className="container profile-page">
			{isGlobalLoading && <LoadingOverlay message="Updating Profile & Class Privacy..." />}
			
			<div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h1 style={{ color: 'orange', margin: 0 }}>
					{isOwner ? `Hello, ${user?.displayName || 'User'}!` : `${profileData.displayName || 'User'}'s Profile`}
				</h1>
				{isOwner && (
					<div className="profile-visibility-toggle" style={{ marginLeft: 'auto' }}> {/* Added marginLeft: 'auto' for spacing */}
						<button 
							onClick={() => handleProfileVisibilityChange(profileData.visibility)}
							disabled={isGlobalLoading}
							style={{ 
								padding: '8px 16px', 
								fontSize: '0.85rem', 
								borderRadius: '6px', 
								border: 'none',
								fontWeight: 'bold',
								cursor: isGlobalLoading ? 'not-allowed' : 'pointer',
								backgroundColor: profileData.visibility === 'public' ? '#28a745' : '#ff4d4d',
								color: '#ffffff'
							}}
						>
							{isGlobalLoading ? '...' : (profileData.visibility === 'public' ? 'Public Profile' : 'Private Profile')}
						</button>
					</div>
				)}
			</div>

			<div className="profile-info-section" style={{ marginTop: '15px', padding: '15px'}}>
				{isEditingProfile ? (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Major</label>
								<button 
									onClick={() => handleToggleFieldVisibility('showMajor')}
									disabled={isFieldLoading} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: isFieldLoading ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc', backgroundColor: profileData?.profileConfig?.showMajor !== false ? '#e0ffe0' : '#f0f0f0' }}
								>
									{profileData?.profileConfig?.showMajor !== false ? 'Visible' : 'Hidden'}
								</button>
							</div>
							<input type="text" value={profileEditData.major} onChange={(e) => setProfileEditData({...profileEditData, major: e.target.value})} placeholder="Major..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
								<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Minor</label>
								<button 
									onClick={() => handleToggleFieldVisibility('showMinor')}
									disabled={isFieldLoading} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: isFieldLoading ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc', backgroundColor: profileData?.profileConfig?.showMinor !== false ? '#e0ffe0' : '#f0f0f0' }}
								>
									{profileData?.profileConfig?.showMinor !== false ? 'Visible' : 'Hidden'}
								</button>
							</div>
							<input type="text" value={profileEditData.minor} onChange={(e) => setProfileEditData({...profileEditData, minor: e.target.value})} placeholder="Minor..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Expected Graduation</label>
								<button 
									onClick={() => handleToggleFieldVisibility('showGraduation')}
									disabled={isFieldLoading} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: isFieldLoading ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc', backgroundColor: profileData?.profileConfig?.showGraduation !== false ? '#e0ffe0' : '#f0f0f0' }}
								>
									{profileData?.profileConfig?.showGraduation !== false ? 'Visible' : 'Hidden'}
								</button>
							</div>
							<input type="text" value={profileEditData.gradSemester} onChange={(e) => setProfileEditData({...profileEditData, gradSemester: e.target.value})} placeholder="Spring 2027" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
								<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Your URL</label>
								<button 
									onClick={() => handleToggleFieldVisibility('showWebsite')}
									disabled={isFieldLoading} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: isFieldLoading ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc', backgroundColor: profileData?.profileConfig?.showWebsite !== false ? '#e0ffe0' : '#f0f0f0' }}
								>
									{profileData?.profileConfig?.showWebsite !== false ? 'Visible' : 'Hidden'}
								</button>
							</div>
							<input type="text" value={profileEditData.website} onChange={(e) => setProfileEditData({...profileEditData, website: e.target.value})} placeholder="https://your-link" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
						</div>
						<div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Bio</label>
								<button 
									onClick={() => handleToggleFieldVisibility('showBio')}
									disabled={isFieldLoading} style={{ fontSize: '0.6rem', padding: '1px 4px', cursor: isFieldLoading ? 'not-allowed' : 'pointer', borderRadius: '3px', border: '1px solid #ccc', backgroundColor: profileData?.profileConfig?.showBio !== false ? '#e0ffe0' : '#f0f0f0' }}
								>
									{profileData?.profileConfig?.showBio !== false ? 'Visible' : 'Hidden'}
								</button>
							</div>
							<textarea value={profileEditData.bio} onChange={(e) => setProfileEditData({...profileEditData, bio: e.target.value})} placeholder="Tell us about yourself..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
						</div>
						<div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
							<button disabled={isFieldLoading} onClick={() => setIsEditingProfile(false)} style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #ddd', cursor: isFieldLoading ? 'not-allowed' : 'pointer' }}>Cancel</button>
							<button disabled={isFieldLoading} onClick={handleUpdateProfile} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: 'orange', color: 'white', fontWeight: 'bold', cursor: isFieldLoading ? 'not-allowed' : 'pointer' }}>Save Profile</button>
						</div>
					</div>
				) : (
					<div style={{ position: 'relative' }}>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
							<div style={{ minWidth: '150px' }}>
								{/* Major */}
								{profileData.major && (isOwner || profileData?.profileConfig?.showMajor !== false) && ( // Only show if data exists AND (owner OR visible)
									<p style={{ margin: '5px 0', fontSize: '0.9rem', opacity: profileData?.profileConfig?.showMajor === false ? 0.6 : 1 }}>
										<strong>Major:</strong> {profileData.major}
										{isOwner && profileData?.profileConfig?.showMajor === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
									</p>
								)}
								{/* Minor */}
								{profileData.minor && (isOwner || profileData?.profileConfig?.showMinor !== false) && ( // Only show if data exists AND (owner OR visible)
									<p style={{ margin: '5px 0', fontSize: '0.9rem', opacity: profileData?.profileConfig?.showMinor === false ? 0.6 : 1 }}>
										<strong>Minor:</strong> {profileData.minor}
										{isOwner && profileData?.profileConfig?.showMinor === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
									</p>
								)}
							</div>
							<div style={{ minWidth: '150px' }}>
								{/* Graduation */}
								{profileData.gradSemester && (isOwner || profileData?.profileConfig?.showGraduation !== false) && ( // Only show if data exists AND (owner OR visible)
									<p style={{ margin: '5px 0', fontSize: '0.9rem', opacity: profileData?.profileConfig?.showGraduation === false ? 0.6 : 1 }}>
										<strong>Graduation:</strong> {profileData.gradSemester}
										{isOwner && profileData?.profileConfig?.showGraduation === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
									</p>
								)}
								{/* Website */}
								{profileData.website && (isOwner || profileData?.profileConfig?.showWebsite !== false) && ( // Only show if data exists AND (owner OR visible)
									<p style={{ margin: '5px 0', fontSize: '0.9rem', opacity: profileData?.profileConfig?.showWebsite === false ? 0.6 : 1 }}>
										<strong>website:</strong> <a href={profileData.website} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>View Repository</a>
										{isOwner && profileData?.profileConfig?.showWebsite === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
									</p>
								)}
							</div>
							{/* Bio */}
							{profileData.bio && (isOwner || profileData?.profileConfig?.showBio !== false) && ( // Only show if data exists AND (owner OR visible)
								<div style={{ flex: 1, minWidth: '200px', opacity: profileData?.profileConfig?.showBio === false ? 0.6 : 1 }}>
									<p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
										<strong>About Me:</strong>
										{isOwner && profileData?.profileConfig?.showBio === false && <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: '5px', fontStyle: 'italic' }}>(Hidden)</span>}
									</p>
									<p style={{ margin: '0', fontSize: '0.85rem', color: '#333' }}>
										{profileData.bio}
									</p>
								</div>
							)}
						</div>
						{isOwner && (
							<button 
								onClick={() => setIsEditingProfile(true)} 
								style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '5px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid orange', color: 'orange', backgroundColor: 'transparent', cursor: 'pointer' }}
							>
								Edit Details
							</button>
						)}
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
				</>
			)}
		</div>
	);
};

export default ProfilePage;