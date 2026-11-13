import React, { useState } from 'react';
import ClassCard from '../../components/ClassCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import ReportButton from '../../components/ReportButton';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { useProfilePage } from '../../hooks/useProfilePage';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import FavoriteButton from '../../components/FavoriteButton';
import userIconFallback from '../../assets/user-icon.jpg';
import '../../styles/Profile.css';

const BANNER_PRESETS = [
	{ label: 'Lewis Crimson', value: '#C22033' },
	{ label: 'Navy Blue', value: '#1e3a8a' },
	{ label: 'Royal Blue', value: '#2563eb' },
	{ label: 'Emerald Green', value: '#15803d' },
	{ label: 'Slate Charcoal', value: '#334155' },
	{ label: 'Royal Purple', value: '#6b21a8' },
	{ label: 'Burnt Orange', value: '#c2410c' },
	{ label: 'Midnight Black', value: '#0f172a' }
];

const ProfilePage = () => {
	const [confirmPrivacyChange, setConfirmPrivacyChange] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const {
		user,
		effectiveUserId,
		profileData,
		classes = [],
		fileCounts = {},
		viewMode = 'grid',
		setViewMode,
		recentFiles = [],
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
		handleCancelEdit,
		handleDeleteClass,
		handleToggleFieldVisibility,
		isGlobalLoading,
		isFieldLoading
	} = useProfilePage() || {};

	const handleFileClick = async (fileId) => {
		try {
			const fileRef = doc(db, 'files', fileId);
			await updateDoc(fileRef, {
				views: increment(1)
			});
		} catch (err) {
			console.error('Failed to update view count:', err);
		}
	};

	const handleOpenPreview = (file) => {
		if (file?.id) {
			handleFileClick(file.id);
		}
		setPreviewFile(file);
	};

	const handleClosePreview = () => {
		setPreviewFile(null);
	};

	// Compute Banner Background
	const bannerColor = isEditingProfile 
		? (profileEditData?.bannerColor || profileData?.bannerColor || '#C22033')
		: (profileData?.bannerColor || '#C22033');

	const bannerImage = isEditingProfile
		? (profileEditData?.bannerImage ?? profileData?.bannerImage ?? '')
		: (profileData?.bannerImage || '');

	const bannerType = isEditingProfile
		? (profileEditData?.bannerType || (bannerImage ? 'image' : 'color'))
		: (profileData?.bannerType || (bannerImage ? 'image' : 'color'));

	const bannerStyle = {
		backgroundColor: bannerColor,
		backgroundImage: (bannerType === 'image' && bannerImage) ? `url("${bannerImage}")` : 'none',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat'
	};

	// Circular Google Avatar Source
	const avatarSrc = profileData?.photoURL || (isOwner ? user?.photoURL : null) || userIconFallback;

	// Field Visibility and Content checks
	const isMajorVisible = (profileData?.profileConfig?.showMajor !== false) && Boolean(profileData?.major?.trim());
	const isMinorVisible = (profileData?.profileConfig?.showMinor !== false) && Boolean(profileData?.minor?.trim());
	const isWebsiteVisible = (profileData?.profileConfig?.showWebsite !== false) && Boolean(profileData?.website?.trim());
	const isBioVisible = (profileData?.profileConfig?.showBio !== false) && Boolean(profileData?.bio?.trim());

	const hasLeftContent = isMajorVisible || isMinorVisible || isWebsiteVisible;
	const hasRightContent = isBioVisible;
	const hasAnyContent = hasLeftContent || hasRightContent;

	return (
		<div className="profile-page-wrapper">
			{isGlobalLoading && <LoadingOverlay message="Updating Profile & Class Privacy..." />}

			{/* ==========================================================================
			   Top Centered Profile Card
			   ========================================================================== */}
			<div className="profile-card">
				{/* Wide Banner Area */}
				<div className="profile-banner" style={bannerStyle}>
					<div className="profile-banner-overlay" />
					{isEditingProfile && (
						<div className="banner-edit-badge">
							<span>Banner Preview</span>
						</div>
					)}
				</div>

				{/* Header Section: Avatar, Full Name, Actions */}
				<div className="profile-card-header">
					{/* Circular Google-associated Profile Picture (Read-Only) */}
					<div className="profile-avatar-wrapper">
						<img 
							src={avatarSrc} 
							alt="Profile" 
							className="profile-avatar-img"
							onError={(e) => { e.currentTarget.src = userIconFallback; }}
						/>
					</div>

					{/* Full Name (Read-Only) */}
					<h1 className="profile-full-name">
						{profileData?.displayName || (isOwner ? user?.displayName : null) || 'User'}
					</h1>

					{/* Actions Row: Public Profile indicator and Edit Profile button */}
					<div className="profile-action-row">
						{isOwner ? (
							<button 
								type="button"
								className={`profile-indicator-badge clickable ${profileData?.visibility === 'public' ? 'status-public' : 'status-private'}`}
								onClick={() => setConfirmPrivacyChange(true)}
								disabled={isGlobalLoading}
								title="Click to toggle profile privacy"
							>
								<span className="profile-status-dot" />
								<span>{isGlobalLoading ? 'Updating...' : (profileData?.visibility === 'public' ? 'Public Profile' : 'Private Profile')}</span>
							</button>
						) : (
							<span className="profile-indicator-badge status-public">
								<span className="profile-status-dot" />
								<span>Public Profile</span>
							</span>
						)}

						{isOwner && !isEditingProfile && (
							<button 
								type="button"
								className="profile-edit-btn"
								onClick={() => setIsEditingProfile(true)}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
								</svg>
								Edit Profile
							</button>
						)}

						{!isOwner && <FavoriteButton entityType="profile" entityId={effectiveUserId} />}
					</div>
				</div>

				<div className="profile-card-divider" />

				{/* Two-Column Information (View Mode vs Edit Mode) */}
				{isEditingProfile ? (
					/* ==========================================================================
					   Edit Profile Mode
					   ========================================================================== */
					<div className="profile-edit-container">
						{/* Banner Customization Controls */}
						<div className="profile-banner-customizer">
							<div className="banner-customizer-header">
								<h3 className="banner-customizer-title">
									Banner Area Background
								</h3>
								<div className="banner-type-toggle">
									<button
										type="button"
										className={`banner-type-btn ${bannerType === 'color' ? 'active' : ''}`}
										onClick={() => setProfileEditData({ ...profileEditData, bannerType: 'color', bannerImage: '' })}
									>
										Solid Color
									</button>
									<button
										type="button"
										className={`banner-type-btn ${bannerType === 'image' ? 'active' : ''}`}
										onClick={() => setProfileEditData({ ...profileEditData, bannerType: 'image' })}
									>
										Background Image
									</button>
								</div>
							</div>

							{bannerType === 'color' ? (
								<div className="banner-color-controls">
									<div className="color-presets-row">
										{BANNER_PRESETS.map((preset) => (
											<button
												key={preset.value}
												type="button"
												className={`color-swatch-btn ${bannerColor.toLowerCase() === preset.value.toLowerCase() ? 'active' : ''}`}
												style={{ backgroundColor: preset.value }}
												title={preset.label}
												onClick={() => setProfileEditData({
													...profileEditData,
													bannerColor: preset.value,
													bannerType: 'color',
													bannerImage: ''
												})}
											/>
										))}
									</div>
									<div className="color-custom-input-row">
										<label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Custom Color:</label>
										<input 
											type="color" 
											value={bannerColor.startsWith('#') && bannerColor.length === 7 ? bannerColor : '#C22033'} 
											className="color-picker-input"
											onChange={(e) => setProfileEditData({
												...profileEditData,
												bannerColor: e.target.value,
												bannerType: 'color',
												bannerImage: ''
											})}
											title="Choose custom color"
										/>
										<input 
											type="text" 
											value={profileEditData.bannerColor || ''} 
											placeholder="#C22033"
											className="color-hex-input"
											onChange={(e) => setProfileEditData({
												...profileEditData,
												bannerColor: e.target.value,
												bannerType: 'color',
												bannerImage: ''
											})}
										/>
									</div>
								</div>
							) : (
								<div className="banner-image-controls">
									<div className="banner-image-action-row">
										<label className="banner-upload-label">
											Upload Image
											<input 
												type="file" 
												accept="image/*" 
												style={{ display: 'none' }}
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														if (file.size > 800000) {
															alert("Image file size should be less than 800KB.");
															return;
														}
														const reader = new FileReader();
														reader.onload = (ev) => {
															setProfileEditData({
																...profileEditData,
																bannerImage: ev.target.result,
																bannerType: 'image'
															});
														};
														reader.readAsDataURL(file);
													}
												}}
											/>
										</label>
										{profileEditData.bannerImage && (
											<button 
												type="button" 
												className="banner-clear-btn"
												onClick={() => setProfileEditData({
													...profileEditData,
													bannerImage: '',
													bannerType: 'color'
												})}
											>
												Remove Image (Use Solid Color)
											</button>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Edit Fields (Left Column: Major, Minor, Website / Right Column: Bio) */}
						<div className="profile-edit-grid">
							{/* Major */}
							<div className="profile-edit-field">
								<div className="profile-edit-label-row">
									<label className="profile-edit-label">Major</label>
									<button 
										type="button"
										onClick={() => handleToggleFieldVisibility('showMajor')}
										disabled={isFieldLoading} 
										className={`visibility-toggle-btn ${profileData?.profileConfig?.showMajor !== false ? 'visible' : 'hidden'}`}
										title="Toggle visibility on your public profile"
									>
										{profileData?.profileConfig?.showMajor !== false ? 'Visible' : 'Hidden'}
									</button>
								</div>
								<input 
									type="text" 
									value={profileEditData.major || ''} 
									onChange={(e) => setProfileEditData({ ...profileEditData, major: e.target.value })} 
									placeholder="Major..." 
									className="profile-edit-input" 
								/>
							</div>

							{/* Minor */}
							<div className="profile-edit-field">
								<div className="profile-edit-label-row">
									<label className="profile-edit-label">Minor</label>
									<button 
										type="button"
										onClick={() => handleToggleFieldVisibility('showMinor')}
										disabled={isFieldLoading} 
										className={`visibility-toggle-btn ${profileData?.profileConfig?.showMinor !== false ? 'visible' : 'hidden'}`}
										title="Toggle visibility on your public profile"
									>
										{profileData?.profileConfig?.showMinor !== false ? 'Visible' : 'Hidden'}
									</button>
								</div>
								<input 
									type="text" 
									value={profileEditData.minor || ''} 
									onChange={(e) => setProfileEditData({ ...profileEditData, minor: e.target.value })} 
									placeholder="Minor..." 
									className="profile-edit-input" 
								/>
							</div>

							{/* Website / Repository Link */}
							<div className="profile-edit-field full-width">
								<div className="profile-edit-label-row">
									<label className="profile-edit-label">Website / Repository Link</label>
									<button 
										type="button"
										onClick={() => handleToggleFieldVisibility('showWebsite')}
										disabled={isFieldLoading} 
										className={`visibility-toggle-btn ${profileData?.profileConfig?.showWebsite !== false ? 'visible' : 'hidden'}`}
										title="Toggle visibility on your public profile"
									>
										{profileData?.profileConfig?.showWebsite !== false ? 'Visible' : 'Hidden'}
									</button>
								</div>
								<input 
									type="text" 
									value={profileEditData.website || ''} 
									onChange={(e) => setProfileEditData({ ...profileEditData, website: e.target.value })} 
									placeholder="https://github.com/your-username or personal link" 
									className="profile-edit-input" 
								/>
							</div>

							{/* Bio / About Me */}
							<div className="profile-edit-field full-width">
								<div className="profile-edit-label-row">
									<label className="profile-edit-label">Bio / About Me</label>
									<button 
										type="button"
										onClick={() => handleToggleFieldVisibility('showBio')}
										disabled={isFieldLoading} 
										className={`visibility-toggle-btn ${profileData?.profileConfig?.showBio !== false ? 'visible' : 'hidden'}`}
										title="Toggle visibility on your public profile"
									>
										{profileData?.profileConfig?.showBio !== false ? 'Visible' : 'Hidden'}
									</button>
								</div>
								<textarea 
									value={profileEditData.bio || ''} 
									onChange={(e) => setProfileEditData({ ...profileEditData, bio: e.target.value })} 
									placeholder="Tell us about yourself, your projects, or interests..." 
									className="profile-edit-textarea" 
								/>
							</div>
						</div>

						{/* Edit Actions: Cancel & Save */}
						<div className="profile-edit-actions">
							<button 
								type="button"
								disabled={isFieldLoading} 
								onClick={handleCancelEdit} 
								className="profile-cancel-btn"
							>
								Cancel
							</button>
							<button 
								type="button"
								disabled={isFieldLoading} 
								onClick={handleUpdateProfile} 
								className="profile-save-btn"
							>
								Save Profile
							</button>
						</div>
					</div>
				) : (
					/* ==========================================================================
					   View Mode: Two Columns (Left: Major, Minor, Website / Right: Bio)
					   Only show enabled fields, dynamically rearranging to avoid empty spaces
					   ========================================================================== */
					hasAnyContent ? (
						<div className={`profile-info-grid ${(!hasLeftContent || !hasRightContent) ? 'single-column' : ''}`}>
							{/* Left Column: Major, Minor, Website / Repository */}
							{hasLeftContent && (
								<div className="profile-col-left">
									{isMajorVisible && (
										<div className="profile-field-block">
											<span className="profile-field-label">Major</span>
											<span className="profile-field-value">{profileData.major}</span>
										</div>
									)}

									{isMinorVisible && (
										<div className="profile-field-block">
											<span className="profile-field-label">Minor</span>
											<span className="profile-field-value">{profileData.minor}</span>
										</div>
									)}

									{isWebsiteVisible && (
										<div className="profile-field-block">
											<span className="profile-field-label">Website / Repository</span>
											<a 
												href={profileData.website.startsWith('http://') || profileData.website.startsWith('https://') 
													? profileData.website 
													: `https://${profileData.website}`}
												target="_blank" 
												rel="noreferrer"
												className="profile-link-value"
											>
												{profileData.website}
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
													<polyline points="15 3 21 3 21 9"></polyline>
													<line x1="10" y1="14" x2="21" y2="3"></line>
												</svg>
											</a>
										</div>
									)}
								</div>
							)}

							{/* Right Column: Bio / About Me */}
							{hasRightContent && (
								<div className="profile-col-right">
									<div className="profile-bio-block">
										<span className="profile-field-label">Bio / About Me</span>
										<p className="profile-bio-text">{profileData.bio}</p>
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="profile-empty-notice">
							<p style={{ margin: 0 }}>
								{isOwner ? "No profile details are currently visible." : "No public profile details shared."}
							</p>
							{isOwner && (
								<button 
									type="button" 
									className="profile-edit-btn" 
									onClick={() => setIsEditingProfile(true)}
									style={{ marginTop: '4px' }}
								>
									Add Details
								</button>
							)}
						</div>
					)
				)}
			</div>

			{/* ==========================================================================
			   "Your Recent Files & Videos" Section
			   ========================================================================== */}
			<section className="profile-section-card">
				<h2 className="profile-section-title">
					{isOwner ? 'Your Recent Files & Videos' : 'Recent Files & Videos'}
				</h2>

				{recentFiles.length > 0 ? (
					<>
						<ul className="file-list" style={{ padding: 0 }}>
							{recentFiles.map(file => (
								<li key={file.id} className="file-item">
									<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
										{/* Thumbnail with preview indicator */}
										<div 
											onClick={() => handleOpenPreview(file)}
											title="Click thumbnail to preview document"
											style={{ 
												position: 'relative', 
												cursor: 'pointer', 
												display: 'inline-block',
												flexShrink: 0,
												borderRadius: '4px',
												overflow: 'hidden'
											}}
											className="thumbnail-wrapper"
										>
											{file.thumbnailUrl ? (
												<img src={file.thumbnailUrl} alt="thumb" style={{ width: '60px', height: '35px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
											) : (
												<div className="thumbnail-placeholder" style={{ width: '60px', height: '35px' }}>DOC</div>
											)}
											<div 
												style={{
													position: 'absolute',
													top: 0,
													left: 0,
													width: '100%',
													height: '100%',
													backgroundColor: 'rgba(0, 0, 0, 0.4)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													color: '#fff',
													fontSize: '0.65rem',
													fontWeight: 'bold',
													opacity: 0.9,
													transition: 'opacity 0.2s ease',
													pointerEvents: 'none'
												}}
											>
												🔍
											</div>
										</div>

										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<a 
												href={file.url} 
												target="_blank" 
												rel="noreferrer" 
												className="file-link"
												onClick={() => handleFileClick(file.id)}
											>
												{file.name}
											</a>
											<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
												{file.ownerName || 'Anonymous'} in {file.className || 'General'} · {file.views ?? 0} views
											</span>
										</div>
									</div>
									{!isOwner && <ReportButton file={file} />}
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
					<p className="status" style={{ padding: '8px 0' }}>{isOwner ? "You haven't uploaded anything yet." : "No public uploads found."}</p>
				)}
			</section>

			{/* Document Preview Modal */}
			<DocumentPreviewModal file={previewFile} onClose={handleClosePreview} />

			{/* ==========================================================================
			   "Your Classes" Section
			   ========================================================================== */}
			<section className="profile-section-card">
				<div className="profile-section-header">
					<h2 className="profile-section-title">{isOwner ? 'Your Classes' : 'Classes'}</h2>
					<div className="classes-header-actions">
						<div className="view-toggle-group">
							<button 
								className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
								onClick={() => setViewMode('grid')}
								title="Grid View (Boxes)"
							>
								Grid
							</button>
							<button 
								className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
								onClick={() => setViewMode('list')}
								title="List View (Stacked)"
							>
								List
							</button>
						</div>
						{isOwner && (
							<button className="create-class-btn" onClick={handleCreateClass}>+ Create Class</button>
						)}
					</div>
				</div>
				{classes.length > 0 ? (
					<div className={viewMode === 'grid' ? 'classes-grid-view' : 'classes-list-view'}>
						{classes.map((item) => (
							<ClassCard 
								key={item.id} 
								classData={item} 
								onEdit={isOwner ? handleEditClass : null}
								onDelete={isOwner ? (data) => setConfirmDelete(data) : null}
								isOwner={isOwner}
								viewMode={viewMode}
								docCount={(fileCounts && item?.id && fileCounts[item.id]) || 0}
							/>
						))}
					</div>
				) : (
					<p className="status" style={{ padding: '8px 0' }}>{isOwner ? "You haven't created any classes yet." : "No public classes found."}</p>
				)}
			</section>

			{/* Modals for Owner */}
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
						isOpen={confirmPrivacyChange}
						title="Change Profile Privacy?"
						message={
							profileData.visibility === 'public'
							? "Are you sure you want to make your profile private? Other users will no longer be able to view your public profile."
							: "Are you sure you want to make your profile public? Other users will be able to view the information you've chosen to share."
						}
						confirmText="Yes, Change Privacy"
						onConfirm={() => {
							setConfirmPrivacyChange(false);
							handleProfileVisibilityChange(profileData.visibility);
						}}
						onCancel={() => setConfirmPrivacyChange(false)}
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
