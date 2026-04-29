import React from 'react';
import { useVideos } from '../../hooks/useVideos';

export default function VideoList() {
	const { videos, loading, error, nextPage, prevPage, page, hasNext } = useVideos();

	if (loading) return <div className="status">Loading videos...</div>;
	if (error) return <div className="status" style={{ color: 'red' }}>Error: {error}</div>;
	if (videos.length === 0) return <div className="status">No videos found.</div>;

	return (
		<>
			<ul className="file-list">
			{videos.map((video) => (
				<li key={video.id} className="file-item">
					<div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
						{video.thumbnailUrl ? (
							<img 
								src={video.thumbnailUrl} 
								alt="thumbnail" 
								style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
							/>
						) : (
							<div className="thumbnail-placeholder">DOC</div>
						)}
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<a href={video.url} target="_blank" rel="noreferrer" className="file-link">
								{video.name}
							</a>
							<span style={{ fontSize: '0.75rem', color: '#777' }}>
								{video.ownerName || 'Anonymous'} in {video.className || 'General'}
							</span>
						</div>
					</div>
				</li>
			))}
			</ul>
			<div className="pagination-controls">
				<button 
					className="pagination-btn" 
					onClick={prevPage} 
					disabled={page === 1}
				>
					Previous
				</button>
				<span className="page-indicator">Page {page}</span>
				<button 
					className="pagination-btn" 
					onClick={nextPage} 
					disabled={!hasNext}
				>
					Next
				</button>
			</div>
		</>
	);
}
