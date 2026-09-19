import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

import ClassList from '../components/ClassList';
import ClassPage from '../pages/classes/ClassPage';
import LoginPage from '../pages/auth/LoginPage';
import LogoutPage from '../pages/auth/LogoutPage';
import ProfilePage from '../pages/profile/ProfilePage';
import Layout from './Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';
import SettingsPage from '../pages/settings/SettingsPage';
import UploadsPage from '../pages/uploads/UploadsPage';
import WorkInProgressPage from '../pages/info/WorkInProgressPage';
import FavoritesPage from '../pages/favorites/FavoritesPage';

import PlaylistList from '../pages/playlists/PlaylistList';
import PlaylistPage from '../pages/playlists/PlaylistPage';

import About from '../pages/info/About';
import Terms from '../pages/info/Terms';

import '../styles/style.css';

/**
 * Protected route specifically for administrators.
 * Leverages useAdminAuth to verify the admin role and handle unauthorized redirects.
 */
const AdminProtectedRoute = ({ children }) => {
	const { adminCheckLoading } = useAdminAuth();

	if (adminCheckLoading) {
		return <div className="text-center py-10">Verifying administrator access...</div>;
	}

	return children;
};

function AppContent() {
	const { user, loading } = useAuth();

	if (loading) return <div>Loading...</div>;

	return (
		<Router>
			<Routes>
				{/* LOGIN PAGE: Standalone without the header/footer */}
				<Route
					path="/"
					element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
				/>
				{/* LOGOUT PAGE */}
				<Route path="/logout" element={<LogoutPage />} />

				{/* ADMIN ROUTES */}
				<Route path="/admin/login" element={<AdminLoginPage />} />
				<Route
					path="/admin"
					element={
						<AdminProtectedRoute>
							<AdminDashboardPage />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path="/admin/:section"
					element={
						<AdminProtectedRoute>
							<AdminDashboardPage />
						</AdminProtectedRoute>
					}
				/>

				{/* AUTHENTICATED ROUTES: Wrapped in Layout */}
				<Route element={<Layout />}>
					<Route path="/dashboard" element={<ProtectedRoute user={user}><ClassList showRecentUploads={true} /></ProtectedRoute>} />
					<Route path="/classes" element={<ProtectedRoute user={user}><ClassList showRecentUploads={false} /></ProtectedRoute>} />
					<Route path="/uploads" element={<ProtectedRoute user={user}><UploadsPage /></ProtectedRoute>} />
					<Route path="/favorites" element={<ProtectedRoute user={user}><FavoritesPage /></ProtectedRoute>} />
					<Route path="/playlists" element={<ProtectedRoute user={user}><PlaylistList /></ProtectedRoute>} />
					<Route path="/playlist/:playlistId" element={<ProtectedRoute user={user}><PlaylistPage /></ProtectedRoute>} />
					<Route path="/watch-later" element={<ProtectedRoute user={user}><WorkInProgressPage title="Watch Later" /></ProtectedRoute>} />
					<Route path="/class/:classId" element={<ProtectedRoute user={user}><ClassPage /></ProtectedRoute>} />
					<Route path="/profile" element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} />
					<Route path="/settings" element={<ProtectedRoute user={user}><SettingsPage /></ProtectedRoute>} />
					<Route path="/profile/:userId" element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} />
					<Route path="/about" element={<About />} />
					<Route path="/terms" element={<Terms />} />
				</Route>
			</Routes>
		</Router>
	);
}

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;