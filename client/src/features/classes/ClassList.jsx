import React from 'react';
import ClassCard from './ClassCard';
import VideoList from '../videos/VideoList';
import '../../styles/style.css';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';
import { useClassList } from '../../hooks/useClassList';

const ClassList = () => {
	const {
		classes,
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
	} = useClassList();

	return (
		<div className="home-wrapper">
			{/* Top Section: Recent Files/Videos */}
			<div className="container">
				<h1>Recent Uploads</h1>
				<VideoList />
			</div>

			{/* Bottom Section: Horizontal Classes Grid */}
			<div className="classes-section">
				<div className="classes-header">
				<h2>Your Classes</h2>
				<button className="create-class-btn" onClick={handleCreateClass}>+ Create Class</button>
				</div>
				{classes.length > 0 ? (
				<div className="classes-horizontal-scroll">
					{classes.map((item) => (
					<ClassCard 
						key={item.id} 
						classData={item} 
						onEdit={handleEditClass}
						onDelete={setConfirmDeleteData}
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