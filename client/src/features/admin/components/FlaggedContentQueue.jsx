import React, { useState } from 'react';
import { format } from 'date-fns';
import SignOffModal from './SignOffModal';
import { adminService } from '../services/adminService';

export default function FlaggedContentQueue({ flaggedItems }) {
	const [showSignOffModal, setShowSignOffModal] = useState(false);
	const [actionType, setActionType] = useState('');
	const [targetItem, setTargetItem] = useState(null);
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAction = (item, type) => {
		setTargetItem(item);
		setActionType(type);
		setShowSignOffModal(true);
		setModalError('');
	};

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			if (actionType === 'delete_file') {
				await adminService.deleteFile(targetItem.fileId, adminName, adminEmail, reason);
			} else if (actionType === 'resolve_report') {
				await adminService.resolveReport(targetItem.fileId, adminName, adminEmail, reason);
			}
			setShowSignOffModal(false);
		} catch (error) {
			console.error('Error performing admin action:', error);
			setModalError('Failed to complete action');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="admin-flex admin-flex-col">
		<div className="admin-flex admin-items-center admin-justify-between" style={{ marginBottom: '24px' }}>
			<div>
			<h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>Moderation Queue</h2>
			<p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>Reviewing pending community reports.</p>
			</div>
			<div className="admin-badge admin-badge-danger">Attention Required</div>
		</div>

		<div className="admin-table-container">
			<table className="admin-table">
			<thead>
				<tr>
				<th>Target Object</th>
				<th>Flags</th>
				<th>Last Activity</th>
				<th></th>
				</tr>
			</thead>
			<tbody>
				{flaggedItems.length === 0 ? (
				<tr>
					<td colSpan="4" style={{ padding: '60px', textAlign: 'center' }}>
					<p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.2, fontStyle: 'italic' }}>Moderation queue clear</p>
					</td>
				</tr>
				) : (
				flaggedItems.map((report) => (
					<tr key={report.fileId}>
					<td>
						<div className="admin-flex admin-flex-col">
						<span style={{ fontWeight: 700 }}>{report.fileName}</span>
						<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>Owner: {report.ownerName}</span>
						</div>
					</td>
					<td>
						<div className="admin-flex admin-items-center" style={{ gap: '8px' }}>
						<div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--admin-danger)' }}></div>
						<span style={{ fontWeight: 900, color: 'var(--admin-danger)', fontSize: '14px' }}>{report.reportCount} Reports</span>
						</div>
					</td>
					<td>
						<span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-text-muted)' }}>
						{report.latestReportedAt ? format(report.latestReportedAt.toDate(), 'MMM d, HH:mm') : 'N/A'}
						</span>
					</td>
					<td style={{ textAlign: 'right' }}>
						<div className="admin-flex" style={{ gap: '8px', justifyContent: 'flex-end' }}>
						<button onClick={() => handleAction(report, 'resolve_report')} className="admin-badge admin-badge-success" style={{ border: 'none', cursor: 'pointer' }}>Dismiss</button>
						<button onClick={() => handleAction(report, 'delete_file')} className="admin-badge admin-badge-danger" style={{ border: 'none', cursor: 'pointer' }}>Purge</button>
						</div>
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
			actionType={actionType}
			error={modalError}
			isSubmitting={isSubmitting}
		/>
		</div>
	);
}
