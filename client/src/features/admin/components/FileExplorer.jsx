import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAdminFiles } from '../hooks/useAdminFiles';
import { adminService } from '../services/adminService';
import AdminToolbar from './shared/AdminToolbar';
import AdminPagination from './shared/AdminPagination';
import AdminEmptyState from './shared/AdminEmptyState';
import SignOffModal from './SignOffModal';

export default function FileExplorer() {
	const { items, loading, error, page, hasNext, nextPage, prevPage, refresh } = useAdminFiles();
	const [search, setSearch] = useState('');
	const [visibilityFilter, setVisibilityFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');
	const [signOff, setSignOff] = useState({ open: false, target: null });
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const filtered = useMemo(() => {
		const term = search.toLowerCase();
		return items.filter((file) => {
			if (visibilityFilter !== 'all' && file.visibility !== visibilityFilter) return false;
			if (typeFilter === 'video' && !file.type?.startsWith('video/')) return false;
			if (typeFilter === 'document' && file.type?.startsWith('video/')) return false;
			if (!term) return true;
			return (
				file.name?.toLowerCase().includes(term) ||
				file.ownerName?.toLowerCase().includes(term) ||
				file.className?.toLowerCase().includes(term)
			);
		});
	}, [items, search, visibilityFilter, typeFilter]);

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			await adminService.deleteFile(signOff.target.id, adminName, adminEmail, reason);
			setSignOff({ open: false, target: null });
			refresh();
		} catch (err) {
			setModalError(err.message || 'Failed to delete file.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (error) {
		return <p style={{ color: 'var(--admin-danger)' }}>{error}</p>;
	}

	return (
		<div className="admin-flex admin-flex-col">
			<AdminToolbar
				search={search}
				onSearchChange={setSearch}
				placeholder="Search by file name, owner, or class..."
				filters={
					<div className="admin-flex" style={{ gap: '8px' }}>
						<select className="admin-select" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
							<option value="all">All Visibility</option>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
						<select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
							<option value="all">All Types</option>
							<option value="video">Videos</option>
							<option value="document">Documents</option>
						</select>
					</div>
				}
			/>

			<div className="admin-table-container" style={{ opacity: loading && items.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
				<table className="admin-table">
					<thead>
						<tr>
							<th>File</th>
							<th>Owner / Class</th>
							<th>Type</th>
							<th>Visibility</th>
							<th>Uploaded</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading files...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td colSpan="6"><AdminEmptyState message="No files match your filters." /></td></tr>
						) : (
							filtered.map((file) => (
								<tr key={file.id}>
									<td>
										<a href={file.url} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontWeight: 700 }}>
											{file.name}
										</a>
										<br />
										<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{file.id.slice(0, 10)}</span>
									</td>
									<td>
										<div className="admin-flex admin-flex-col">
											<span style={{ fontSize: '12px' }}>{file.ownerName}</span>
											<Link to={`/class/${file.classId}`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontSize: '10px' }}>
												{file.className}
											</Link>
										</div>
									</td>
									<td>
										<span style={{ fontSize: '11px', textTransform: 'uppercase' }}>
											{file.type?.split('/')[0] || 'file'}
										</span>
									</td>
									<td>
										<span className={`admin-badge ${file.visibility === 'public' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
											{file.visibility}
										</span>
									</td>
									<td>
										<span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
											{file.createdAt ? format(file.createdAt.toDate(), 'MMM d, HH:mm') : 'N/A'}
										</span>
									</td>
									<td style={{ textAlign: 'right' }}>
										<button
											type="button"
											className="admin-action-btn admin-action-danger"
											onClick={() => { setSignOff({ open: true, target: file }); setModalError(''); }}
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

			<AdminPagination page={page} hasNext={hasNext} onPrev={prevPage} onNext={nextPage} loading={loading} />

			<SignOffModal
				isOpen={signOff.open}
				onClose={() => setSignOff({ open: false, target: null })}
				onSubmit={handleSignOffSubmit}
				actionType="delete_file"
				error={modalError}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
