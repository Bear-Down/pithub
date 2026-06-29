import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../features/admin/services/adminService';
import InputModal from './InputModal';

/**
 * Minimal red Report button shown on file listings for non-owners.
 */
export default function ReportButton({ file }) {
	const { user } = useAuth();
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	if (!user || !file || user.uid === file.ownerId) return null;

	const handleReport = async (reason) => {
		setSubmitting(true);
		setError('');
		try {
			await reportService.submitReport(
				file.id,
				user.uid,
				user.email,
				reason,
				file.visibility,
			);
			setSubmitted(true);
			setShowModal(false);
		} catch (err) {
			setError(err.message || 'Failed to submit report.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={() => { setShowModal(true); setError(''); }}
				disabled={submitted}
				style={{
					backgroundColor: submitted ? '#ccc' : '#ff4d4d',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					padding: '4px 10px',
					cursor: submitted ? 'default' : 'pointer',
					fontSize: '0.8rem',
					opacity: submitted ? 0.6 : 1,
				}}
			>
				{submitted ? 'Reported' : 'Report'}
			</button>

			<InputModal
				isOpen={showModal}
				title="Report Content"
				placeholder="Describe why this content is inappropriate..."
				onConfirm={handleReport}
				onCancel={() => setShowModal(false)}
				confirmText={submitting ? 'Submitting...' : 'Submit Report'}
				cancelText="Cancel"
			/>

			{error && (
				<span style={{ fontSize: '0.7rem', color: 'red', marginLeft: '6px' }}>{error}</span>
			)}
		</>
	);
}
