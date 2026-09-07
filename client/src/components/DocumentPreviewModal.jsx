import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DocumentPreviewModal({ file, onClose }) {
	const { theme } = useTheme();

	if (!file) return null;

	return (
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
			onClick={onClose}
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
							{file.name}
						</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<a
							href={file.url}
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
							onClick={onClose}
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
					{file.type?.startsWith('video/') ? (
						<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
							<video 
								src={file.url} 
								controls 
								autoPlay 
								style={{ maxWidth: '100%', maxHeight: '100%' }}
							/>
						</div>
					) : file.type === 'application/pdf' ? (
						<iframe 
							src={file.url} 
							title={file.name}
							style={{ width: '100%', height: '100%', border: 'none' }}
						/>
					) : file.type?.startsWith('image/') ? (
						<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
							<img 
								src={file.url} 
								alt={file.name}
								style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
							/>
						</div>
					) : (
						<iframe 
							src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`} 
							title={file.name}
							style={{ width: '100%', height: '100%', border: 'none' }}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
