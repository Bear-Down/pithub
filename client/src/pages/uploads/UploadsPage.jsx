import React from 'react';
import VideoList from '../../components/VideoList';
import '../../styles/style.css';

const UploadsPage = () => {
	return (
		<div className="home-wrapper">
			<div className="container">
				<h1>Your Uploads</h1>
				<p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
					Showing all personal file and video uploads across your account regardless of class.
				</p>
				<VideoList />
			</div>
		</div>
	);
};

export default UploadsPage;
