import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // adjust path if this differs in your project

/**
 * @file FeedbackTable.jsx
 * @description Admin panel view of messages submitted through the public
 *              Contact page's "Direct Support Message" form (feedback collection).
 */

const FeedbackTable = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
		const unsub = onSnapshot(
			q,
			(snap) => {
				setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
				setLoading(false);
			},
			(err) => {
				console.error('Failed to load feedback:', err);
				setError('Could not load messages.');
				setLoading(false);
			}
		);
		return () => unsub();
	}, []);

	const setStatus = async (id, status) => {
		try {
			await updateDoc(doc(db, 'feedback', id), { status });
		} catch (err) {
			console.error('Failed to update feedback status:', err);
		}
	};

	if (loading) {
		return (
			<div className="admin-flex admin-flex-col admin-items-center admin-justify-center" style={{ minHeight: '40vh' }}>
				<div className="admin-loading-spinner"></div>
				<p style={{ marginTop: '16px', fontWeight: 900, color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Loading Messages...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
				<p style={{ color: 'var(--admin-text-muted)' }}>{error}</p>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div style={{ border: '1px solid var(--admin-border-color)', padding: '48px', borderRadius: '24px', textAlign: 'center' }}>
				<p style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>No messages yet.</p>
			</div>
		);
	}

	return (
		<div style={{ border: '1px solid var(--admin-border-color)', borderRadius: '24px', overflow: 'hidden' }}>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr style={{ borderBottom: '1px solid var(--admin-border-color)' }}>
						{['FROM', 'SUBJECT', 'MESSAGE', 'STATUS', 'RECEIVED', ''].map((h) => (
							<th
								key={h}
								style={{
									textAlign: 'left',
									padding: '16px 20px',
									fontSize: '11px',
									fontWeight: 900,
									letterSpacing: '0.1em',
									color: 'var(--admin-text-muted)',
								}}
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border-color)' }}>
							<td style={{ padding: '16px 20px', color: 'var(--admin-text-main)', fontWeight: 700 }}>
								{item.userEmail || 'Anonymous'}
							</td>
							<td style={{ padding: '16px 20px', color: 'var(--admin-text-main)' }}>{item.subject}</td>
							<td style={{ padding: '16px 20px', color: 'var(--admin-text-muted)', maxWidth: '320px', wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
								{item.message}
							</td>
							<td style={{ padding: '16px 20px' }}>
								<span
									style={{
										padding: '4px 10px',
										borderRadius: '999px',
										fontSize: '11px',
										fontWeight: 900,
										textTransform: 'uppercase',
										backgroundColor:
											item.status === 'resolved' ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
										color: item.status === 'resolved' ? '#22c55e' : '#eab308',
									}}
								>
									{item.status === 'resolved' ? 'Resolved' : 'Open'}
								</span>
							</td>
							<td style={{ padding: '16px 20px', color: 'var(--admin-text-muted)' }}>
								{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '—'}
							</td>
							<td style={{ padding: '16px 20px' }}>
								<button
									className="create-class-btn"
									onClick={() => setStatus(item.id, item.status === 'resolved' ? 'open' : 'resolved')}
								>
									{item.status === 'resolved' ? 'Reopen' : 'Resolve'}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default FeedbackTable;