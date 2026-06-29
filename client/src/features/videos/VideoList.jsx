import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVideos } from '../../hooks/useVideos';
import { useTheme } from '../../context/ThemeContext';
import ReportButton from '../../components/ReportButton';

export default function VideoList() {
	const { videos, loading, error, nextPage, prevPage, page, hasNext } = useVideos();
	const { theme } = useTheme();
	const [hoverPrev, setHoverPrev] = useState(false);
	const [hoverNext, setHoverNext] = useState(false);

	if (loading) return <div className="status">Loading uploads...</div>;
	if (error) return <div className="status" style={{ color: 'red' }}>Error: {error}</div>;
	if (videos.length === 0) return <div className="status">No uploads found.</div>;

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
								{video.ownerId ? (
									<Link to={`/profile/${video.ownerId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
										{video.ownerName || 'Anonymous'}
									</Link>
								) : (
									video.ownerName || 'Anonymous'
								)} in {video.className || 'General'}
							</span>
						</div>
					</div>
					<ReportButton file={video} />
				</li>
			))}
			</ul>
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
