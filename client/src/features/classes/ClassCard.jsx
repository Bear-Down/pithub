import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassCard = ({ classData, onEdit, onDelete, onVisibilityChange, isOwner = true }) => {
	const navigate = useNavigate();

	const handleVisibilityChange = (e) => {
		e.stopPropagation(); // Prevent card click from navigating
		onVisibilityChange(classData.id, e.target.value);
	};

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
					<div className="class-visibility-control" onClick={(e) => e.stopPropagation()}>
						<select value={classData.visibility || 'private'} onChange={handleVisibilityChange}>
							<option value="private">Private</option>
							<option value="public">Public</option>
						</select>
					</div>
				</>
			)}
		</div>
	);
};

export default ClassCard;
