import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../../lib/firebase';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { adminService } from '../services/adminService';
import AdminToolbar from './shared/AdminToolbar';
import AdminPagination from './shared/AdminPagination';
import AdminEmptyState from './shared/AdminEmptyState';
import SignOffModal from './SignOffModal';

const db = getFirestore(app);

const matchesSearch = (user, term) => {
	if (!term) return true;
	const q = term.toLowerCase();
	return (
		user.email?.toLowerCase().includes(q) ||
		user.displayName?.toLowerCase().includes(q) ||
		user.id?.toLowerCase().includes(q)
	);
};

export default function UserDirectory() {
	const { items, loading, error, page, hasNext, nextPage, prevPage, refresh } = useAdminUsers();
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [expandedId, setExpandedId] = useState(null);
	const [userStats, setUserStats] = useState({});
	const [signOff, setSignOff] = useState({ open: false, action: '', target: null, newRole: null });
	const [modalError, setModalError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const filtered = useMemo(() => {
		return items.filter((user) => {
			if (!matchesSearch(user, search)) return false;
			if (roleFilter !== 'all' && (user.role || 'user') !== roleFilter) return false;
			if (statusFilter === 'active' && user.isSuspended) return false;
			if (statusFilter === 'suspended' && !user.isSuspended) return false;
			return true;
		});
	}, [items, search, roleFilter, statusFilter]);

	const loadUserStats = async (userId) => {
		if (userStats[userId]) return;
		const [classesCount, filesCount] = await Promise.all([
			getCountFromServer(query(collection(db, 'classes'), where('ownerId', '==', userId))),
			getCountFromServer(query(collection(db, 'files'), where('ownerId', '==', userId))),
		]);
		setUserStats((prev) => ({
			...prev,
			[userId]: {
				classes: classesCount.data().count,
				files: filesCount.data().count,
			},
		}));
	};

	const toggleExpand = async (userId) => {
		if (expandedId === userId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(userId);
		await loadUserStats(userId);
	};

	const openSignOff = (action, target, newRole = null) => {
		setSignOff({ open: true, action, target, newRole });
		setModalError('');
	};

	const handleSignOffSubmit = async (adminName, adminEmail, reason) => {
		setIsSubmitting(true);
		setModalError('');
		try {
			const { action, target, newRole } = signOff;
			if (action === 'suspend_user') {
				await adminService.suspendUser(target.id, adminName, adminEmail, reason);
			} else if (action === 'unsuspend_user') {
				await adminService.unsuspendUser(target.id, adminName, adminEmail, reason);
			} else if (action === 'update_user_role') {
				await adminService.updateUserRole(target.id, newRole, adminName, adminEmail, reason);
			}
			setSignOff({ open: false, action: '', target: null, newRole: null });
			refresh();
		} catch (err) {
			setModalError(err.message || 'Action failed.');
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
				placeholder="Search by name or email..."
				filters={
					<div className="admin-flex" style={{ gap: '8px' }}>
						<select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
							<option value="all">All Roles</option>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
						<select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="suspended">Suspended</option>
						</select>
					</div>
				}
			/>

			<div className="admin-table-container" style={{ opacity: loading && items.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
				<table className="admin-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Role</th>
							<th>Status</th>
							<th>Last Login</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
						) : filtered.length === 0 ? (
							<tr><td colSpan="5"><AdminEmptyState message="No users match your filters." /></td></tr>
						) : (
							filtered.map((user) => (
								<React.Fragment key={user.id}>
									<tr>
										<td>
											<div className="admin-flex admin-flex-col">
												<span style={{ fontWeight: 700 }}>{user.displayName || 'Unknown'}</span>
												<span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{user.email}</span>
											</div>
										</td>
										<td>
											<span className={`admin-badge ${user.role === 'admin' ? 'admin-badge-warning' : ''}`}>
												{user.role || 'user'}
											</span>
										</td>
										<td>
											<span className={`admin-badge ${user.isSuspended ? 'admin-badge-danger' : 'admin-badge-success'}`}>
												{user.isSuspended ? 'Suspended' : 'Active'}
											</span>
										</td>
										<td>
											<span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
												{user.lastLogin ? format(user.lastLogin.toDate(), 'MMM d, yyyy') : 'N/A'}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div className="admin-flex" style={{ gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
												<button type="button" className="admin-action-btn" onClick={() => toggleExpand(user.id)}>
													{expandedId === user.id ? 'Hide' : 'Details'}
												</button>
												{user.isSuspended ? (
													<button type="button" className="admin-action-btn admin-action-success" onClick={() => openSignOff('unsuspend_user', user)}>
														Unsuspend
													</button>
												) : (
													<button type="button" className="admin-action-btn admin-action-danger" onClick={() => openSignOff('suspend_user', user)}>
														Suspend
													</button>
												)}
												{user.role === 'admin' ? (
													<button type="button" className="admin-action-btn" onClick={() => openSignOff('update_user_role', user, 'user')}>
														Demote
													</button>
												) : (
													<button type="button" className="admin-action-btn admin-action-warning" onClick={() => openSignOff('update_user_role', user, 'admin')}>
														Promote
													</button>
												)}
											</div>
										</td>
									</tr>
									{expandedId === user.id && (
										<tr>
											<td colSpan="5" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
												<div style={{ padding: '16px 8px' }}>
													<p style={{ fontSize: '12px', marginBottom: '8px' }}>
														<strong>UID:</strong> {user.id}
													</p>
													<p style={{ fontSize: '12px', marginBottom: '8px' }}>
														<strong>Classes owned:</strong> {userStats[user.id]?.classes ?? '...'} · <strong>Files uploaded:</strong> {userStats[user.id]?.files ?? '...'}
													</p>
													{user.suspensionReason && (
														<p style={{ fontSize: '12px', color: 'var(--admin-danger)' }}>
															<strong>Suspension reason:</strong> {user.suspensionReason}
														</p>
													)}
													<Link to={`/profile/${user.id}`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontSize: '12px' }}>
														View student profile →
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
				onClose={() => setSignOff({ open: false, action: '', target: null, newRole: null })}
				onSubmit={handleSignOffSubmit}
				actionType={signOff.action}
				error={modalError}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
