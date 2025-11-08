import React from 'react';

function Pagination({ currentPage, hasMore, onPrevious, onNext }) {
    return (
        <div className="pagination">
            {currentPage > 0 && (
                <button onClick={onPrevious} className="pagination-btn">
                    Previous
                </button>
            )}
            <span className="page-info">Page {currentPage + 1}</span>
            {hasMore && (
                <button onClick={onNext} className="pagination-btn">
                    Next
                </button>
            )}
        </div>
    );
}

export default Pagination;

