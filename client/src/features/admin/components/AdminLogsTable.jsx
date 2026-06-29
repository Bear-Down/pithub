import React from 'react';
import { format } from 'date-fns';
import { useAdminLogs } from '../hooks/useAdminLogs';
import AdminPagination from './shared/AdminPagination';
import AdminEmptyState from './shared/AdminEmptyState';

export default function AdminLogsTable() {
	const { items, loading, error, page, hasNext, nextPage, prevPage } = useAdminLogs();

	if (error) {
		return <p style={{ color: 'var(--admin-danger)' }}>{error}</p>;
	}

	return (
		<div className="admin-flex admin-flex-col">
			<div style={{ marginBottom: '24px' }}>
				<h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>
					Audit Trail
				</h2>
				<p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>
					All administrative actions with sign-off details and timestamps.
				</p>
			</div>

			<div className="admin-table-container" style={{ opacity: loading && items.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
				<table className="admin-table">
					<thead>
						<tr>
							<th>Action</th>
							<th>Target</th>
							<th>Performed By</th>
							<th>Reason</th>
							<th>Timestamp</th>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading audit logs...</td></tr>
						) : items.length === 0 ? (
							<tr><td colSpan="5"><AdminEmptyState message="No admin actions logged yet." /></td></tr>
						) : (
							items.map((log) => (
								<tr key={log.id}>
									<td>
										<span className="admin-badge">{log.action}</span>
									</td>
									<td>
										<div className="admin-flex admin-flex-col">
											<span style={{ fontWeight: 700, fontSize: '13px' }}>{log.targetName}</span>
											<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{log.targetId?.slice(0, 12)}</span>
										</div>
									</td>
									<td>
										<div className="admin-flex admin-flex-col">
											<span style={{ fontSize: '12px' }}>{log.performedBy}</span>
											<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{log.adminEmail}</span>
										</div>
									</td>
									<td>
										<span style={{ fontSize: '12px' }}>{log.reason}</span>
									</td>
									<td>
										<span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
											{log.timestamp ? format(log.timestamp.toDate(), 'MMM d, yyyy HH:mm') : 'N/A'}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<AdminPagination page={page} hasNext={hasNext} onPrev={prevPage} onNext={nextPage} loading={loading} />
		</div>
	);
}
