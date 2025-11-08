import React from 'react';

function CategoryMenu({ categories, currentCategory, onSelectCategory }) {
    return (
        <aside className="sidebar">
            <h2>Categories</h2>
            <ul>
                <li>
                    <a
                        href="#"
                        className={`category-link ${currentCategory === 'all' ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelectCategory('all');
                        }}
                    >
                        All Books
                    </a>
                </li>
                {categories.map((category) => (
                    <li key={category.id}>
                        <a
                            href="#"
                            className={`category-link ${currentCategory === category.name ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectCategory(category.name);
                            }}
                        >
                            {category.name}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default CategoryMenu;

