import React from 'react';

const LoadingOverlay = ({ message = "Synchronizing Privacy Settings..." }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            transition: 'background-color 0.3s ease'
        }}>
            <div className="spinner" style={{ marginBottom: '15px', borderTop: '4px solid var(--brand-color)' }}></div>
            <p style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{message}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>This may take a moment depending on your content volume.</p>
        </div>
    );
};

export default LoadingOverlay;