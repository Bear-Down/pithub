import React from 'react';
import ClassCard from '../classes/ClassCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';
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
		handleUpdateClassVisibility,
		handleProfileVisibilityChange,
		handleUpdateProfile,
		handleDeleteClass
	} = useProfilePage();

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

			<div className="profile-info-section" style={{ marginTop: '15px', padding: '15px'}}>
				{isEditingProfile ? (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Major</label>
							<input type="text" value={profileEditData.major} onChange={(e) => setProfileEditData({...profileEditData, major: e.target.value})} placeholder="Major..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Minor</label>
							<input type="text" value={profileEditData.minor} onChange={(e) => setProfileEditData({...profileEditData, minor: e.target.value})} placeholder="Minor..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Expected Graduation</label>
							<input type="text" value={profileEditData.gradSemester} onChange={(e) => setProfileEditData({...profileEditData, gradSemester: e.target.value})} placeholder="Spring 2027" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Your URL</label>
							<input type="text" value={profileEditData.website} onChange={(e) => setProfileEditData({...profileEditData, website: e.target.value})} placeholder="https://your-link" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
						</div>
						<div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Bio</label>
							<textarea value={profileEditData.bio} onChange={(e) => setProfileEditData({...profileEditData, bio: e.target.value})} placeholder="Tell us about yourself..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
						</div>
						<div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
							<button onClick={() => setIsEditingProfile(false)} style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
							<button onClick={handleUpdateProfile} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: 'orange', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Profile</button>
						</div>
					</div>
				) : (
					<div style={{ position: 'relative' }}>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
							<div style={{ minWidth: '150px' }}>
								<p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Major:</strong> {profileData.major || 'Not specified'}</p>
								<p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Minor:</strong> {profileData.minor || 'None'}</p>
							</div>
							<div style={{ minWidth: '150px' }}>
								<p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Graduation:</strong> {profileData.gradSemester || 'Not specified'}</p>
								{profileData.website && (
									<p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
										<strong>website:</strong> <a href={profileData.website} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>View Repository</a>
									</p>
								)}
							</div>
							<div style={{ flex: 1, minWidth: '200px' }}>
								<p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>About Me:</strong></p>
								<p style={{ margin: '0', fontSize: '0.85rem', fontStyle: profileData.bio ? 'normal' : 'italic', color: profileData.bio ? '#333' : '#999' }}>
									{profileData.bio || 'No bio provided yet.'}
								</p>
							</div>
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