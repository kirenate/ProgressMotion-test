import React from 'react';
import { getUserInfo } from '../utils/auth';

function BookCard({ book, onEdit, onDelete }) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
    const price = (book.price / 100).toFixed(2);
    const description = book.desc ? 
        (book.desc.length > 150 ? book.desc.substring(0, 150) + '...' : book.desc) : 
        '';
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;

    return (
        <div className="book-card">
            <h3 className="book-title">{book.name}</h3>
            {authors && <p className="book-authors">{authors}</p>}
            <p className="book-price">${price}</p>
            {description && <p className="book-desc">{description}</p>}
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

