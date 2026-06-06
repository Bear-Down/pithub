import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const ClassCard = ({ classData, onEdit, onDelete, isOwner = true }) => {
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

	return (
		<div className="class-card" onClick={() => navigate(`/class/${classData.id}`)} style={{ position: 'relative' }}>
			<h3>{classData.name}</h3>
			{/* Stop onclick() bubble up the DOM */}
			{isOwner && (
				<>
					<div className="card-actions" onClick={(e) => e.stopPropagation()}>
						<button 
							className="edit-btn" 
							onClick={() => onEdit(classData)}
							onMouseEnter={() => setHoverEdit(true)}
							onMouseLeave={() => setHoverEdit(false)}
							style={{ ...buttonStyle, color: hoverEdit ? '#3b82f6' : buttonStyle.color, boxShadow: hoverEdit ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none' }}
						>Edit</button>
						<button 
							className="delete-btn" 
							onClick={() => onDelete(classData)}
							onMouseEnter={() => setHoverDelete(true)}
							onMouseLeave={() => setHoverDelete(false)}
							style={{ 
								...buttonStyle, 
								color: hoverDelete ? '#ef4444' : buttonStyle.color, 
								boxShadow: hoverDelete ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none' 
							}}
						>Delete</button>
					</div>
					<div 
						className="class-visibility-indicator" 
						style={{ 
							position: 'absolute', 
							top: '10px', 
							right: '10px', 
							fontSize: '0.7rem', 
							padding: '2px 6px', 
							borderRadius: '4px', 
							fontWeight: 'bold',
							backgroundColor: classData.visibility === 'public' ? '#28a745' : '#ff4d4d',
							color: classData.visibility === 'public' ? '#ffffff' : 'var(--private-text)'
						}}
					>
						{classData.visibility === 'public' ? 'Public' : 'Private'}
					</div>
				</>
			)}
		</div>
	);
};

export default ClassCard;
