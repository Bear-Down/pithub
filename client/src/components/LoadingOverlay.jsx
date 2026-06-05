import React from 'react';

const LoadingOverlay = ({ message = "Synchronizing Privacy Settings..." }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
        }}>
            <div className="spinner" style={{ marginBottom: '15px', borderTop: '4px solid orange' }}></div>
            <p style={{ fontWeight: 'bold', color: '#555', fontSize: '1.1rem' }}>{message}</p>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>This may take a moment depending on your content volume.</p>
        </div>
    );
};

export default LoadingOverlay;