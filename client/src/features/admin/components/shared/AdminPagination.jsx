import React from 'react';

export default function AdminPagination({ page, hasNext, onPrev, onNext, loading }) {
	return (
		<div className="admin-flex admin-items-center admin-justify-between" style={{ marginTop: '16px' }}>
			<button
				type="button"
				className="create-class-btn"
				onClick={onPrev}
				disabled={page <= 1 || loading}
				style={{ padding: '8px 16px', fontSize: '10px', opacity: page <= 1 ? 0.4 : 1 }}
			>
				Previous
			</button>
			<span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-text-muted)' }}>
				Page {page}
			</span>
			<button
				type="button"
				className="create-class-btn"
				onClick={onNext}
				disabled={!hasNext || loading}
				style={{ padding: '8px 16px', fontSize: '10px', opacity: !hasNext ? 0.4 : 1 }}
			>
				Next
			</button>
		</div>
	);
}
