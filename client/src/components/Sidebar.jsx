import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
	const navItems = [
		{ label: 'Dashboard', path: '/dashboard' },
		{ label: 'Uploads', path: '/uploads' },
		{ label: 'Classes', path: '/classes' },
		{ label: 'Favorites', path: '/favorites', isWip: true },
		{ label: 'Playlists', path: '/playlists', isWip: true },
		{ label: 'Watch Later', path: '/watch-later', isWip: true },
		{ label: 'Settings', path: '/settings' },
	];

	return (
		<aside className="sidebar">
			<nav className="sidebar-nav">
				{navItems.map((item, idx) => (
					<NavLink
						key={idx}
						to={item.path}
						className={({ isActive }) =>
							`sidebar-item ${isActive ? 'active' : ''}`
						}
					>
						{item.icon && <span className="sidebar-icon">{item.icon}</span>}
						<span className="sidebar-label">{item.label}</span>
						{item.isWip && <span className="wip-badge">WIP</span>}
					</NavLink>
				))}
			</nav>
		</aside>
	);
};

export default Sidebar;
