import React, { useState, useEffect } from 'react';

function BookModal({ book, categories, onSave, onClose }) {
    const [name, setName] = useState('');
    const [authors, setAuthors] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (book) {
            setName(book.name || '');
            setAuthors(Array.isArray(book.authors) ? book.authors.join(', ') : '');
            setPrice(book.price ? (book.price / 100).toString() : '');
            setDescription(book.desc || '');
            setSelectedCategories(book.categories || []);
        }
    }, [book]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const authorsArray = authors.split(',').map(a => a.trim()).filter(a => a);
            const priceInCents = Math.round(parseFloat(price) * 100);

            if (!name.trim()) {
                throw new Error('Book name is required');
            }
            if (authorsArray.length === 0) {
                throw new Error('At least one author is required');
            }
            if (isNaN(priceInCents) || priceInCents <= 0) {
                throw new Error('Valid price is required');
            }

            const bookData = {
                name: name.trim(),
                authors: authorsArray,
                price: priceInCents,
                desc: description.trim(),
                categories: selectedCategories
            };

            await onSave(bookData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{book ? 'Edit Book' : 'Create Book'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Book Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Authors (comma-separated) *</label>
                        <input
                            type="text"
                            value={authors}
                            onChange={(e) => setAuthors(e.target.value)}
                            placeholder="Author 1, Author 2"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Price (in dollars) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                        />
                    </div>
                    <div className="form-group">
                        <label>Categories</label>
                        <div className="category-checkboxes">
                            {categories.map(category => (
                                <label key={category.id} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => toggleCategory(category.id)}
                                    />
                                    {category.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? 'Saving...' : (book ? 'Update' : 'Create')}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="auth-btn"
                            style={{ background: '#999', marginLeft: '10px' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookModal;

