import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVideos } from '../hooks/useVideos';
import { useTheme } from '../context/ThemeContext';
import ReportButton from './ReportButton';
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
			{previewFile && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						backgroundColor: 'rgba(0, 0, 0, 0.65)',
						backdropFilter: 'blur(8px)',
						WebkitBackdropFilter: 'blur(8px)',
						zIndex: 9999,
						display: 'flex',
						flexDirection: 'column',
						padding: '20px',
						boxSizing: 'border-box'
					}}
					onClick={handleClosePreview}
				>
					<div
						style={{
							backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
							borderRadius: '12px',
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden',
							boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div
							style={{
								padding: '14px 20px',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`,
								backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9fafb'
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
								<span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme === 'dark' ? '#f3f4f6' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									{previewFile.name}
								</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								<a
									href={previewFile.url}
									target="_blank"
									rel="noreferrer"
									style={{
										color: 'var(--brand-color)',
										fontSize: '0.85rem',
										fontWeight: '600',
										textDecoration: 'none'
									}}
								>
									Open in new tab ↗
								</a>
								<button
									onClick={handleClosePreview}
									style={{
										background: 'none',
										border: 'none',
										fontSize: '1.4rem',
										fontWeight: 'bold',
										color: theme === 'dark' ? '#9ca3af' : '#6b7280',
										cursor: 'pointer',
										lineHeight: '1px',
										padding: '4px 8px'
									}}
									title="Close Preview"
								>
									✕
								</button>
							</div>
						</div>

						{/* Modal Body - Iframe Preview */}
						<div style={{ flex: 1, backgroundColor: '#f3f4f6', position: 'relative' }}>
							{previewFile.type?.startsWith('video/') ? (
								<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
									<video
										src={previewFile.url}
										controls
										autoPlay
										style={{ maxWidth: '100%', maxHeight: '100%' }}
									/>
								</div>
							) : previewFile.type === 'application/pdf' ? (
								<iframe
									src={previewFile.url}
									title={previewFile.name}
									style={{ width: '100%', height: '100%', border: 'none' }}
								/>
							) : previewFile.type?.startsWith('image/') ? (
								<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
									<img
										src={previewFile.url}
										alt={previewFile.name}
										style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
									/>
								</div>
							) : (
								<iframe
									src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
									title={previewFile.name}
									style={{ width: '100%', height: '100%', border: 'none' }}
								/>
							)}
						</div>
					</div>
				</div>
			)}
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
