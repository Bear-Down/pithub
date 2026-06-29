import React, { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import SignOffModal from './SignOffModal';
import { adminService } from '../services/adminService';

const RecentUploadsTable = ({ uploads }) => {
	const [showSignOffModal, setShowSignOffModal] = useState(false);
	const [targetFile, setTargetFile] = useState(null);
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleDeleteClick = (file) => {
		setTargetFile(file);
		setShowSignOffModal(true);
		setModalError('');
	};

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			await adminService.deleteFile(targetFile.id, adminName, adminEmail, reason);
			setShowSignOffModal(false);
			setTargetFile(null);
		} catch (error) {
			console.error('Error deleting file:', error);
			setModalError('Failed to delete file');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="admin-flex admin-flex-col">
		<div style={{ marginBottom: '24px' }}>
			<h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>Global Activity</h2>
			<p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>Monitoring recent file indexing events.</p>
		</div>

		<div className="admin-table-container">
			<table className="admin-table">
			<thead>
				<tr>
				<th>Object Identity</th>
				<th>Origin</th>
				<th>Visibility</th>
				<th>Timestamp</th>
				<th></th>
				</tr>
			</thead>
			<tbody>
				{uploads.length === 0 ? (
				<tr>
					<td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}>
					<p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.2, fontStyle: 'italic' }}>No recent activity detected</p>
					</td>
				</tr>
				) : (
				uploads.map((file) => (
					<tr key={file.id}>
                        <td>
                            {file.visibility === 'public' ? (
                                <Link to={file.url} target="_blank" rel="noopener" className="admin-link" style={{ color: 'var(--admin-link-color)' }}>{file.name}</Link>
                            ) : (
                                <span>{file.name}</span>
                            )}
                            <br />
                            <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{file.id.slice(0, 8)}</span>
                        </td>
					<td>
						<div className="admin-flex admin-flex-col">
						<span style={{ fontWeight: 700, fontSize: '12px' }}>{file.ownerName}</span>
						<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{file.className}</span>
						</div>
					</td>
					<td>
						<span className={"admin-badge " + (file.visibility === 'public' ? 'admin-badge-success' : 'admin-badge-warning')}>
						{file.visibility}
						</span>
					</td>
					<td>
						<span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-text-muted)' }}>
						{file.createdAt ? format(file.createdAt.toDate(), 'MMM d, HH:mm') : 'N/A'}
						</span>
					</td>
					<td style={{ textAlign: 'right' }}>
						<button 
						onClick={() => handleDeleteClick(file)}
						className="dropdown-item logout"
						style={{ border: 'none', padding: '6px 12px', fontSize: '10px', borderRadius: '8px', display: 'inline-block', width: 'auto' }}
						>
						Purge
						</button>
					</td>
					</tr>
				))
				)}
			</tbody>
			</table>
		</div>

		<SignOffModal
			isOpen={showSignOffModal}
			onClose={() => setShowSignOffModal(false)}
			onSubmit={handleSignOffSubmit}
			actionType="delete_file"
			error={modalError}
			isSubmitting={isSubmitting}
		/>
		</div>
	);
};

export default RecentUploadsTable;
