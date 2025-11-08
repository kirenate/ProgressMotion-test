import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getUserInfo } from '../utils/auth';
import SearchBar from './SearchBar';

function Header({ onLogout, onSearch, onClearSearch, searchTerm }) {
    const isAuth = isAuthenticated();
    const userInfo = getUserInfo();

    return (
        <header>
            <div className="header-top">
                <h1>Book Store</h1>
                <div className="auth-buttons">
                    {isAuth && userInfo && (
                        <span className="user-info">Welcome, {userInfo.username}</span>
                    )}
                    {!isAuth && (
                        <>
                            <Link to="/login" className="auth-link-btn">Login</Link>
                            <Link to="/register" className="auth-link-btn">Register</Link>
                        </>
                    )}
                    {isAuth && (
                        <button onClick={onLogout} className="auth-link-btn">
                            Logout
                        </button>
                    )}
                </div>
            </div>
            <SearchBar 
                onSearch={onSearch} 
                onClear={onClearSearch}
                searchTerm={searchTerm}
            />
        </header>
    );
}

export default Header;

