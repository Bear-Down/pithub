import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { app } from '../../../lib/firebase'; // Assuming firebase.js exports 'app'
import '../../../styles/style.css';

/**
 * @file AdminLoginPage.jsx
 * @description This component provides a dedicated login interface for administrators.
 *              It uses Firebase Email/Password authentication and sets session persistence
 *              to 'session' for enhanced security. After successful login, it verifies
 *              the user's role in Firestore and redirects to the admin dashboard.
 */

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Set session persistence for admin login
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // If authentication succeeds, the AuthContext will handle the 
      // role verification and document creation automatically.
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        default:
          setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <header className="header">
        <div className="logo">
          <Link to="/">PitHub Admin</Link>
        </div>
      </header>

      <main className="login-page-wrapper">
        {/* Subtle background flair matching student view */}
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">PitHub Admin</div>
            <h1>Admin Sign In</h1>
            <p>Please enter your administrative credentials</p>
          </div>

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="modal-input"
                style={{ margin: '8px 0' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="modal-input"
                style={{ margin: '8px 0' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="create-class-btn"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Authorized access only. All sessions are monitored.</p>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-container">
          <div className="footer-center">
            &copy; {new Date().getFullYear()} PitHub Admin Portal
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLoginPage;