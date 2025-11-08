import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getUserInfo } from '../utils/auth';
import { getCart } from '../utils/api';
import SearchBar from './SearchBar';

function Header({ onLogout, onSearch, onClearSearch, searchTerm }) {
    const isAuth = isAuthenticated();
    const userInfo = getUserInfo();
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        if (isAuth) {
            loadCartCount();
            const interval = setInterval(loadCartCount, 5000);
            const handleCartUpdate = () => loadCartCount();
            window.addEventListener('cartUpdated', handleCartUpdate);
            return () => {
                clearInterval(interval);
                window.removeEventListener('cartUpdated', handleCartUpdate);
            };
        }
    }, [isAuth]);

    const loadCartCount = async () => {
        try {
            const result = await getCart();
            setCartItemCount(result.books ? result.books.length : 0);
        } catch (error) {
            setCartItemCount(0);
        }
    };

    return (
        <header>
            <div className="header-top">
                <h1>Book Store</h1>
                <div className="auth-buttons">
                    {isAuth && userInfo && (
                        <span className="user-info">Welcome, {userInfo.username}</span>
                    )}
                    {isAuth && (
                        <Link to="/cart" className="cart-link">
                            <span className="cart-icon">🛒</span>
                            {cartItemCount > 0 && (
                                <span className="cart-badge">{cartItemCount}</span>
                            )}
                        </Link>
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

