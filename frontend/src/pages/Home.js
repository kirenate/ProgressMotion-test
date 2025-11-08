import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import { fetchCategories, fetchBooks } from '../utils/api';
import { logout } from '../utils/api';
import { getToken } from '../utils/auth';
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
    const navigate = useNavigate();

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
                />
                <main className="books-section">
                    {loading && <div className="loading">Loading...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && (
                        <>
                            <BookGrid books={books} />
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
        </div>
    );
}

export default Home;

