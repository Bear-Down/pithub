import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ClassCard = ({
	classData,
	onEdit,
	onDelete,
	isOwner = true,
	viewMode = 'grid',
	docCount = 0
}) => {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const [hoverEdit, setHoverEdit] = useState(false);
	const [hoverDelete, setHoverDelete] = useState(false);

	const buttonStyle = {
		backgroundColor: theme === 'dark' ? '#374151' : undefined,
		color: theme === 'dark' ? '#f3f4f6' : undefined,
		border: theme === 'dark' ? '1px solid #4b5563' : undefined,
		transition: 'all 0.2s ease'
	};

	const visibilityBadge = (
		<span
			className="class-visibility-indicator"
			style={{
				fontSize: '0.7rem',
				padding: '2px 8px',
				borderRadius: '4px',
				fontWeight: 'bold',
				backgroundColor: classData?.visibility === 'public' ? '#28a745' : '#ff4d4d',
				color: classData?.visibility === 'public' ? '#ffffff' : 'var(--private-text)'
			}}
		>
			{classData?.visibility === 'public' ? 'Public' : 'Private'}
		</span>
	);

	const docCountLabel = (
		<div className="class-doc-count">
			{docCount} {docCount === 1 ? 'document' : 'documents'}
		</div>
	);

	if (viewMode === 'list') {
		return (
			<div className="class-list-item">
				<div className="class-list-info">
					<h3
						onClick={() => classData?.id && navigate(`/class/${classData.id}`)}
						style={{ cursor: 'pointer', margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}
					>
						{classData?.name}
					</h3>
					{isOwner && visibilityBadge}
					<div className="class-doc-count" style={{ margin: 0 }}>
						{docCount} {docCount === 1 ? 'doc' : 'docs'}
					</div>
				</div>

				<div className="class-list-actions" onClick={(e) => e.stopPropagation()}>
					<button
						className="view-class-btn"
						onClick={() => classData?.id && navigate(`/class/${classData.id}`)}
					>
						View Class
					</button>
					{isOwner && (
						<>
							{onEdit && (
								<button
									className="edit-btn"
									onClick={() => onEdit(classData)}
									onMouseEnter={() => setHoverEdit(true)}
									onMouseLeave={() => setHoverEdit(false)}
									style={{
										...buttonStyle,
										color: (theme === 'dark' && hoverEdit) ? '#3b82f6' : buttonStyle.color
									}}
								>
									Edit
								</button>
							)}
							{onDelete && (
								<button
									className="delete-btn"
									onClick={() => onDelete(classData)}
									onMouseEnter={() => setHoverDelete(true)}
									onMouseLeave={() => setHoverDelete(false)}
									style={{
										...buttonStyle,
										color: (theme === 'dark' && hoverDelete) ? '#ef4444' : buttonStyle.color
									}}
								>
									Delete
								</button>
							)}
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="class-card">
			<div className="class-card-header">
				<h3 onClick={() => classData?.id && navigate(`/class/${classData.id}`)} style={{ cursor: 'pointer' }}>
					{classData?.name}
				</h3>
				{isOwner && visibilityBadge}
			</div>

			{docCountLabel}

			<div className="class-card-footer" onClick={(e) => e.stopPropagation()}>
				<button
					className="view-class-btn"
					onClick={() => classData?.id && navigate(`/class/${classData.id}`)}
				>
					View
				</button>

				{isOwner && (
					<div className="card-actions">
						{onEdit && (
							<button
								className="edit-btn"
								onClick={() => onEdit(classData)}
								onMouseEnter={() => setHoverEdit(true)}
								onMouseLeave={() => setHoverEdit(false)}
								style={{
									...buttonStyle,
									color: (theme === 'dark' && hoverEdit) ? '#3b82f6' : buttonStyle.color
								}}
							>
								Edit
							</button>
						)}
						{onDelete && (
							<button
								className="delete-btn"
								onClick={() => onDelete(classData)}
								onMouseEnter={() => setHoverDelete(true)}
								onMouseLeave={() => setHoverDelete(false)}
								style={{
									...buttonStyle,
									color: (theme === 'dark' && hoverDelete) ? '#ef4444' : buttonStyle.color
								}}
							>
								Delete
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ClassCard;
