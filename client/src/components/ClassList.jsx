import React from 'react';
import ClassCard from './ClassCard';
import VideoList from './VideoList';
import '../styles/style.css';
import ConfirmationModal from './ConfirmationModal';
import InputModal from './InputModal';
import { useClassList } from '../hooks/useClassList';

const ClassList = () => {
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
			{/* Top Section: Recent Files/Videos */}
			<div className="container">
				<h1>Recent Uploads</h1>
				<VideoList />
			</div>

			{/* Bottom Section: Classes (Grid or Stacked List) */}
			<div className="classes-section">
				<div className="classes-header">
					<h2>Your Classes</h2>
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
					<div className="status">
						<p>No classes created yet. Click the button above to get started!</p>
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