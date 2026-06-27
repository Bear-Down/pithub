import React from 'react';

/**
 * @file StatsOverview.jsx
 * @description Renders KPI cards for system statistics using scoped admin styles.
 */

const StatsOverview = ({ totalUsers, totalClasses, totalFiles, onRefresh }) => {
	const firebaseStorageConsoleLink = "https://console.firebase.google.com/u/0/project/pithub-test-kd/storage/pithub-test-kd.firebasestorage.app/files";

	return (
		<div style={{ marginBottom: '32px' }}>
		<div className="admin-flex admin-items-center admin-justify-between" style={{ marginBottom: '32px' }}>
			<div>
			<h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>Telemetry Overview</h2>
			<p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4 }}>Real-time service availability and network metrics.</p>
			</div>
			{onRefresh && (
			<button 
				onClick={onRefresh} 
				className="create-class-btn"
				style={{ padding: '8px 16px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
			>
				Synchronize
			</button>
			)}
		</div>
		
		<div className="stats-grid">
			{/* Total Users */}
			<div className="stat-card">
			<div className="stat-icon" style={{ color: 'var(--admin-brand-color)' }}>
				<svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
			</div>
			<div className="stat-label">Network Users</div>
			<div className="stat-value">{totalUsers.toLocaleString()}</div>
			<div className="admin-badge admin-badge-success" style={{ marginTop: '12px' }}>Active</div>
			</div>

			{/* Total Classes */}
			<div className="stat-card">
			<div className="stat-icon" style={{ color: 'var(--admin-brand-color)' }}>
				<svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
			</div>
			<div className="stat-label">Total Classes</div>
			<div className="stat-value">{totalClasses.toLocaleString()}</div>
			<div className="admin-badge" style={{ marginTop: '12px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--admin-text-muted)' }}>Indexed</div>
			</div>

			{/* Total Files */}
			<div className="stat-card">
			<div className="stat-icon" style={{ color: 'var(--admin-brand-color)' }}>
				<svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
			</div>
			<div className="stat-label">Storage Assets</div>
			<div className="stat-value">{totalFiles.toLocaleString()}</div>
			<div className="admin-badge admin-badge-warning" style={{ marginTop: '12px' }}>Optimized</div>
			</div>

			{/* System Status */}
			<div className="stat-card">
			<div className="stat-icon" style={{ color: 'var(--admin-success)' }}>
				<svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
			</div>
			<div className="stat-label">System Health</div>
			<div className="stat-value" style={{ color: 'var(--admin-success)', fontSize: '28px' }}>Nominal</div>
			<a href={firebaseStorageConsoleLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', textDecoration: 'none', color: 'var(--link-color)' }}>
				Open Console
				<svg style={{width:'12px',height:'12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
			</a>
			</div>
		</div>
		</div>
	);
};

export default StatsOverview;
