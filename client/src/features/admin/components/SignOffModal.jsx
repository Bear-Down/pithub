import React, { useState } from 'react';

/**
 * @file SignOffModal.jsx
 * @description A reusable modal component for admin actions requiring a sign-off.
 *              It collects the admin's name, email, and a reason for the action,
 *              which is then used for the audit log.
 */

export default function SignOffModal({ isOpen, onClose, onSubmit, actionType, error }) {
	const [adminName, setAdminName] = useState('');
	const [adminEmail, setAdminEmail] = useState('');
	const [reason, setReason] = useState('');

	if (!isOpen) return null;

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!adminName || !adminEmail || !reason) {
		// Basic client-side validation
		return;
		}
		onSubmit(adminName, adminEmail, reason);
	};

	const getActionTitle = () => {
		switch (actionType) {
		case 'delete_file': return 'Delete File';
		case 'delete_class': return 'Delete Class';
		case 'resolve_report': return 'Resolve Report';
		case 'suspend_user': return 'Suspend User';
		default: return 'Admin Action';
		}
	};

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
		<div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{getActionTitle()} - Admin Sign-Off</h2>
			<p className="text-gray-700 dark:text-gray-300 mb-6">
			Please provide your name, school email, and a reason for this action. This will be recorded in the audit log.
			</p>
			<form onSubmit={handleSubmit}>
			<div className="mb-4">
				<label htmlFor="adminName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
				Your Name
				</label>
				<input
				type="text"
				id="adminName"
				className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
				value={adminName}
				onChange={(e) => setAdminName(e.target.value)}
				required
				/>
			</div>
			<div className="mb-4">
				<label htmlFor="adminEmail" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
				Your School Email
				</label>
				<input
				type="email"
				id="adminEmail"
				className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
				value={adminEmail}
				onChange={(e) => setAdminEmail(e.target.value)}
				required
				/>
			</div>
			<div className="mb-6">
				<label htmlFor="reason" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
				Reason for Action
				</label>
				<textarea
				id="reason"
				rows="3"
				className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				required
				></textarea>
			</div>
			{error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
			<div className="flex justify-end gap-4">
				<button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
				Cancel
				</button>
				<button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
				Confirm {getActionTitle()}
				</button>
			</div>
			</form>
		</div>
		</div>
	);
};
