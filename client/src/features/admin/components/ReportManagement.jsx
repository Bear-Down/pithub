import React, { useState } from 'react';
import { format } from 'date-fns';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { useAdminReports } from '../hooks/useAdminReports';
import { adminService } from '../services/adminService';
import AdminPagination from './shared/AdminPagination';
import AdminEmptyState from './shared/AdminEmptyState';
import SignOffModal from './SignOffModal';

const db = getFirestore(app);

function ReportTable({ status, onAction }) {
	const { items, loading, error, page, hasNext, nextPage, prevPage } = useAdminReports(status);
	const [expandedId, setExpandedId] = useState(null);
	const [fileDetails, setFileDetails] = useState({});

	const loadFileDetails = async (fileId) => {
		if (fileDetails[fileId]) return;
		const fileDoc = await getDoc(doc(db, 'files', fileId));
		setFileDetails((prev) => ({
			...prev,
			[fileId]: fileDoc.exists() ? { id: fileDoc.id, ...fileDoc.data() } : null,
		}));
	};

	const toggleExpand = async (fileId) => {
		if (expandedId === fileId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(fileId);
		await loadFileDetails(fileId);
	};

	if (error) return <p style={{ color: 'var(--admin-danger)' }}>{error}</p>;

	return (
		<>
			<div className="admin-table-container" style={{ opacity: loading && items.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
				<table className="admin-table">
					<thead>
						<tr>
							<th>File</th>
							<th>Reports</th>
							<th>Last Activity</th>
							{status === 'resolved' && <th>Resolution</th>}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td colSpan={status === 'resolved' ? 5 : 4} style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</td></tr>
						) : items.length === 0 ? (
							<tr><td colSpan={status === 'resolved' ? 5 : 4}><AdminEmptyState message={`No ${status} reports.`} /></td></tr>
						) : (
							items.map((report) => {
								const file = fileDetails[report.fileId];
								const reporters = report.reporters ? Object.entries(report.reporters) : [];
								return (
									<React.Fragment key={report.fileId}>
										<tr>
											<td>
												<span style={{ fontWeight: 700 }}>{file?.name || report.fileId.slice(0, 12)}</span>
												{file && (
													<>
														<br />
														<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>Owner: {file.ownerName}</span>
													</>
												)}
											</td>
											<td>
												<span className="admin-badge admin-badge-danger">{report.reportCount} Reports</span>
											</td>
											<td>
												<span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
													{report.latestReportedAt ? format(report.latestReportedAt.toDate(), 'MMM d, HH:mm') : 'N/A'}
												</span>
											</td>
											{status === 'resolved' && (
												<td>
													<span className={`admin-badge ${report.resolution === 'purged' ? 'admin-badge-danger' : 'admin-badge-success'}`}>
														{report.resolution || 'resolved'}
													</span>
												</td>
											)}
											<td style={{ textAlign: 'right' }}>
												<div className="admin-flex" style={{ gap: '6px', justifyContent: 'flex-end' }}>
													<button type="button" className="admin-action-btn" onClick={() => toggleExpand(report.fileId)}>
														{expandedId === report.fileId ? 'Hide' : 'Details'}
													</button>
													{status === 'pending' && (
														<>
															<button type="button" className="admin-action-btn admin-action-success" onClick={() => onAction(report, 'resolve_report')}>
																Dismiss
															</button>
															<button type="button" className="admin-action-btn admin-action-danger" onClick={() => onAction(report, 'delete_file')}>
																Purge
															</button>
														</>
													)}
												</div>
											</td>
										</tr>
										{expandedId === report.fileId && (
											<tr>
												<td colSpan={status === 'resolved' ? 5 : 4} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
													<div style={{ padding: '16px 8px' }}>
														{file && (
															<p style={{ fontSize: '12px', marginBottom: '12px' }}>
																<a href={file.url} target="_blank" rel="noopener noreferrer" className="admin-link">Open file</a>
																{' · '}{file.className} · {file.visibility}
															</p>
														)}
														{report.reason && (
															<p style={{ fontSize: '12px', marginBottom: '8px' }}><strong>Admin reason:</strong> {report.reason}</p>
														)}
														<p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5, marginBottom: '8px' }}>Reporters</p>
														{reporters.length === 0 ? (
															<p style={{ fontSize: '12px', opacity: 0.5 }}>No reporter details available.</p>
														) : (
															<ul style={{ margin: 0, paddingLeft: '20px' }}>
																{reporters.map(([uid, data]) => (
																	<li key={uid} style={{ fontSize: '12px', marginBottom: '6px' }}>
																		<strong>{data.email}</strong> — {data.reason}
																		{data.timestamp && (
																			<span style={{ color: 'var(--admin-text-muted)' }}> ({format(data.timestamp.toDate(), 'MMM d, HH:mm')})</span>
																		)}
																	</li>
																))}
															</ul>
														)}
													</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								);
							})
						)}
					</tbody>
				</table>
			</div>
			<AdminPagination page={page} hasNext={hasNext} onPrev={prevPage} onNext={nextPage} loading={loading} />
		</>
	);
}

export default function ReportManagement() {
	const [activeTab, setActiveTab] = useState('pending');
	const [signOff, setSignOff] = useState({ open: false, action: '', target: null });
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAction = (report, action) => {
		setSignOff({ open: true, action, target: report });
		setModalError('');
	};

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			if (signOff.action === 'delete_file') {
				await adminService.deleteFile(signOff.target.fileId, adminName, adminEmail, reason);
			} else if (signOff.action === 'resolve_report') {
				await adminService.resolveReport(signOff.target.fileId, adminName, adminEmail, reason);
			}
			setSignOff({ open: false, action: '', target: null });
		} catch (err) {
			setModalError(err.message || 'Action failed.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="admin-flex admin-flex-col">
			<div className="admin-flex" style={{ gap: '8px', marginBottom: '24px' }}>
				{['pending', 'resolved', 'analytics'].map((tab) => (
					<button
						key={tab}
						type="button"
						className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab === 'pending' ? 'Pending Queue' : tab === 'resolved' ? 'Resolved' : 'Analytics'}
					</button>
				))}
			</div>

			{activeTab === 'pending' && <ReportTable status="pending" onAction={handleAction} />}
			{activeTab === 'resolved' && <ReportTable status="resolved" onAction={handleAction} />}
			{activeTab === 'analytics' && (
				<div className="admin-table-container" style={{ padding: '60px', textAlign: 'center' }}>
					<p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>
						Platform Analytics
					</p>
					<h3 style={{ fontSize: '18px', marginTop: '16px', opacity: 0.4 }}>
						Upload trends, engagement metrics, and distribution charts coming soon.
					</h3>
				</div>
			)}

			<SignOffModal
				isOpen={signOff.open}
				onClose={() => setSignOff({ open: false, action: '', target: null })}
				onSubmit={handleSignOffSubmit}
				actionType={signOff.action}
				error={modalError}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
