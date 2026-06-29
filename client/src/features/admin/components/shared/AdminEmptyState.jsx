import React from 'react';

export default function AdminEmptyState({ message = 'No records found.' }) {
	return (
		<div style={{ padding: '60px', textAlign: 'center' }}>
			<p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.2, fontStyle: 'italic' }}>
				{message}
			</p>
		</div>
	);
}
