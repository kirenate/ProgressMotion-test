import React, { useState } from 'react';
import { getUserInfo, isAuthenticated } from '../utils/auth';
import { addToCart } from '../utils/api';

function BookDetail({ book, categories, onClose, onCartUpdate }) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
    const price = (book.price / 100).toFixed(2);
    const description = book.desc || 'No description available.';
    const isAuth = isAuthenticated();
    const [adding, setAdding] = useState(false);

    // Get category names for this book
    const bookCategories = categories.filter(cat => 
        book.categories && book.categories.includes(cat.id)
    ).map(cat => cat.name);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!isAuth) {
            alert('Please login to add items to cart');
            return;
        }
        setAdding(true);
        try {
            await addToCart(book.id);
            if (onCartUpdate) {
                onCartUpdate();
            }
        } catch (error) {
            alert('Failed to add to cart: ' + error.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content book-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="book-detail-close" onClick={onClose}>×</button>
                <h2 className="book-detail-title">{book.name}</h2>
                
                {authors && (
                    <div className="book-detail-section">
                        <h3 className="book-detail-label">Authors</h3>
                        <p className="book-detail-value">{authors}</p>
                    </div>
                )}

                <div className="book-detail-section">
                    <h3 className="book-detail-label">Price</h3>
                    <p className="book-detail-price">${price}</p>
                </div>

                {bookCategories.length > 0 && (
                    <div className="book-detail-section">
                        <h3 className="book-detail-label">Categories</h3>
                        <div className="book-detail-categories">
                            {bookCategories.map((catName, index) => (
                                <span key={index} className="book-detail-category-tag">
                                    {catName}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="book-detail-section">
                    <h3 className="book-detail-label">Description</h3>
                    <p className="book-detail-description">{description}</p>
                </div>

                {isAuth && (
                    <div className="book-detail-actions">
                        <button 
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="book-detail-add-cart-btn"
                        >
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookDetail;

