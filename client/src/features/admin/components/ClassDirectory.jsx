import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { useAdminClasses } from '../hooks/useAdminClasses';
import { adminService } from '../services/adminService';
import AdminToolbar from './shared/AdminToolbar';
import AdminPagination from './shared/AdminPagination';
import AdminEmptyState from './shared/AdminEmptyState';
import SignOffModal from './SignOffModal';

const db = getFirestore(app);

export default function ClassDirectory() {
	const { items, loading, error, page, hasNext, nextPage, prevPage, refresh } = useAdminClasses();
	const [search, setSearch] = useState('');
	const [visibilityFilter, setVisibilityFilter] = useState('all');
	const [expandedId, setExpandedId] = useState(null);
	const [fileCounts, setFileCounts] = useState({});
	const [signOff, setSignOff] = useState({ open: false, target: null });
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const filtered = useMemo(() => {
		const term = search.toLowerCase();
		return items.filter((cls) => {
			if (visibilityFilter !== 'all' && cls.visibility !== visibilityFilter) return false;
			if (!term) return true;
			return (
				cls.name?.toLowerCase().includes(term) ||
				cls.ownerName?.toLowerCase().includes(term) ||
				cls.id?.toLowerCase().includes(term)
			);
		});
	}, [items, search, visibilityFilter]);

	const loadFileCount = async (classId) => {
		if (fileCounts[classId] !== undefined) return;
		const count = await getCountFromServer(query(collection(db, 'files'), where('classId', '==', classId)));
		setFileCounts((prev) => ({ ...prev, [classId]: count.data().count }));
	};

	const toggleExpand = async (classId) => {
		if (expandedId === classId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(classId);
		await loadFileCount(classId);
	};

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			await adminService.deleteClass(signOff.target.id, adminName, adminEmail, reason);
			setSignOff({ open: false, target: null });
			refresh();
		} catch (err) {
			setModalError(err.message || 'Failed to delete class.');
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
				placeholder="Search by class name or owner..."
				filters={
					<select className="admin-select" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
						<option value="all">All Visibility</option>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</select>
				}
			/>

			<div className="admin-table-container" style={{ opacity: loading && items.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
				<table className="admin-table">
					<thead>
						<tr>
							<th>Class</th>
							<th>Owner</th>
							<th>Visibility</th>
							<th>Created</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading classes...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td colSpan="5"><AdminEmptyState message="No classes match your filters." /></td></tr>
						) : (
							filtered.map((cls) => (
								<React.Fragment key={cls.id}>
									<tr>
										<td>
											<span style={{ fontWeight: 700 }}>{cls.name}</span>
											<br />
											<span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>{cls.id.slice(0, 10)}</span>
										</td>
										<td>
											<div className="admin-flex admin-flex-col">
												<span style={{ fontSize: '13px' }}>{cls.ownerName}</span>
												<Link to={`/profile/${cls.ownerId}`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontSize: '10px' }}>
													View owner
												</Link>
											</div>
										</td>
										<td>
											<span className={`admin-badge ${cls.visibility === 'public' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
												{cls.visibility || 'private'}
											</span>
										</td>
										<td>
											<span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
												{cls.createdAt ? format(cls.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div className="admin-flex" style={{ gap: '6px', justifyContent: 'flex-end' }}>
												<button type="button" className="admin-action-btn" onClick={() => toggleExpand(cls.id)}>
													{expandedId === cls.id ? 'Hide' : 'Details'}
												</button>
												<button
													type="button"
													className="admin-action-btn admin-action-danger"
													onClick={() => { setSignOff({ open: true, target: cls }); setModalError(''); }}
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
									{expandedId === cls.id && (
										<tr>
											<td colSpan="5" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
												<div style={{ padding: '16px 8px' }}>
													<p style={{ fontSize: '12px', marginBottom: '8px' }}>
														<strong>Files in class:</strong> {fileCounts[cls.id] ?? '...'}
													</p>
													{cls.description && (
														<p style={{ fontSize: '12px', marginBottom: '8px' }}><strong>Description:</strong> {cls.description}</p>
													)}
													<Link to={`/class/${cls.id}`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontSize: '12px' }}>
														Open class page →
													</Link>
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
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
				actionType="delete_class"
				error={modalError}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
