import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlaylistPage } from '../../hooks/usePlaylistPage';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import ReportButton from '../../components/ReportButton';
import Spinner from '../../components/Spinner';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/style.css';

const PlaylistPage = () => {
	const { theme } = useTheme();
	const [activeTab, setActiveTab] = useState('files');
	const [previewFile, setPreviewFile] = useState(null);
	const [playingId, setPlayingId] = useState(null);

	const {
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
	} = usePlaylistPage();

	if (!playlistData) {
		return <div className="status" style={{ textAlign: 'center', padding: '40px' }}><Spinner /> Loading playlist...</div>;
	}

	const membersMap = playlistData.members || {};
	const memberList = Object.keys(membersMap).map(uid => ({
		uid,
		...membersMap[uid]
	}));
	const totalMembersCount = memberList.length + 1; // Owner + invited members

	return (
		<div className="container" style={{ maxWidth: '1000px', margin: '30px auto', padding: '24px' }}>
			{/* Playlist Header */}
			<div className="class-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
				<div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
						<h1 style={{ margin: 0 }}>{playlistData.name}</h1>
						<span style={{
							fontSize: '0.75rem',
							fontWeight: 'bold',
							padding: '3px 10px',
							borderRadius: '12px',
							backgroundColor: '#ff4d4d',
							color: '#ffffff'
						}}>
							Private Playlist
						</span>
						<span style={{
							fontSize: '0.75rem',
							fontWeight: '600',
							padding: '3px 10px',
							borderRadius: '12px',
							backgroundColor: 'var(--bg-primary)',
							color: 'var(--text-muted)',
							border: '1px solid var(--border-color)'
						}}>
							{totalMembersCount} {totalMembersCount === 1 ? 'member' : 'members'}
						</span>
					</div>

					<p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
						Owner: <strong>{playlistData.ownerName || 'Unknown'}</strong> ({playlistData.ownerEmail || 'No email'})
						{!isOwner && <span style={{ marginLeft: '10px', color: 'var(--brand-color)', fontWeight: 'bold' }}>• Your Access: {userRole.toUpperCase()}</span>}
					</p>
				</div>

				{canUpload && (
					<div>
						<button className="add-content-btn" onClick={handleAddClick} disabled={uploading}>
							{uploading ? `Uploading (${uploadProgress}%)` : '+ Add File / Video'}
						</button>
						<input 
							type="file" 
							ref={fileInputRef} 
							onChange={handleFileChange} 
							style={{ display: 'none' }} 
						/>
					</div>
				)}
			</div>

			{/* Notifications */}
			{uploadError && (
				<div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
					<span>{uploadError}</span>
					<button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
				</div>
			)}

			{showUploadSuccess && (
				<div style={{ padding: '12px', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
					<span>Successfully uploaded <strong>{lastUploadedFile}</strong> to playlist!</span>
					<button onClick={() => setShowUploadSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
				</div>
			)}

			{/* Navigation Tabs */}
			<div className="playlist-tabs" style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>
				<button 
					className={`playlist-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
					onClick={() => setActiveTab('files')}
					style={{
						padding: '10px 20px',
						background: 'none',
						border: 'none',
						borderBottom: activeTab === 'files' ? '3px solid var(--brand-color)' : '3px solid transparent',
						fontWeight: '600',
						color: activeTab === 'files' ? 'var(--brand-color)' : 'var(--text-muted)',
						cursor: 'pointer',
						fontSize: '1rem'
					}}
				>
					Files & Videos ({files.length})
				</button>
				<button 
					className={`playlist-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
					onClick={() => setActiveTab('members')}
					style={{
						padding: '10px 20px',
						background: 'none',
						border: 'none',
						borderBottom: activeTab === 'members' ? '3px solid var(--brand-color)' : '3px solid transparent',
						fontWeight: '600',
						color: activeTab === 'members' ? 'var(--brand-color)' : 'var(--text-muted)',
						cursor: 'pointer',
						fontSize: '1rem'
					}}
				>
					Members & Permissions ({totalMembersCount})
				</button>
			</div>

			{/* TAB 1: FILES & VIDEOS LIST */}
			{activeTab === 'files' && (
				<div>
					{files.length > 0 ? (
						<ul className="file-list">
							{files.map((file) => (
								<li key={file.id} className="file-item">
									<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
										<div
											onClick={() => setPreviewFile(file)}
											title="Click thumbnail to preview"
											style={{ position: 'relative', cursor: 'pointer', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}
										>
											{file.thumbnailUrl ? (
												<img 
													src={file.thumbnailUrl} 
													alt="thumbnail" 
													style={{ width: '80px', height: '45px', objectFit: 'cover', display: 'block', border: '1px solid #ddd' }} 
												/>
											) : (
												<div className="thumbnail-placeholder" style={{ width: '80px', height: '45px' }}>
													{file.type?.startsWith('video/') ? 'VIDEO' : 'DOC'}
												</div>
											)}
										</div>

										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<a href={file.url} target="_blank" rel="noreferrer" className="file-link">
												{file.name}
											</a>

											{playingId === file.id && file.type?.startsWith('video/') && (
												<video src={file.url} controls autoPlay style={{ width: '100%', maxWidth: '480px', marginTop: '8px', borderRadius: '4px' }} />
											)}

											<span style={{ fontSize: '0.75rem', color: '#777' }}>
												Uploaded by <strong>{file.ownerName || 'Member'}</strong>
											</span>
										</div>
									</div>

									<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
										<ReportButton file={file} />
										{(canDeleteFiles || file.ownerId === user?.uid) && (
											<button 
												className="delete-btn" 
												onClick={() => setConfirmDelete(file)}
												style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
											>
												Delete
											</button>
										)}
									</div>
								</li>
							))}
						</ul>
					) : (
						<div className="status" style={{ textAlign: 'center', padding: '30px' }}>
							<p>No documents or videos added to this playlist yet.</p>
						</div>
					)}
				</div>
			)}

			{/* TAB 2: MEMBERS & PERMISSIONS */}
			{activeTab === 'members' && (
				<div>
					{/* Add Member Form (Owner only) */}
					{isOwner ? (
						<div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Invite User via Email</h3>
							
							{inviteError && (
								<div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>
									{inviteError}
								</div>
							)}
							{inviteSuccess && (
								<div style={{ padding: '10px', background: '#d1fae5', color: '#059669', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>
									{inviteSuccess}
								</div>
							)}

							<form onSubmit={handleInviteUser} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
								<input 
									type="email" 
									placeholder="Enter user email (e.g. classmate@example.com)" 
									value={inviteEmail} 
									onChange={(e) => setInviteEmail(e.target.value)}
									required
									style={{
										flex: 1,
										minWidth: '240px',
										padding: '10px 14px',
										borderRadius: '8px',
										border: '1px solid var(--border-color)',
										backgroundColor: 'var(--bg-secondary)',
										color: 'var(--text-main)',
										fontSize: '0.95rem'
									}}
								/>

								<select 
									value={inviteRole} 
									onChange={(e) => setInviteRole(e.target.value)}
									style={{
										padding: '10px 14px',
										borderRadius: '8px',
										border: '1px solid var(--border-color)',
										backgroundColor: 'var(--bg-secondary)',
										color: 'var(--text-main)',
										fontSize: '0.95rem',
										cursor: 'pointer'
									}}
								>
									<option value="view">View Only</option>
									<option value="upload">Can Upload</option>
									<option value="delete">Full Access (Upload & Delete)</option>
								</select>

								<button 
									type="submit" 
									className="create-class-btn"
									disabled={inviteLoading}
									style={{ padding: '10px 20px' }}
								>
									{inviteLoading ? 'Sending...' : 'Invite User'}
								</button>
							</form>
						</div>
					) : (
						<div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
							Only the playlist owner can invite new members or change permission settings.
						</div>
					)}

					{/* Members List Table */}
					<h3 style={{ marginBottom: '12px' }}>Playlist Members ({totalMembersCount})</h3>
					<div style={{ overflowX: 'auto' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
							<thead>
								<tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
									<th style={{ padding: '10px' }}>User</th>
									<th style={{ padding: '10px' }}>Role</th>
									<th style={{ padding: '10px' }}>Permissions</th>
									{isOwner && <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>}
								</tr>
							</thead>
							<tbody>
								{/* Owner Row */}
								<tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
									<td style={{ padding: '12px 10px', fontWeight: 'bold' }}>
										{playlistData.ownerName || 'Owner'}
										<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '6px' }}>
											({playlistData.ownerEmail || 'Owner'})
										</span>
									</td>
									<td style={{ padding: '12px 10px' }}>
										<span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', background: 'var(--brand-color)', color: '#fff' }}>
											OWNER
										</span>
									</td>
									<td style={{ padding: '12px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
										Full Administrative Control
									</td>
									{isOwner && <td></td>}
								</tr>

								{/* Invited Members Rows */}
								{memberList.map((mem) => (
									<tr key={mem.uid} style={{ borderBottom: '1px solid var(--border-soft)' }}>
										<td style={{ padding: '12px 10px' }}>
											{mem.name || mem.email}
											<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
												({mem.email})
											</span>
										</td>

										<td style={{ padding: '12px 10px' }}>
											{isOwner ? (
												<select 
													value={mem.role} 
													onChange={(e) => handleUpdateMemberRole(mem.uid, e.target.value)}
													style={{
														padding: '4px 8px',
														borderRadius: '6px',
														border: '1px solid var(--border-color)',
														backgroundColor: 'var(--bg-secondary)',
														color: 'var(--text-main)',
														fontSize: '0.85rem'
													}}
												>
													<option value="view">View Only</option>
													<option value="upload">Can Upload</option>
													<option value="delete">Can Delete</option>
												</select>
											) : (
												<span style={{ fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: '600' }}>
													{mem.role}
												</span>
											)}
										</td>

										<td style={{ padding: '12px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
											{mem.role === 'view' && 'View & preview files'}
											{mem.role === 'upload' && 'View & upload new files'}
											{mem.role === 'delete' && 'View, upload & delete files'}
										</td>

										{isOwner && (
											<td style={{ padding: '12px 10px', textAlign: 'right' }}>
												<button 
													className="delete-btn" 
													onClick={() => handleRemoveMember(mem.uid)}
													style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
												>
													Remove
												</button>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<DocumentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

			<ConfirmationModal 
				isOpen={!!confirmDelete}
				title="Delete File?"
				message={`Are you sure you want to delete ${confirmDelete?.name}?`}
				confirmText="Delete File"
				onConfirm={() => {
					handleDeleteFile(confirmDelete);
					setConfirmDelete(null);
				}}
				onCancel={() => setConfirmDelete(null)}
			/>
		</div>
	);
};

export default PlaylistPage;
