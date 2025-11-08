import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import BookModal from '../components/BookModal';
import { fetchCategories, fetchBooks, createBook, updateBook, deleteBook } from '../utils/api';
import { logout } from '../utils/api';
import { getToken, getUserInfo } from '../utils/auth';
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
    const [hasMore, setHasMore] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const navigate = useNavigate();
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadBooks();
    }, [currentPage, currentCategory, currentSearch]);

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
            const result = await fetchBooks(currentPage, PAGE_SIZE, currentCategory, currentSearch);
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
        if (token) {
            await logout(token);
        }
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
                    {loading && <div className="loading">Loading...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && (
                        <>
                            <BookGrid 
                                books={books}
                                onEditBook={handleEditBook}
                                onDeleteBook={handleDeleteBook}
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
        </div>
    );
}

export default Home;

