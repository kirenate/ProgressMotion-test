import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getToken, setToken } from '../utils/auth';
import { getCart, removeFromCart, addToCart, logout } from '../utils/api';
import Header from '../components/Header';
import '../App.css';

function Cart() {
    const [cart, setCart] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({});
    const navigate = useNavigate();
    const isAuth = isAuthenticated();

    useEffect(() => {
        if (!isAuth) {
            navigate('/login');
            return;
        }
        loadCart();
    }, [isAuth, navigate]);

    const loadCart = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCart();
            setCart(result.cart);
            setBooks(result.books);
        } catch (error) {
            setError(error.message);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Group books by ID and count quantities
    const groupedBooks = useMemo(() => {
        if (!cart || !books.length) return [];
        
        const bookMap = new Map();
        books.forEach(book => {
            if (!bookMap.has(book.id)) {
                bookMap.set(book.id, { ...book, quantity: 0 });
            }
        });

        // Count occurrences in cart.bookIds
        if (cart.bookIds && Array.isArray(cart.bookIds)) {
            cart.bookIds.forEach(bookId => {
                const book = bookMap.get(bookId);
                if (book) {
                    book.quantity = (book.quantity || 0) + 1;
                }
            });
        }

        return Array.from(bookMap.values()).filter(book => book.quantity > 0);
    }, [cart, books]);

    const handleIncrease = async (bookId) => {
        setUpdating(prev => ({ ...prev, [bookId]: true }));
        try {
            await addToCart(bookId);
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            alert('Failed to add item: ' + error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [bookId]: false }));
        }
    };

    const handleDecrease = async (bookId) => {
        setUpdating(prev => ({ ...prev, [bookId]: true }));
        try {
            await removeFromCart(bookId);
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            alert('Failed to remove item: ' + error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [bookId]: false }));
        }
    };

    const handleLogout = async () => {
        const token = getToken();
        
        // Step 1: Call backend to invalidate token
        if (token) {
            try {
                await logout(token);
            } catch (error) {
                // Even if backend call fails, proceed with local logout
                console.error('Logout API error:', error);
            }
        }
        
        // Step 2: Clear local storage
        setToken(null);
        
        // Step 3: Dispatch event to clear cart count
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Step 4: Navigate and reload
        navigate('/');
        window.location.reload();
    };

    const totalPrice = cart ? (cart.totalPrice / 100).toFixed(2) : '0.00';
    const totalItems = groupedBooks.reduce((sum, book) => sum + book.quantity, 0);
    const uniqueItems = groupedBooks.length;

    return (
        <div className="container">
            <Header 
                onLogout={handleLogout}
                onSearch={() => {}}
                onClearSearch={() => {}}
                searchTerm=""
            />
            <div className="main-content">
                <main className="cart-section">
                    <h2>Shopping Cart</h2>
                    {loading && <div className="loading">Loading...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && (
                        <>
                            {uniqueItems === 0 ? (
                                <div className="empty-cart">
                                    <p>Your cart is empty.</p>
                                    <Link to="/" className="auth-link-btn">Continue Shopping</Link>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {groupedBooks.map((book) => {
                                            const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
                                            const price = (book.price / 100).toFixed(2);
                                            const subtotal = ((book.price * book.quantity) / 100).toFixed(2);
                                            const isUpdating = updating[book.id];
                                            return (
                                                <div key={book.id} className="cart-item">
                                                    <div className="cart-item-info">
                                                        <h3 className="cart-item-title">{book.name}</h3>
                                                        {authors && <p className="cart-item-authors">{authors}</p>}
                                                        <p className="cart-item-price">${price} each</p>
                                                        {book.quantity > 1 && (
                                                            <p className="cart-item-subtotal">Subtotal: ${subtotal}</p>
                                                        )}
                                                    </div>
                                                    <div className="cart-item-controls">
                                                        <div className="quantity-controls">
                                                            <button
                                                                onClick={() => handleDecrease(book.id)}
                                                                disabled={isUpdating || book.quantity <= 1}
                                                                className="quantity-btn quantity-btn-minus"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="quantity-display">{book.quantity}</span>
                                                            <button
                                                                onClick={() => handleIncrease(book.id)}
                                                                disabled={isUpdating}
                                                                className="quantity-btn quantity-btn-plus"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        {book.quantity === 1 && (
                                                            <button 
                                                                onClick={() => handleDecrease(book.id)}
                                                                disabled={isUpdating}
                                                                className="cart-remove-btn"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="cart-summary">
                                        <div className="cart-total">
                                            <span className="cart-total-label">Total:</span>
                                            <span className="cart-total-amount">${totalPrice}</span>
                                        </div>
                                        <p className="cart-item-count">
                                            {totalItems} item{totalItems !== 1 ? 's' : ''} 
                                            {uniqueItems !== totalItems && ` (${uniqueItems} unique)`}
                                        </p>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Cart;

