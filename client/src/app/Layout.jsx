import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../features/search/SearchBar';
import '../styles/style.css'; 
import userIconFallback from '../assets/user-icon.jpg';
import Spinner from '../components/Spinner';

const Layout = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const [loading, setLoading] = useState(false);
	const dropdownRef = useRef(null);

	const toggleDropdown = () => setShowDropdown(!showDropdown);

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
		console.log("Logout clicked.");
		setLoading(true);
		await logout();
		console.log("Logout confirmed.");
		setShowDropdown(false);
		//setTimeout(() => {
			navigate("/logout");
		//}, 100);
		console.log("Logout page displayed.");
	};

	return (
		<div className="app-container">
		<header className="header">
			<div className="logo">
			<Link to="/">PitHub</Link>
			</div>
			<div className="header-right">
			<SearchBar />
			{user && (
				<div className="profile-container" ref={dropdownRef}>
					<div className="circle" onClick={toggleDropdown} style={{ cursor: 'pointer', overflow: 'hidden' }}>
						<img 
							src={user.photoURL || userIconFallback} 
							alt="User" 
							style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
							onError={(e) => {
								e.target.src = userIconFallback;
							}}
						/>
					</div>
					{showDropdown && (
						<div className="profile-dropdown">
							<button className="dropdown-item" onClick={() => {
								navigate('/profile');
								setShowDropdown(false);
							}}>Profile</button>
							<button className="dropdown-item">Settings</button>
							<>
								{loading ? (
									<Spinner />
								) : (
									<button className="dropdown-item logout" onClick={handleLogout}>
										Log Out
									</button>
								)}
							</>
						</div>
					)}
				</div>
			)}
			</div>
		</header>

		<main>
			{/* This renders the current page (VideoList, About, or Terms) */}
			<Outlet />
		</main>

          <footer>
            <div className="footer-container">
              <div className="footer-center">
                &copy; {new Date().getFullYear()} PitHub - Bear Down
              </div>
              <div className="footer-links">
                <Link to="/about">About</Link>
                <Link to="/terms">Terms</Link>
              </div>
            </div>
          </footer>
		</div>
	);
};

export default Layout;