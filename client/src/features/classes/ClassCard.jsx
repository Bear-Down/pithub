import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassCard = ({ classData, onEdit, onDelete, isOwner = true }) => {
	const navigate = useNavigate();
	return (
		<div className="class-card" onClick={() => navigate(`/class/${classData.id}`)} style={{ position: 'relative' }}>
			<h3>{classData.name}</h3>
			{/* Stop onclick() bubble up the DOM */}
			{isOwner && (
				<>
					<div className="card-actions" onClick={(e) => e.stopPropagation()}>
						<button className="edit-btn" onClick={() => onEdit(classData)}>Edit</button>
						<button className="delete-btn" onClick={() => onDelete(classData)}>Delete</button>
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
