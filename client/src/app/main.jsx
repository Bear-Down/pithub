import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Entry Point:
ReactDOM.createRoot(document.getElementById('root')).render(
	// development wrapper
	<React.StrictMode>
		<App />
	</React.StrictMode>
);