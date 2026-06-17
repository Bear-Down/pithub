import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import userIconFallback from '../../../assets/user-icon.jpg';
import '../styles/AdminDashboard.css';

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
              <NavItem to="/admin" label="Dashboard" icon={
                <svg style={{width:'18px',height:'18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              } />
              <NavItem to="/admin/users" label="Users" icon={
                <svg style={{width:'18px',height:'18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              } />
              <NavItem to="/admin/classes" label="Classes" icon={
                <svg style={{width:'18px',height:'18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              } />
              <NavItem to="/admin/files" label="Files" icon={
                <svg style={{width:'18px',height:'18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              } />
              <NavItem to="/admin/reports" label="Reports" icon={
                <svg style={{width:'18px',height:'18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              } />
            </nav>

            <div className="admin-mt-auto" style={{ padding: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid var(--admin-border-color)' }}>
                <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Server Status</p>
                <div className="admin-flex admin-items-center admin-gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--admin-success)' }}></div>
                  <p style={{ fontSize: '12px', fontWeight: 700 }}>Nominal</p>
                </div>
              </div>
              <p style={{ fontSize: '9px', fontWeight: 700, marginTop: '20px', textAlign: 'center', opacity: 0.4 }}>PitHub v1.2.0 • ADMIN</p>
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
