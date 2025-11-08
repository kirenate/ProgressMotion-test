import React from 'react';

function BookCard({ book }) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : '';
    const price = (book.price / 100).toFixed(2);
    const description = book.desc ? 
        (book.desc.length > 150 ? book.desc.substring(0, 150) + '...' : book.desc) : 
        '';

    return (
        <div className="book-card">
            <h3 className="book-title">{book.name}</h3>
            {authors && <p className="book-authors">{authors}</p>}
            <p className="book-price">${price}</p>
            {description && <p className="book-desc">{description}</p>}
        </div>
    );
}

export default BookCard;

