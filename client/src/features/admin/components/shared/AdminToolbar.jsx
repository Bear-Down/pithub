import React from 'react';

export default function AdminToolbar({ search, onSearchChange, placeholder = 'Search...', filters = null }) {
	return (
		<div className="admin-flex admin-items-center admin-justify-between" style={{ marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
			<input
				type="text"
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder={placeholder}
				className="admin-search-input"
			/>
			{filters}
		</div>
	);
}
