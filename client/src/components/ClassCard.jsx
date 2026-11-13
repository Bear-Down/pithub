import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FavoriteButton from './FavoriteButton';
import CustomizeClassModal from './CustomizeClassModal';

const ClassCard = ({
	classData,
	onEdit,
	onDelete,
	isOwner = true,
	viewMode = 'grid',
	docCount = 0,
	linkPrefix = '/class',
	onCustomize
}) => {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const [hoverDelete, setHoverDelete] = useState(false);
	const [hoverCustomize, setHoverCustomize] = useState(false);
	const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

	const hasCustomImage = Boolean(classData?.backgroundImage);
	const hasCustomColor = Boolean(classData?.backgroundColor);
	const hasCustomBackground = hasCustomImage || hasCustomColor;

	const visibilityBadge = (
		<span
			className="class-visibility-indicator"
			style={{
				fontSize: '0.7rem',
				padding: '2px 8px',
				borderRadius: '4px',
				fontWeight: 'bold',
				backgroundColor: classData?.visibility === 'public' ? '#28a745' : '#ff4d4d',
				color: '#ffffff',
				boxShadow: hasCustomBackground && viewMode === 'grid' ? '0 2px 4px rgba(0, 0, 0, 0.4)' : 'none',
				flexShrink: 0
			}}
		>
			{classData?.visibility === 'public' ? 'Public' : 'Private'}
		</span>
	);

	// =========================================================================
	// List View: Preset solid color on the left-hand side (border-left)
	// =========================================================================
	if (viewMode === 'list') {
		const listBorderColor = classData?.backgroundColor || '#C22033';

		return (
			<>
				<div 
					className="class-list-item"
					style={{
						borderLeft: `6px solid ${listBorderColor}`,
						cursor: 'pointer'
					}}
					onClick={() => classData?.id && navigate(`${linkPrefix}/${classData.id}`)}
				>
					<div className="class-list-info">
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
							<h3
								onClick={(e) => {
									e.stopPropagation();
									if (classData?.id) navigate(`${linkPrefix}/${classData.id}`);
								}}
								style={{ cursor: 'pointer', margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}
							>
								{classData?.name}
							</h3>

							{/* Small edit icon next to class name */}
							{isOwner && onEdit && (
								<button
									type="button"
									className="class-rename-btn"
									title="Rename class"
									onClick={(e) => {
										e.stopPropagation();
										onEdit(classData);
									}}
									aria-label="Rename class"
								>
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
							)}

							{!isOwner && classData?.id && (
								<FavoriteButton entityType="class" entityId={classData.id} size="1rem" />
							)}
						</div>

						{isOwner && visibilityBadge}

						<div className="class-doc-count" style={{ margin: 0 }}>
							{docCount} {docCount === 1 ? 'doc' : 'docs'}
						</div>
					</div>

					<div className="class-list-actions" onClick={(e) => e.stopPropagation()}>
						{isOwner && (
							<>
								<button
									type="button"
									className="customize-btn"
									title="Personalize background"
									onClick={(e) => {
										e.stopPropagation();
										setIsCustomizeModalOpen(true);
									}}
									onMouseEnter={() => setHoverCustomize(true)}
									onMouseLeave={() => setHoverCustomize(false)}
								>
									Edit
								</button>
								{onDelete && (
									<button
										type="button"
										className="delete-btn"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(classData);
										}}
										onMouseEnter={() => setHoverDelete(true)}
										onMouseLeave={() => setHoverDelete(false)}
										style={{
											backgroundColor: '#ff4d4d',
											color: '#ffffff'
										}}
									>
										Delete
									</button>
								)}
							</>
						)}
					</div>
				</div>

				{/* Personalize / Customize Modal */}
				{isOwner && (
					<CustomizeClassModal
						isOpen={isCustomizeModalOpen}
						classData={classData}
						onClose={() => setIsCustomizeModalOpen(false)}
						linkPrefix={linkPrefix}
						onSave={onCustomize}
					/>
				)}
			</>
		);
	}

	// Grid View: Customization ONLY affects top half (above the line)
	// The space with Customize and Delete buttons (below the line) goes unaffected
	const topHalfStyle = {
		backgroundImage: hasCustomImage ? `url("${classData.backgroundImage}")` : 'none',
		backgroundColor: hasCustomImage 
			? (classData?.backgroundColor || '#1e1e1e')
			: (hasCustomColor ? classData.backgroundColor : 'var(--bg-secondary)'),
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat'
	};

	const titleColor = hasCustomBackground ? '#ffffff' : 'var(--text-main)';
	const titleTextShadow = hasCustomBackground ? '0 1px 4px rgba(0, 0, 0, 0.85)' : 'none';

	const docCountStyle = hasCustomBackground ? {
		backgroundColor: 'rgba(0, 0, 0, 0.55)',
		color: '#f9fafb',
		border: '1px solid rgba(255, 255, 255, 0.25)',
		backdropFilter: 'blur(4px)',
		margin: 0
	} : {
		margin: 0
	};

	const deleteBtnStyle = {
		backgroundColor: '#ff4d4d',
		color: '#ffffff'
	};

	return (
		<>
			<div 
				className="class-card" 
				onClick={() => classData?.id && navigate(`${linkPrefix}/${classData.id}`)}
			>
				{/* Top Half (Above the line): Holds class name, edit icon, badge, and doc count */}
				<div className="class-card-top" style={topHalfStyle}>
					{/* Background Contrast Overlays */}
					{hasCustomImage && <div className="class-card-overlay" />}
					{!hasCustomImage && hasCustomColor && <div className="class-card-overlay-color" />}

					<div className="class-card-content">
						{/* Header: Class Name, Rename Icon, Visibility Badge */}
						<div className="class-card-header">
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
								<h3
									onClick={(e) => {
										e.stopPropagation();
										if (classData?.id) navigate(`${linkPrefix}/${classData.id}`);
									}}
									style={{ 
										cursor: 'pointer', 
										margin: 0,
										color: titleColor,
										textShadow: titleTextShadow
									}}
								>
									{classData?.name}
								</h3>

								{/* Small edit icon next to class name (stops propagation so card isn't opened) */}
								{isOwner && onEdit && (
									<button
										type="button"
										className={`class-rename-btn ${hasCustomBackground ? 'custom-bg' : ''}`}
										title="Rename class"
										onClick={(e) => {
											e.stopPropagation();
											onEdit(classData);
										}}
										aria-label="Rename class"
									>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</button>
								)}

								{!isOwner && classData?.id && (
									<FavoriteButton entityType="class" entityId={classData.id} size="1rem" />
								)}
							</div>

							{isOwner && visibilityBadge}
						</div>

						{/* Document Count */}
						<div className="class-doc-count" style={docCountStyle}>
							{docCount} {docCount === 1 ? 'document' : 'documents'}
						</div>
					</div>
				</div>

				{/* Bottom Half (Below the line): Unaffected footer area with Customize & Delete buttons */}
				<div className="class-card-footer" onClick={(e) => e.stopPropagation()}>
					{isOwner && (
						<div className="card-actions" style={{ marginLeft: 'auto' }}>
							<button
								type="button"
								className="customize-btn"
								title="Personalize background"
								onClick={(e) => {
									e.stopPropagation();
									setIsCustomizeModalOpen(true);
								}}
								onMouseEnter={() => setHoverCustomize(true)}
								onMouseLeave={() => setHoverCustomize(false)}
							>
								Edit
							</button>

							{onDelete && (
								<button
									type="button"
									className="delete-btn"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(classData);
									}}
									onMouseEnter={() => setHoverDelete(true)}
									onMouseLeave={() => setHoverDelete(false)}
									style={{
										...deleteBtnStyle,
										color: (theme === 'dark' && hoverDelete) ? '#ef4444' : '#ffffff'
									}}
								>
									Delete
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Personalize / Customize Modal */}
			{isOwner && (
				<CustomizeClassModal
					isOpen={isCustomizeModalOpen}
					classData={classData}
					onClose={() => setIsCustomizeModalOpen(false)}
					linkPrefix={linkPrefix}
					onSave={onCustomize}
				/>
			)}
		</>
	);
};

export default ClassCard;
