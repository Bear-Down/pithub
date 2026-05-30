import React from 'react';

const ConfirmationModal = ({ 
	isOpen, 
	title, 
	message, 
	onConfirm, 
	onCancel, 
	confirmText = "Confirm", 
	cancelText = "Cancel",
	isLoading = false 
}) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay" style={{
			position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
			backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center',
			alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)'
		}}>
			<div className="modal-content" style={{
				backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
				maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
			}}>
				<h3 style={{ marginTop: 0, color: '#222' }}>{title}</h3>
				<div style={{ color: '#555', lineHeight: '1.5', margin: '20px 0' }}>
					{message}
				</div>
				<div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
					<button 
						onClick={onCancel}
						disabled={isLoading}
						style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#eee', cursor: 'pointer', fontWeight: '500' }}
					>
						{cancelText}
					</button>
					<button 
						onClick={onConfirm}
						disabled={isLoading}
						style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;