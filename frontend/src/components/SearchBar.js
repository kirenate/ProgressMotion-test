import React, { useState } from 'react';

function SearchBar({ onSearch, onClear, searchTerm }) {
    const [inputValue, setInputValue] = useState(searchTerm || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const term = inputValue.trim();
        if (term) {
            onSearch(term);
        }
    };

    const handleClear = () => {
        setInputValue('');
        onClear();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search books..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button onClick={handleSubmit} className="search-btn">
                Search
            </button>
            <button onClick={handleClear} className="clear-btn">
                Clear
            </button>
        </div>
    );
}

export default SearchBar;

