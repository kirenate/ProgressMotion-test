import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/api';
import { setToken } from '../utils/auth';
import '../App.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await register(username.trim(), password, adminKey.trim());
            if (data.token) {
                setSuccess('Registration successful! Redirecting...');
                setToken(data.token);
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            setError(error.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="adminKey">Admin Key (Optional)</label>
                        <input
                            type="text"
                            id="adminKey"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            autoComplete="off"
                        />
                        <small>Leave empty for regular user account</small>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
                <p className="auth-link">
                    <Link to="/">Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

