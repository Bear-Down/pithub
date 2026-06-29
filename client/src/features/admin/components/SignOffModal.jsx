import React, { useState, useEffect } from 'react';

const ACTION_CONFIG = {
	delete_file: {
		title: 'Delete File',
		confirmText: 'Permanently Delete File',
		confirmMessage: 'Are you absolutely sure you want to delete this file? This action cannot be undone.',
	},
	delete_class: {
		title: 'Delete Class',
		confirmText: 'Permanently Delete Class',
		confirmMessage: 'This will permanently delete the class and ALL files within it — including videos, documents, and storage assets. This decision cannot be reversed.',
	},
	resolve_report: {
		title: 'Resolve Report',
		confirmText: 'Dismiss Report',
		confirmMessage: 'Are you sure you want to dismiss this report without removing the content?',
	},
	suspend_user: {
		title: 'Suspend User',
		confirmText: 'Suspend Account',
		confirmMessage: 'This user will be unable to upload or create content until unsuspended. Continue?',
	},
	unsuspend_user: {
		title: 'Unsuspend User',
		confirmText: 'Restore Account',
		confirmMessage: 'This will restore the user\'s ability to upload and create content. Continue?',
	},
	update_user_role: {
		title: 'Change User Role',
		confirmText: 'Update Role',
		confirmMessage: 'Are you sure you want to change this user\'s role? They will gain or lose administrative access.',
	},
};

export default function SignOffModal({ isOpen, onClose, onSubmit, actionType, error, isSubmitting }) {
	const [confirmStep, setConfirmStep] = useState(false);
	const [adminName, setAdminName] = useState('');
	const [adminEmail, setAdminEmail] = useState('');
	const [reason, setReason] = useState('');

	const config = ACTION_CONFIG[actionType] || {
		title: 'Admin Action',
		confirmText: 'Confirm',
		confirmMessage: 'Are you sure you want to proceed with this action?',
	};

	useEffect(() => {
		if (!isOpen) {
			setConfirmStep(false);
			setAdminName('');
			setAdminEmail('');
			setReason('');
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleInitialSubmit = (e) => {
		e.preventDefault();
		if (!adminName || !adminEmail || !reason) return;
		setConfirmStep(true);
	};

	const handleFinalConfirm = async () => {
		await onSubmit(adminName, adminEmail, reason);
	};

	const handleClose = () => {
		setConfirmStep(false);
		onClose();
	};

	return (
		<div className="modal-backdrop">
			<div>
				<h2>{config.title} — Admin Sign-Off</h2>
				{confirmStep ? (
					<div style={{ padding: '24px' }}>
						<p style={{ marginBottom: '24px', lineHeight: 1.6 }}>{config.confirmMessage}</p>
						{error && <p className="text-red-500" style={{ color: 'var(--admin-danger)', marginBottom: '16px' }}>{error}</p>}
						<div className="flex justify-end">
							<button type="button" onClick={() => setConfirmStep(false)} disabled={isSubmitting}>Back</button>
							<button type="button" onClick={handleFinalConfirm} disabled={isSubmitting}>
								{isSubmitting ? 'Processing...' : config.confirmText}
							</button>
						</div>
					</div>
				) : (
					<form onSubmit={handleInitialSubmit}>
						<p style={{ marginBottom: '16px', lineHeight: 1.6 }}>
							Provide your name, school email, and a reason. This will be recorded in the audit log.
						</p>
						<div className="mb-4">
							<label htmlFor="adminName">Your Name</label>
							<input type="text" id="adminName" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
						</div>
						<div className="mb-4">
							<label htmlFor="adminEmail">Your School Email</label>
							<input type="email" id="adminEmail" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
						</div>
						<div className="mb-6">
							<label htmlFor="reason">Reason for Action</label>
							<textarea id="reason" rows="3" value={reason} onChange={(e) => setReason(e.target.value)} required />
						</div>
						{error && <p className="text-red-500" style={{ color: 'var(--admin-danger)' }}>{error}</p>}
						<div className="flex justify-end">
							<button type="button" onClick={handleClose}>Cancel</button>
							<button type="submit">Continue to Confirmation</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
