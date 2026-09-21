import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClassCard from '../../components/ClassCard';
import InputModal from '../../components/InputModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { usePlaylists } from '../../hooks/usePlaylists';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/style.css';

const PlaylistList = () => {
	const navigate = useNavigate();
	const { theme } = useTheme();

	const {
		playlists = [],
		fileCounts = {},
		viewMode = 'grid',
		setViewMode,
		confirmDelete,
		inputModal,
		isDeleting,
		handleCreatePlaylist,
		handleEditPlaylist,
		handleModalSubmit,
		handleDeletePlaylist,
		closeInputModal,
		setConfirmDeleteData,
		cancelDelete
	} = usePlaylists() || {};

	return (
		<div className="home-wrapper">
			<div className="classes-section" style={{ marginTop: '20px' }}>
				<div className="classes-header">
					<div>
						<h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--brand-color)' }}>Playlists</h1>
						<p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
							Private video & file collections shared with your team or group.
						</p>
					</div>

					<div className="classes-header-actions">
						<div className="view-toggle-group">
							<button 
								className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
								onClick={() => setViewMode('grid')}
								title="Grid View"
							>
								Grid
							</button>
							<button 
								className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
								onClick={() => setViewMode('list')}
								title="List View"
							>
								List
							</button>
						</div>
						<button className="create-class-btn" onClick={handleCreatePlaylist}>
							+ Create Playlist
						</button>
					</div>
				</div>

				{playlists && playlists.length > 0 ? (
					<div className={viewMode === 'grid' ? 'classes-grid-view' : 'classes-list-view'}>
						{playlists.map((item) => {
							const memberCount = Object.keys(item.members || {}).length + 1; // owner + invited members

							return (
								<div 
									key={item.id} 
									className="playlist-card-container"
									style={{ position: 'relative' }}
								>
									<div 
						
									>
										<span className={`playlist-role-badge ${item.isOwner ? 'owner' : 'shared'}`}>
											{item.isOwner ? 'Owner' : 'Shared with you'}
										</span>
										<span className="playlist-members-count-badge">
											{memberCount} {memberCount === 1 ? 'member' : 'members'}
										</span>
									</div>

									<ClassCard 
										classData={{
											...item
										}}
										onEdit={item.isOwner ? handleEditPlaylist : null}
										onDelete={item.isOwner ? setConfirmDeleteData : null}
										isOwner={item.isOwner}
										viewMode={viewMode}
										docCount={(fileCounts && item?.id && fileCounts[item.id]) || 0}
										linkPrefix="/playlist"
									/>
								</div>
							);
						})}
					</div>
				) : (
					<div className="status" style={{ textAlign: 'center', padding: '40px 20px' }}>
						<h3>No Playlists Found</h3>
						<p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
							Create your first playlist to share videos and documents with specific users via email!
						</p>
					</div>
				)}
			</div>

			<InputModal 
				isOpen={inputModal.isOpen}
				title={inputModal.mode === 'create' ? "Create New Playlist" : "Edit Playlist Name"}
				placeholder="Enter playlist title"
				initialValue={inputModal.data?.name || ""}
				onConfirm={handleModalSubmit}
				onCancel={closeInputModal}
				confirmText={inputModal.mode === 'create' ? "Create" : "Save Changes"}
			/>

			<ConfirmationModal 
				isOpen={!!confirmDelete}
				title="Delete Playlist?"
				message={
					<>
						Are you sure you want to delete playlist <strong>{confirmDelete?.name}</strong>? 
						<br /><br />
						<span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Warning:</span> This will permanently remove the playlist, all uploaded documents, and revoke access for all members.
					</>
				}
				confirmText={isDeleting ? 'Deleting...' : 'Delete Playlist'}
				isLoading={isDeleting}
				onConfirm={() => handleDeletePlaylist(confirmDelete)}
				onCancel={cancelDelete}
			/>
		</div>
	);
};

export default PlaylistList;
