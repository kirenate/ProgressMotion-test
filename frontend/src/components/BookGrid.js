import React from 'react';
import BookCard from './BookCard';

function BookGrid({ books, onEditBook, onDeleteBook }) {
    if (books.length === 0) {
        return <p className="no-books">No books found.</p>;
    }

    return (
        <div className="books-grid">
            {books.map((book) => (
                <BookCard 
                    key={book.id} 
                    book={book}
                    onEdit={onEditBook}
                    onDelete={onDeleteBook}
                />
            ))}
        </div>
    );
}

export default BookGrid;

