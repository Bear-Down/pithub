import React from 'react';
import ClassCard from './ClassCard';
import VideoList from './VideoList';
import '../styles/style.css';
import ConfirmationModal from './ConfirmationModal';
import InputModal from './InputModal';
import { useClassList } from '../hooks/useClassList';

const ClassList = ({ showRecentUploads = true }) => {
	const {
		classes = [],
		fileCounts = {},
		viewMode = 'grid',
		setViewMode,
		confirmDelete,
		inputModal,
		isDeleting,
		handleCreateClass,
		handleEditClass,
		handleModalSubmit,
		handleDeleteClass,
		closeInputModal,
		setConfirmDeleteData,
		cancelDelete
	} = useClassList() || {};

	return (
		<div className="home-wrapper">
			{/* Top Section: Recent Files/Videos (Dashboard only) */}
			{showRecentUploads && (
				<div className="container">
					<h1>Recent Uploads</h1>
					<VideoList />
				</div>
			)}

			{/* Bottom Section: Classes (Grid or Stacked List) */}
			<div className="classes-section" style={{ marginTop: '20px' }}>
				<div className="classes-header">
					<div>
						<h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--brand-color)' }}>Your Classes</h1>
						<p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
							Manage your classes.
						</p>
					</div>
					<div className="classes-header-actions">
						<div className="view-toggle-group">
							<button 
								className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
								onClick={() => setViewMode && setViewMode('grid')}
								title="Grid View (Boxes)"
							>
								Grid
							</button>
							<button 
								className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
								onClick={() => setViewMode && setViewMode('list')}
								title="List View (Stacked)"
							>
								List
							</button>
						</div>
						<button className="create-class-btn" onClick={handleCreateClass}>+ Create Class</button>
					</div>
				</div>

				{classes && classes.length > 0 ? (
					<div className={viewMode === 'grid' ? 'classes-grid-view' : 'classes-list-view'}>
						{classes.map((item) => (
							<ClassCard 
								key={item.id} 
								classData={item} 
								onEdit={handleEditClass}
								onDelete={setConfirmDeleteData}
								viewMode={viewMode}
								docCount={(fileCounts && item?.id && fileCounts[item.id]) || 0}
							/>
						))}
					</div>
				) : (
					<div className="status" style={{ textAlign: 'center', padding: '40px 20px' }}>
						<h3>No Classes Found</h3>
						<p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
							Create your first class to share videos and documents!
						</p>
					</div>
				)}
			</div>

			<InputModal 
				isOpen={inputModal.isOpen}
				title={inputModal.mode === 'create' ? "Create New Class" : "Edit Class Name"}
				placeholder="Enter class name"
				initialValue={inputModal.data?.name || ""}
				onConfirm={handleModalSubmit}
				onCancel={closeInputModal}
				confirmText={inputModal.mode === 'create' ? "Create" : "Save Changes"}
			/>

			<ConfirmationModal 
				isOpen={!!confirmDelete}
				title="Delete Class?"
				message={
					<>
						Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? 
						<br /><br />
						<span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Warning:</span> This will permanently delete the class and <strong>all uploaded videos and documents</strong> within it.
					</>
				}
				confirmText={isDeleting ? 'Deleting...' : 'Delete Everything'}
				isLoading={isDeleting}
				onConfirm={() => handleDeleteClass(confirmDelete)}
				onCancel={cancelDelete}
			/>
		</div>
	);
};

export default ClassList;