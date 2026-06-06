import React from 'react';
import { useTheme } from '../context/ThemeContext';
import darkModeIcon from '../assets/dark-mode.png';
import lightModeIcon from '../assets/light-mode.png';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                color: 'white',
                padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <img 
                src={theme === 'light' ? darkModeIcon : lightModeIcon} 
                alt={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
        </button>
    );
};

export default ThemeToggle;