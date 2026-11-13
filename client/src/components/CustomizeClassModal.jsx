import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const CLASS_COLOR_PRESETS = [
	{ label: 'Lewis Crimson', value: '#C22033' },
	{ label: 'Navy Blue', value: '#1e3a8a' },
	{ label: 'Royal Blue', value: '#2563eb' },
	{ label: 'Emerald Green', value: '#15803d' },
	{ label: 'Slate Charcoal', value: '#334155' },
	{ label: 'Royal Purple', value: '#6b21a8' },
	{ label: 'Burnt Orange', value: '#c2410c' },
	{ label: 'Ocean Teal', value: '#0f766e' },
	{ label: 'Midnight Black', value: '#0f172a' },
	{ label: 'Deep Maroon', value: '#7f1d1d' }
];

const CustomizeClassModal = ({
	isOpen,
	classData,
	onClose,
	onSave,
	linkPrefix = '/class'
}) => {
	const [activeTab, setActiveTab] = useState('color');
	const [selectedColor, setSelectedColor] = useState('#C22033');
	const [selectedImage, setSelectedImage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (isOpen && classData) {
			const hasImage = Boolean(classData.backgroundImage);
			setActiveTab(hasImage ? 'image' : 'color');
			setSelectedColor(classData.backgroundColor || '#C22033');
			setSelectedImage(classData.backgroundImage || '');
		}
	}, [isOpen, classData]);

	if (!isOpen || !classData) return null;

	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 900000) {
				alert("Image file size should be less than 900KB.");
				return;
			}
			const reader = new FileReader();
			reader.onload = (uploadEvent) => {
				setSelectedImage(uploadEvent.target.result);
				setActiveTab('image');
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSave = async () => {
		if (!classData?.id) return;
		setIsSaving(true);
		try {
			const collectionName = linkPrefix === '/playlist' ? 'playlists' : 'classes';
			const itemRef = doc(db, collectionName, classData.id);
			const updates = {
				backgroundColor: selectedColor || null,
				backgroundImage: (activeTab === 'image' && selectedImage) ? selectedImage : null,
				backgroundType: (activeTab === 'image' && selectedImage) ? 'image' : 'color'
			};
			await updateDoc(itemRef, updates);
			if (onSave) onSave(updates);
			onClose();
		} catch (err) {
			console.error("Failed to personalize class:", err);
			alert("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleReset = async () => {
		if (!classData?.id) return;
		setIsSaving(true);
		try {
			const collectionName = linkPrefix === '/playlist' ? 'playlists' : 'classes';
			const itemRef = doc(db, collectionName, classData.id);
			await updateDoc(itemRef, {
				backgroundColor: null,
				backgroundImage: null,
				backgroundType: null
			});
			if (onSave) onSave({ backgroundColor: null, backgroundImage: null, backgroundType: null });
			onClose();
		} catch (err) {
			console.error("Failed to reset class personalization:", err);
		} finally {
			setIsSaving(false);
		}
	};

	// Determine preview style
	const previewHasImage = activeTab === 'image' && Boolean(selectedImage);
	const previewStyle = {
		position: 'relative',
		borderRadius: '12px',
		padding: '16px',
		overflow: 'hidden',
		backgroundColor: selectedColor || 'var(--bg-secondary)',
		backgroundImage: previewHasImage ? `url("${selectedImage}")` : 'none',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		minHeight: '110px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
		border: '1px solid var(--border-color)',
		marginTop: '12px',
		marginBottom: '18px'
	};

	return (
		<div 
			className="modal-overlay" 
			style={{
				position: 'fixed', 
				top: 0, 
				left: 0, 
				right: 0, 
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.65)', 
				display: 'flex', 
				justifyContent: 'center',
				alignItems: 'center', 
				zIndex: 1000, 
				backdropFilter: 'blur(3px)',
				padding: '16px',
				boxSizing: 'border-box'
			}}
			onClick={onClose}
		>
			<div 
				className="modal-content customize-class-modal" 
				style={{
					backgroundColor: 'var(--modal-bg)', 
					padding: '24px', 
					borderRadius: '14px',
					maxWidth: '480px', 
					width: '100%', 
					boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
					boxSizing: 'border-box',
					maxHeight: '90vh',
					overflowY: 'auto'
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
					<h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700 }}>
						Personalize Class Card
					</h3>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: 'transparent',
							border: 'none',
							fontSize: '1.3rem',
							cursor: 'pointer',
							color: 'var(--text-muted)',
							padding: '4px'
						}}
						aria-label="Close"
					>
						✕
					</button>
				</div>

				<p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
					Edit the appearance of <strong>{classData?.name}</strong>.
				</p>

				{/* Card Live Preview */}
				<div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
					Preview:
				</div>
				<div style={{
					borderRadius: '12px',
					border: '1px solid var(--border-color)',
					overflow: 'hidden',
					backgroundColor: 'var(--bg-secondary)',
					boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
					marginTop: '10px',
					marginBottom: '18px'
				}}>
					{/* Top Half: Customized with selected image or color */}
					<div style={{
						position: 'relative',
						padding: '16px',
						overflow: 'hidden',
						backgroundColor: selectedColor || 'var(--bg-secondary)',
						backgroundImage: previewHasImage ? `url("${selectedImage}")` : 'none',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						minHeight: '85px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						gap: '12px'
					}}>
						{/* Dark overlay for contrast */}
						<div 
							style={{
								position: 'absolute',
								inset: 0,
								background: previewHasImage 
									? 'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.72) 100%)'
									: 'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.28) 100%)',
								pointerEvents: 'none',
								zIndex: 1
							}} 
						/>

						<div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
							<h4 style={{ 
								margin: 0, 
								color: '#ffffff', 
								fontSize: '1.05rem', 
								fontWeight: 700,
								textShadow: '0 1px 3px rgba(0,0,0,0.8)' 
							}}>
								{classData?.name || 'Class Name'}
							</h4>
							<span style={{
								fontSize: '0.7rem',
								padding: '2px 8px',
								borderRadius: '4px',
								fontWeight: 'bold',
								backgroundColor: classData?.visibility === 'public' ? '#28a745' : '#ff4d4d',
								color: '#ffffff',
								boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
							}}>
								{classData?.visibility === 'public' ? 'Public' : 'Private'}
							</span>
						</div>

						<div style={{ position: 'relative', zIndex: 2 }}>
							<span style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '5px',
								fontSize: '0.75rem',
								color: '#f9fafb',
								backgroundColor: 'rgba(0, 0, 0, 0.55)',
								padding: '3px 8px',
								borderRadius: '10px',
								border: '1px solid rgba(255, 255, 255, 0.25)',
								backdropFilter: 'blur(3px)'
							}}>
								3 documents
							</span>
						</div>
					</div>

					{/* Divider Line & Bottom Half: Unaffected footer area */}
					<div style={{
						padding: '8px 16px',
						backgroundColor: 'var(--bg-secondary)',
						borderTop: '1px solid var(--border-soft)',
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '8px',
						alignItems: 'center'
					}}>
						<span style={{
							fontSize: '0.7rem',
							padding: '4px 8px',
							borderRadius: '6px',
							backgroundColor: 'var(--bg-primary)',
							color: 'var(--text-main)',
							border: '1px solid var(--border-color)',
							fontWeight: 600
						}}>
							Edit
						</span>
						<span style={{
							fontSize: '0.7rem',
							padding: '4px 8px',
							borderRadius: '6px',
							backgroundColor: '#ff4d4d',
							color: '#ffffff',
							fontWeight: 600
						}}>
							Delete
						</span>
					</div>
				</div>

				{/* Type Selector Tabs */}
				<div style={{
					display: 'flex',
					background: 'var(--bg-primary)',
					border: '1px solid var(--border-color)',
					borderRadius: '8px',
					padding: '3px',
					gap: '4px',
					marginBottom: '16px'
				}}>
					<button
						type="button"
						onClick={() => setActiveTab('color')}
						style={{
							flex: 1,
							padding: '7px 12px',
							fontSize: '0.82rem',
							fontWeight: 600,
							border: 'none',
							borderRadius: '6px',
							backgroundColor: activeTab === 'color' ? 'var(--bg-secondary)' : 'transparent',
							color: activeTab === 'color' ? 'var(--text-main)' : 'var(--text-muted)',
							cursor: 'pointer',
							boxShadow: activeTab === 'color' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
							transition: 'all 0.2s ease'
						}}
					>
						Custom Color
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('image')}
						style={{
							flex: 1,
							padding: '7px 12px',
							fontSize: '0.82rem',
							fontWeight: 600,
							border: 'none',
							borderRadius: '6px',
							backgroundColor: activeTab === 'image' ? 'var(--bg-secondary)' : 'transparent',
							color: activeTab === 'image' ? 'var(--text-main)' : 'var(--text-muted)',
							cursor: 'pointer',
							boxShadow: activeTab === 'image' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
							transition: 'all 0.2s ease'
						}}
					>
						Background Image
					</button>
				</div>

				{/* Tab 1: Solid Color Controls */}
				{activeTab === 'color' ? (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
						<div>
							<label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
								Choose a color:
							</label>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
								{CLASS_COLOR_PRESETS.map((preset) => (
									<button
										key={preset.value}
										type="button"
										onClick={() => setSelectedColor(preset.value)}
										title={preset.label}
										style={{
											width: '34px',
											height: '34px',
											borderRadius: '50%',
											backgroundColor: preset.value,
											border: selectedColor.toLowerCase() === preset.value.toLowerCase() ? '3px solid #ffffff' : '2px solid transparent',
											boxShadow: selectedColor.toLowerCase() === preset.value.toLowerCase() ? '0 0 0 2px var(--brand-color)' : '0 1px 3px rgba(0,0,0,0.2)',
											cursor: 'pointer',
											transform: selectedColor.toLowerCase() === preset.value.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
											transition: 'all 0.15s ease',
											padding: 0
										}}
									/>
								))}
							</div>
						</div>

						<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
							<label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Custom:</label>
							<input
								type="color"
								value={selectedColor.startsWith('#') && selectedColor.length === 7 ? selectedColor : '#C22033'}
								onChange={(e) => setSelectedColor(e.target.value)}
								style={{
									width: '36px',
									height: '36px',
									border: '1px solid var(--border-color)',
									borderRadius: '8px',
									padding: 0,
									background: 'transparent',
									cursor: 'pointer'
								}}
							/>
							<input
								type="text"
								value={selectedColor}
								onChange={(e) => setSelectedColor(e.target.value)}
								placeholder="#C22033"
								style={{
									padding: '6px 10px',
									borderRadius: '6px',
									border: '1px solid var(--border-color)',
									backgroundColor: 'var(--input-bg-raised)',
									color: 'var(--text-main)',
									fontSize: '0.85rem',
									fontFamily: 'monospace',
									width: '100px'
								}}
							/>
						</div>
					</div>
				) : (
					/* Tab 2: Custom Background Image Controls */
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
						<div>
							<label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
								Upload image file:
							</label>
							<label style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '6px',
								padding: '8px 14px',
								borderRadius: '6px',
								border: '1px solid var(--border-color)',
								backgroundColor: 'var(--bg-primary)',
								color: 'var(--text-main)',
								fontSize: '0.82rem',
								fontWeight: 600,
								cursor: 'pointer'
							}}>
								Upload Image
								<input
									type="file"
									accept="image/*"
									style={{ display: 'none' }}
									onChange={handleFileUpload}
								/>
							</label>
						</div>

						{selectedImage && (
							<button
								type="button"
								onClick={() => {
									setSelectedImage('');
									setActiveTab('color');
								}}
								style={{
									alignSelf: 'flex-start',
									background: 'transparent',
									border: '1px solid var(--border-color)',
									borderRadius: '6px',
									padding: '5px 10px',
									fontSize: '0.75rem',
									color: 'var(--text-muted)',
									cursor: 'pointer',
									marginTop: '2px'
								}}
							>
								Clear Image (Use Solid Color)
							</button>
						)}
					</div>
				)}

				{/* Modal Actions */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-soft)' }}>
					<button
						type="button"
						disabled={isSaving}
						onClick={handleReset}
						style={{
							padding: '8px 12px',
							fontSize: '0.8rem',
							color: 'var(--text-muted)',
							background: 'transparent',
							border: 'none',
							cursor: isSaving ? 'not-allowed' : 'pointer',
							textDecoration: 'underline'
						}}
					>
						Reset to Default
					</button>

					<div style={{ display: 'flex', gap: '8px' }}>
						<button
							type="button"
							disabled={isSaving}
							onClick={onClose}
							style={{
								padding: '8px 16px',
								borderRadius: '6px',
								border: '1px solid var(--border-color)',
								backgroundColor: 'var(--bg-primary)',
								color: 'var(--text-main)',
								fontSize: '0.85rem',
								fontWeight: 600,
								cursor: isSaving ? 'not-allowed' : 'pointer'
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={isSaving}
							onClick={handleSave}
							style={{
								padding: '8px 18px',
								borderRadius: '6px',
								border: 'none',
								backgroundColor: 'var(--brand-color)',
								color: '#ffffff',
								fontSize: '0.85rem',
								fontWeight: 700,
								cursor: isSaving ? 'not-allowed' : 'pointer'
							}}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomizeClassModal;
