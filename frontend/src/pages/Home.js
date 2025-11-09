import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import BookModal from '../components/BookModal';
import BookDetail from '../components/BookDetail';
import { fetchCategories, fetchBooks, createBook, updateBook, deleteBook } from '../utils/api';
import { logout } from '../utils/api';
import { getToken, getUserInfo, setToken } from '../utils/auth';
import '../App.css';

const PAGE_SIZE = 10;

function Home() {
    const [categories, setCategories] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentCategory, setCurrentCategory] = useState('all');
    const [currentSearch, setCurrentSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [orderBy, setOrderBy] = useState('DESC');
    const [hasMore, setHasMore] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const navigate = useNavigate();
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadBooks();
    }, [currentPage, currentCategory, currentSearch, sortBy, orderBy]);

    const loadCategories = async () => {
        try {
            const cats = await fetchCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const loadBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchBooks(currentPage, PAGE_SIZE, currentCategory, currentSearch, sortBy, orderBy);
            setBooks(result.books);
            setHasMore(result.books.length === PAGE_SIZE);
        } catch (error) {
            setError(error.message);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryName) => {
        setCurrentCategory(categoryName);
        setCurrentSearch('');
        setCurrentPage(0);
    };

    const handleSearch = (searchTerm) => {
        setCurrentSearch(searchTerm);
        setCurrentCategory('all');
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setCurrentSearch('');
        setCurrentPage(0);
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

    const handleCreateBook = () => {
        setEditingBook(null);
        setShowBookModal(true);
    };

    const handleEditBook = (book) => {
        setEditingBook(book);
        setShowBookModal(true);
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            await deleteBook(bookId);
            loadBooks();
        } catch (error) {
            alert('Failed to delete book: ' + error.message);
        }
    };

    const handleSaveBook = async (bookData) => {
        try {
            if (editingBook) {
                await updateBook(editingBook.id, bookData);
            } else {
                await createBook(bookData);
            }
            setShowBookModal(false);
            setEditingBook(null);
            loadBooks();
        } catch (error) {
            throw error;
        }
    };

    const handleBookClick = (book) => {
        setSelectedBook(book);
    };

    const handleCloseBookDetail = () => {
        setSelectedBook(null);
    };

    return (
        <div className="container">
            <Header 
                onLogout={handleLogout}
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                searchTerm={currentSearch}
            />
            <div className="main-content">
                <CategoryMenu 
                    categories={categories}
                    currentCategory={currentCategory}
                    onSelectCategory={handleCategorySelect}
                    onCategoryChange={loadCategories}
                />
                <main className="books-section">
                    {isAdmin && (
                        <div className="admin-section">
                            <button onClick={handleCreateBook} className="admin-btn">
                                + Add Book
                            </button>
                        </div>
                    )}
                    <div className="sort-controls">
                        <label htmlFor="sortBy">Sort by:</label>
                        <select 
                            id="sortBy"
                            value={sortBy} 
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="sort-select"
                        >
                            <option value="name">Name</option>
                            <option value="authors">Authors</option>
                            <option value="price">Price</option>
                        </select>
                        <label htmlFor="orderBy">Order:</label>
                        <select 
                            id="orderBy"
                            value={orderBy} 
                            onChange={(e) => {
                                setOrderBy(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="sort-select"
                        >
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </select>
                    </div>
                    {loading && <div className="loading">Loading...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && (
                        <>
                            <BookGrid 
                                books={books}
                                onEditBook={handleEditBook}
                                onDeleteBook={handleDeleteBook}
                                onCartUpdate={() => {
                                    window.dispatchEvent(new Event('cartUpdated'));
                                }}
                                onBookClick={handleBookClick}
                            />
                            <Pagination 
                                currentPage={currentPage}
                                hasMore={hasMore}
                                onPrevious={() => setCurrentPage(p => p - 1)}
                                onNext={() => setCurrentPage(p => p + 1)}
                            />
                        </>
                    )}
                </main>
            </div>
            {showBookModal && (
                <BookModal
                    book={editingBook}
                    categories={categories}
                    onSave={handleSaveBook}
                    onClose={() => {
                        setShowBookModal(false);
                        setEditingBook(null);
                    }}
                />
            )}
            {selectedBook && (
                <BookDetail
                    book={selectedBook}
                    categories={categories}
                    onClose={handleCloseBookDetail}
                    onCartUpdate={() => {
                        window.dispatchEvent(new Event('cartUpdated'));
                    }}
                />
            )}
        </div>
    );
}

export default Home;

