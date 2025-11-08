import React, { useState } from 'react';
import { getUserInfo, isAuthenticated } from '../utils/auth';
import { addToCart } from '../utils/api';

function BookCard({ book, onEdit, onDelete, onCartUpdate }) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
    const price = (book.price / 100).toFixed(2);
    const description = book.desc ? 
        (book.desc.length > 150 ? book.desc.substring(0, 150) + '...' : book.desc) : 
        '';
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;
    const isAuth = isAuthenticated();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
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
        <div className="book-card">
            <h3 className="book-title">{book.name}</h3>
            {authors && <p className="book-authors">{authors}</p>}
            <p className="book-price">${price}</p>
            {description && <p className="book-desc">{description}</p>}
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
                <div className="book-actions">
                    <button onClick={() => onEdit(book)} className="book-edit-btn">
                        Edit
                    </button>
                    <button onClick={() => onDelete(book.id)} className="book-delete-btn">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookCard;

