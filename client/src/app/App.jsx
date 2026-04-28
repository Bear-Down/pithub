import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

import ClassList from '../features/classes/ClassList';
import ClassPage from '../features/classes/ClassPage';
import LoginPage from '../features/auth/LoginPage';
import LogoutPage from '../features/auth/LogoutPage';
import ProfilePage from '../features/profile/ProfilePage';
import Layout from './Layout';
import ProtectedRoute from '../components/ProtectedRoute';

import About from '../features/info/About';
import Terms from '../features/info/Terms';

import '../styles/style.css';

function AppContent() {
	const { user, loading } = useAuth();

	if (loading) return <div>Loading...</div>;

	return (
		
		<Router>
			<Routes>
			{/* LOGIN PAGE: Standalone without the header/footer */}
			<Route
				path="/"
				element={user ? <Navigate to="/classes" /> : <LoginPage />}
			/>
			{/* LOGOUT PAGE */}
			<Route path="/logout" element={<LogoutPage />} />
			
			{/* AUTHENTICATED ROUTES: Wrapped in Layout (header/footer/dropdown) */}
			<Route element={<Layout />}>
				<Route path="/classes" element={<ProtectedRoute user={user}><ClassList /></ProtectedRoute>} />
				<Route path="/class/:classId" element={<ProtectedRoute user={user}><ClassPage /></ProtectedRoute>} />
				<Route path="/profile" element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} />
				<Route path="/about" element={<About />} />
				<Route path="/terms" element={<Terms />} />
			</Route>
			</Routes>
		</Router>
	);
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;