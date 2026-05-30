import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/style.css';
import googleIcon from '../../assets/google-icon.jpg';
import Spinner from "../../components/Spinner";

const LoginPage = () => {
	const { loginWithGoogle } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);
		try {
			await loginWithGoogle();
		} catch (error) {
			console.error(error);
		}
		setLoading(false);
	}

	return (
		<div className="login-screen">
			<header className="header">
				<div className="logo">
					<Link to="/">PitHub</Link>
				</div>
			</header>
			<div className="login-page-wrapper">
				<div className="login-card">
					<div className="login-header">
						<div className="login-logo">PitHub</div>
						<h1>Welcome Back</h1>
						<p>Sign in to access your classes and content</p>
					</div>

					<div className="login-actions">
						{/* Branded Google Sign-In Button */}
						{loading ? (
							<Spinner />
						) : (
							<button className="google-signin-btn" onClick={handleLogin}>
								<img 
									src={googleIcon}
									alt="Google icon" 
								/>
								<span>Sign in with Google</span>
							</button>
						)}
					</div>

					<div className="login-footer">
						<p>By signing in, you agree to our <a href="/terms">Terms of Service</a></p>
					</div>
					
					{/* 
						Note: If you want to add Email/Password later, 
						you would insert the form inputs here between the header and actions.
					*/}
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
