import React from 'react';
import { useFavorite } from '../hooks/useFavorite';
 
// Usage: <FavoriteButton entityType="class" entityId={classId} />
// entityType is one of: 'profile' | 'class' | 'upload'
const FavoriteButton = ({ entityType, entityId, size = '1.1rem' }) => {
	const { isFavorited, toggleFavorite, loading } = useFavorite(entityType, entityId);
 
	const handleClick = (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (!loading) toggleFavorite();
	};
 
	return (
		<button
			onClick={handleClick}
			disabled={loading}
			title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
			style={{
				background: 'none',
				border: 'none',
				cursor: loading ? 'not-allowed' : 'pointer',
				fontSize: size,
				lineHeight: 1,
				padding: '4px',
				color: isFavorited ? '#ffb400' : 'var(--text-main)',
			}}
		>
			{isFavorited ? '★' : '☆'}
		</button>
	);
};
 
export default FavoriteButton;