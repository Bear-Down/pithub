import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import userIconFallback from '../../assets/user-icon.jpg';
import '../../styles/AdminDashboard.css';

/**
 * @file AdminDashboardLayout.jsx
 * @description Provides a professional layout for the admin panel with a fixed side navigation.
 *              Uses AdminDashboard.css for styling to avoid affecting the student view.
 */

const AdminDashboardLayout = ({ children }) => {
	const { logout, user } = useAuth();
	const { theme } = useTheme();
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setShowDropdown(false);
		}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate('/admin/login');
	};

	const isActive = (path) => {
		if (path === '/admin' && location.pathname === '/admin') return true;
		if (path !== '/admin' && location.pathname.startsWith(path)) return true;
		return false;
	};

	const NavItem = ({ to, label, icon }) => (
		<Link to={to} className={"admin-nav-item " + (isActive(to) ? 'active' : '')}>
		<span className="admin-flex admin-items-center admin-justify-center">
			{icon}
		</span>
		{label}
		</Link>
	);

	return (
		<div className="admin-theme-wrapper">
		<div className="admin-layout">
			{/* Admin Specific Header */}
			<header>
			<div className="logo">
				<Link to="/admin">PitHub Admin</Link>
			</div>
			<div className="header-right">
				<ThemeToggle />
				
				{user && (
				<div className="profile-container" ref={dropdownRef}>
					<div className="circle" onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
					<img 
						src={user.photoURL || userIconFallback} 
						alt="Admin" 
						style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
						onError={(e) => { e.target.src = userIconFallback; }}
					/>
					</div>
					{showDropdown && (
					<div className="profile-dropdown">
						<div className="dropdown-item" style={{ borderBottom: '1px solid var(--admin-border-color)', opacity: 0.6, fontSize: '12px' }}>
						{user.email}
						</div>
						<button className="dropdown-item" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>Profile</button>
						<button className="dropdown-item logout" onClick={handleLogout}>Log Out</button>
					</div>
					)}
				</div>
				)}
			</div>
			</header>

			<div className="admin-body">
			{/* Fixed Side Navigation */}
			<aside className="admin-sidebar">
				<div style={{ padding: '24px' }}>
				<h3 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.15em', opacity: 0.5 }}>Management</h3>
				</div>
				
				<nav className="admin-nav">
				<NavItem to="/admin" label="Dashboard"/>
				<NavItem to="/admin/users" label="Users"/>
				<NavItem to="/admin/classes" label="Classes"/>
				<NavItem to="/admin/files" label="Files"/>
				<NavItem to="/admin/reports" label="Reports"/>
				<NavItem to="/admin/logs" label="Audit Logs"/>
				<NavItem to="/admin/feedback" label="Feedback"/>
				</nav>

				<div className="admin-mt-auto" style={{ padding: '24px' }}>
					<p style={{ fontSize: '9px', fontWeight: 700, marginTop: '20px', textAlign: 'center', opacity: 0.4 }}>PitHub Admin</p>
				</div>
			</aside>

			{/* Main Scrollable Content */}
			<main className="admin-content">
				<div className="admin-full-width">
				{children}
				</div>
				
				<footer style={{ marginTop: '80px', borderTop: '1px solid var(--admin-border-color)', paddingTop: '20px', background: 'transparent', color: 'inherit', position: 'static' }}>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.5 }}>
					&copy; {new Date().getFullYear()} PitHub Admin - Bear Down
					</div>
				</div>
				</footer>
			</main>
			</div>
		</div>
		</div>
	);
};

export default AdminDashboardLayout;
