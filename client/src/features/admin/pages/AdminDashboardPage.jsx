import React from 'react';
import { useParams } from 'react-router-dom';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import StatsOverview from '../components/StatsOverview';
import RecentUploadsTable from '../components/RecentUploadsTable';
import FlaggedContentQueue from '../components/FlaggedContentQueue';
import { useAdminData } from '../hooks/useAdminData';

/**
 * @file AdminDashboardPage.jsx
 * @description Main dashboard page for administrators.
 */

const AdminDashboardPage = () => {
  const {
    totalUsers,
    totalClasses,
    totalFiles,
    recentUploads,
    flaggedContent,
    loading,
    error,
    refreshStats,
  } = useAdminData();
  
  const { section } = useParams();

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="admin-flex admin-flex-col admin-items-center admin-justify-center" style={{ minHeight: '60vh' }}>
          <div className="admin-loading-spinner"></div>
          <p style={{ marginTop: '16px', fontWeight: 900, color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Synchronizing Systems...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>System Error</h2>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '24px' }}>{error}</p>
          <button onClick={refreshStats} className="create-class-btn">Retry Connection</button>
        </div>
      </AdminDashboardLayout>
    );
  }

  const renderContent = () => {
    switch(section) {
      case 'users': 
        return (
          <div className="admin-table-container" style={{ padding: '80px', textAlign: 'center' }}>
            <p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>User Management Module</p>
            <h3 className="stat-value" style={{ fontSize: '24px', marginTop: '16px', fontStyle: 'italic', opacity: 0.1 }}>Deployment Pending</h3>
          </div>
        );
      case 'classes': 
        return (
          <div className="admin-table-container" style={{ padding: '80px', textAlign: 'center' }}>
            <p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>Class Directory Module</p>
            <h3 className="stat-value" style={{ fontSize: '24px', marginTop: '16px', fontStyle: 'italic', opacity: 0.1 }}>Deployment Pending</h3>
          </div>
        );
      case 'files': 
        return (
          <div className="admin-table-container" style={{ padding: '80px', textAlign: 'center' }}>
            <p style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>File Explorer Module</p>
            <h3 className="stat-value" style={{ fontSize: '24px', marginTop: '16px', fontStyle: 'italic', opacity: 0.1 }}>Deployment Pending</h3>
          </div>
        );
      case 'reports': 
        return <FlaggedContentQueue flaggedItems={flaggedContent} />;
      default: 
        return (
          <div className="admin-flex admin-flex-col" style={{ gap: '24px' }}>
            <StatsOverview
              totalUsers={totalUsers}
              totalClasses={totalClasses}
              totalFiles={totalFiles}
              onRefresh={refreshStats}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
              <RecentUploadsTable uploads={recentUploads} />
              <FlaggedContentQueue flaggedItems={flaggedContent} />
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    if (!section) return 'System Overview';
    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  return (
    <AdminDashboardLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--admin-text-main)' }}>
          {getTitle()}
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontWeight: 500, marginTop: '8px' }}>
          Monitoring PitHub network telemetry and activity logs.
        </p>
      </div>
      
      {renderContent()}
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;
