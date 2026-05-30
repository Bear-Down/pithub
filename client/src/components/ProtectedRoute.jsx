import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
	if (!user) {
		// If user is not logged in, redirect to the login page (root)
		return <Navigate to="/" replace />;
	}
	return children;
};

export default ProtectedRoute;