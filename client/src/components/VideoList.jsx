import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVideos } from '../hooks/useVideos';
import { useTheme } from '../context/ThemeContext';
import ReportButton from './ReportButton';
import DocumentPreviewModal from './DocumentPreviewModal';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from "../lib/firebase";

export default function VideoList() {
	const { videos, loading, error, nextPage, prevPage, page, hasNext } = useVideos();
	const { theme } = useTheme();
	const [hoverPrev, setHoverPrev] = useState(false);
	const [hoverNext, setHoverNext] = useState(false);
	const [playingId, setPlayingId] = useState(null);
	const [previewFile, setPreviewFile] = useState(null);

	const handleVideoClick = async (videoId) => {
		try {
			const videoRef = doc(db, 'files', videoId);
			await updateDoc(videoRef, {
				views: increment(1)
			});
		} catch (err) {
			console.error('Failed to update view count:', err);
		}
	};

	const handleOpenPreview = (file) => {
		handleVideoClick(file.id);
		setPreviewFile(file);
	};

	const handleClosePreview = () => {
		setPreviewFile(null);
	};

	if (loading) return <div className="status">Loading uploads...</div>;
	if (error) return <div className="status" style={{ color: 'red' }}>Error: {error}</div>;
	if (videos.length === 0) return <div className="status">No uploads found.</div>;

	return (
		<>
			<ul className="file-list">
				{videos.map((video) => (
					<li key={video.id} className="file-item">
						<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
							{/* Thumbnail with preview indicator */}
							<div
								onClick={() => handleOpenPreview(video)}
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
								{video.thumbnailUrl ? (
									<img
										src={video.thumbnailUrl}
										alt="thumbnail"
										style={{ width: '80px', height: '45px', objectFit: 'cover', display: 'block', border: '1px solid #ddd' }}
									/>
								) : (
									<div className="thumbnail-placeholder" style={{ width: '80px', height: '45px' }}>
										{video.type?.startsWith('video/') ? 'VIDEO' : 'DOC'}
									</div>
								)}
								{/* Indicator overlay */}
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
									href={video.url}
									target="_blank"
									rel="noreferrer"
									className="file-link"
									onClick={() => handleVideoClick(video.id)}
								>
									{video.name}
								</a>

								{playingId === video.id && video.type?.startsWith('video/') && (
									<video
										src={video.url}
										controls
										autoPlay
										style={{ width: '100%', maxWidth: '480px', marginTop: '8px', borderRadius: '4px' }}
									/>
								)}

								<span style={{ fontSize: '0.75rem', color: '#777' }}>
									{video.ownerId ? (
										<Link to={`/profile/${video.ownerId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
											{video.ownerName || 'Anonymous'}
										</Link>
									) : (
										video.ownerName || 'Anonymous'
									)} in {video.className || 'General'} · {video.views ?? 0} views
								</span>
							</div>
						</div>
						<ReportButton file={video} />
					</li>
				))}
			</ul>

			{/* Fullscreen Overlay Document Preview Modal */}
			<DocumentPreviewModal file={previewFile} onClose={handleClosePreview} />
			<div className="pagination-controls">
				<button
					className="pagination-btn"
					onClick={prevPage}
					disabled={page === 1}
					onMouseEnter={() => setHoverPrev(true)}
					onMouseLeave={() => setHoverPrev(false)}
					style={{
						backgroundColor: theme === 'dark' ? '#374151' : undefined,
						color: (theme === 'dark' && hoverPrev) ? '#3b82f6' : (theme === 'dark' ? '#f3f4f6' : undefined),
						border: theme === 'dark'
							? (hoverPrev ? '1px solid #3b82f6' : '1px solid #4b5563')
							: undefined,
						opacity: page === 1 ? 0.5 : 1,
						transition: 'all 0.2s ease'
					}}
				>
					Previous
				</button>
				<span className="page-indicator" style={{ color: theme === 'dark' ? '#f3f4f6' : 'inherit' }}>
					Page {page}
				</span>
				<button
					className="pagination-btn"
					onClick={nextPage}
					disabled={!hasNext}
					onMouseEnter={() => setHoverNext(true)}
					onMouseLeave={() => setHoverNext(false)}
					style={{
						backgroundColor: theme === 'dark' ? '#374151' : undefined,
						color: (theme === 'dark' && hoverNext) ? '#3b82f6' : (theme === 'dark' ? '#f3f4f6' : undefined),
						border: theme === 'dark'
							? (hoverNext ? '1px solid #3b82f6' : '1px solid #4b5563')
							: undefined,
						opacity: !hasNext ? 0.5 : 1,
						transition: 'all 0.2s ease'
					}}
				>
					Next
				</button>
			</div>
		</>
	);
}
