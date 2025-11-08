import React, { useState } from 'react';
import { getUserInfo, isAuthenticated } from '../utils/auth';
import { addToCart } from '../utils/api';

function BookCard({ book, onEdit, onDelete, onCartUpdate, onBookClick }) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
    const price = (book.price / 100).toFixed(2);
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;
    const isAuth = isAuthenticated();
    const [adding, setAdding] = useState(false);

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

    const handleCardClick = () => {
        if (onBookClick) {
            onBookClick(book);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(book);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(book.id);
        }
    };

    return (
        <div className="book-card" onClick={handleCardClick}>
            <h3 className="book-title">{book.name}</h3>
            {authors && <p className="book-authors">{authors}</p>}
            <p className="book-price">${price}</p>
            {isAuth && (
                <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="book-add-cart-btn"
                >
                    {adding ? 'Adding...' : 'Add to Cart'}
                </button>
            )}
            {isAdmin && (
                <div className="book-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleEditClick} className="book-edit-btn">
                        Edit
                    </button>
                    <button onClick={handleDeleteClick} className="book-delete-btn">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookCard;

