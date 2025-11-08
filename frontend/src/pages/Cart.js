import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { getCart, removeFromCart } from '../utils/api';
import Header from '../components/Header';
import '../App.css';

function Cart() {
    const [cart, setCart] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const handleRemove = async (bookId) => {
        try {
            await removeFromCart(bookId);
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            alert('Failed to remove item: ' + error.message);
        }
    };

    const handleLogout = async () => {
        navigate('/');
        window.location.reload();
    };

    const totalPrice = cart ? (cart.totalPrice / 100).toFixed(2) : '0.00';
    const itemCount = books.length;

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
                            {itemCount === 0 ? (
                                <div className="empty-cart">
                                    <p>Your cart is empty.</p>
                                    <Link to="/" className="auth-link-btn">Continue Shopping</Link>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {books.map((book) => {
                                            const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
                                            const price = (book.price / 100).toFixed(2);
                                            return (
                                                <div key={book.id} className="cart-item">
                                                    <div className="cart-item-info">
                                                        <h3 className="cart-item-title">{book.name}</h3>
                                                        {authors && <p className="cart-item-authors">{authors}</p>}
                                                        <p className="cart-item-price">${price}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemove(book.id)}
                                                        className="cart-remove-btn"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="cart-summary">
                                        <div className="cart-total">
                                            <span className="cart-total-label">Total:</span>
                                            <span className="cart-total-amount">${totalPrice}</span>
                                        </div>
                                        <p className="cart-item-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
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

