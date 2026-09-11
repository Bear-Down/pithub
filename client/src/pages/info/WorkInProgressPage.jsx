import React from 'react';
import { Link } from 'react-router-dom';

const WorkInProgressPage = ({ title }) => {
	return (
		<div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
			<h1 style={{ marginBottom: '12px' }}>{title}</h1>
			<p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 24px auto' }}>
				This feature is currently under construction and will be available in a future update!
			</p>
			<div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--bg-primary)', border: '1px dashed var(--brand-color)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--brand-color)', fontWeight: 'bold' }}>
				Work In Progress
			</div>
			<div style={{ marginTop: '32px' }}>
				<Link to="/classes" style={{ color: 'var(--link-color)', textDecoration: 'none', fontWeight: '600' }}>
					Back to Dashboard
				</Link>
			</div>
		</div>
	);
};

export default WorkInProgressPage;
