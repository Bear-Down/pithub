import React, { useState } from 'react';
import { useFavoritesPage } from '../../hooks/useFavoritesPage';
import ClassCard from '../../components/ClassCard';
import { Link, useNavigate } from 'react-router-dom';
import FavoriteButton from '../../components/FavoriteButton';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import ReportButton from '../../components/ReportButton';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const FavoritesPage = () => {
	const { loading, error, favoriteClasses, favoriteProfiles, favoriteUploads, fileCounts } = useFavoritesPage();
	const [viewMode, setViewMode] = useState('grid');
	const [previewFile, setPreviewFile] = useState(null);
	const navigate = useNavigate();

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

	if (loading) return <div className="container status">Loading your favorites...</div>;
	if (error) return <div className="container status" style={{ color: 'red' }}>Error: {error}</div>;

	return (
		<div className="container favorites-page">
			<h1 style={{ color: 'var(--brand-color)', marginBottom: '30px' }}>Your Favorites</h1>
			<p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
					Showing all favorite Profile Pages, Classes, and Files.
			</p>
			<section style={{ marginBottom: '40px' }}>
				<h2>Profiles</h2>
				{favoriteProfiles.length > 0 ? (
					<div className="classes-grid-view">
						{favoriteProfiles.map(profile => (
							<div key={profile.id} className="class-card">
								<div className="class-card-header">
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<h3 onClick={() => navigate(`/profile/${profile.id}`)} style={{ cursor: 'pointer', margin: 0 }}>
											{profile.displayName || 'User'}
										</h3>
										<FavoriteButton entityType="profile" entityId={profile.id} size="1rem" />
									</div>
								</div>
								<p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
									{profile.major || 'Major not specified'}
								</p>
								<div className="class-card-footer" style={{ marginTop: 'auto' }}>
									<button className="view-class-btn" onClick={() => navigate(`/profile/${profile.id}`)}>
										View Profile
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="status" style={{ textAlign: 'left', paddingLeft: 0 }}>No favorite profiles found.</p>
				)}
			</section>

			<section style={{ marginBottom: '40px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2>Classes</h2>
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
				</div>
				{favoriteClasses.length > 0 ? (
					<div className={viewMode === 'grid' ? 'classes-grid-view' : 'classes-list-view'}>
						{favoriteClasses.map(cls => (
							<ClassCard
								key={cls.id}
								classData={cls}
								isOwner={false}
								viewMode={viewMode}
								docCount={fileCounts[cls.id] || 0}
							/>
						))}
					</div>
				) : (
					<p className="status" style={{ textAlign: 'left', paddingLeft: 0 }}>No favorite classes found.</p>
				)}
			</section>

			<section style={{ marginBottom: '40px' }}>
				<h2>Documents and Videos</h2>
				{favoriteUploads.length > 0 ? (
					<ul className="file-list">
						{favoriteUploads.map(file => (
							<li key={file.id} className="file-item">
								<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
											<img src={file.thumbnailUrl} alt="thumb" style={{ width: '80px', height: '45px', objectFit: 'cover', display: 'block', border: '1px solid #ddd' }} />
										) : (
											<div className="thumbnail-placeholder" style={{ width: '80px', height: '45px' }}>
												{file.type?.startsWith('video/') ? 'VIDEO' : 'DOC'}
											</div>
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
										<span style={{ fontSize: '0.75rem', color: '#777' }}>
											{file.ownerId ? (
												<Link to={`/profile/${file.ownerId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
													{file.ownerName || 'Anonymous'}
												</Link>
											) : (
												file.ownerName || 'Anonymous'
											)}
											{' in '}
											{file.classId ? (
												<Link to={`/class/${file.classId}`} style={{ color: 'var(--link-color)', textDecoration: 'underline', fontWeight: '500' }}>
													{file.className || 'General'}
												</Link>
											) : (
												file.className || 'General'
											)}
											{` · ${file.views ?? 0} views`}
										</span>
									</div>
								</div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<FavoriteButton entityType="upload" entityId={file.id} />
									<ReportButton file={file} />
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="status" style={{ textAlign: 'left', paddingLeft: 0 }}>No favorite documents or videos found.</p>
				)}
			</section>

			<DocumentPreviewModal file={previewFile} onClose={handleClosePreview} />
		</div>
	);
};

export default FavoritesPage;
