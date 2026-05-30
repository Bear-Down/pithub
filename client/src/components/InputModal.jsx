import React, { useState, useEffect } from 'react';

const InputModal = ({ 
	isOpen, 
	title, 
	placeholder, 
	initialValue = "", 
	onConfirm, 
	onCancel, 
	confirmText = "Submit", 
	cancelText = "Cancel" 
}) => {
	const [inputValue, setInputValue] = useState(initialValue);

	useEffect(() => {
		if (isOpen) setInputValue(initialValue);
	}, [isOpen, initialValue]);

	if (!isOpen) return null;

	const handleConfirm = () => {
		if (inputValue.trim()) {
			onConfirm(inputValue.trim());
			setInputValue("");
		}
	};

	return (
		<div className="modal-overlay" style={{
			position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
			backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center',
			alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)'
		}}>
			<div className="modal-content" style={{
				backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
				maxWidth: '400px', width: '80%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
			}}>
				<h3 style={{ marginTop: 0, color: '#222' }}>{title}</h3>
				<input 
					type="text"
					className="modal-input"
					placeholder={placeholder}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					autoFocus
					onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
				/>
				<div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
					<button 
						onClick={onCancel}
						style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#eee', cursor: 'pointer', fontWeight: '500' }}
					>
						{cancelText}
					</button>
					<button 
						onClick={handleConfirm}
						style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'orange', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default InputModal;