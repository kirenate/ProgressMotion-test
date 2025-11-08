import React, { useState } from 'react';
import { getUserInfo } from '../utils/auth';
import { createCategory, updateCategory, deleteCategory } from '../utils/api';

function CategoryMenu({ categories, currentCategory, onSelectCategory, onCategoryChange }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const userInfo = getUserInfo();
    const isAdmin = userInfo && userInfo.admin;

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createCategory({ name: categoryName });
            setCategoryName('');
            setShowCreateModal(false);
            onCategoryChange();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await updateCategory(editingCategory.id, { name: categoryName });
            setEditingCategory(null);
            setCategoryName('');
            onCategoryChange();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        setError('');
        setLoading(true);

        try {
            await deleteCategory(categoryId);
            onCategoryChange();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setError('');
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setCategoryName('');
        setError('');
    };

    return (
        <aside className="sidebar">
            <h2>Categories</h2>
            {isAdmin && (
                <button 
                    className="admin-btn"
                    onClick={() => {
                        setShowCreateModal(true);
                        setError('');
                    }}
                >
                    + Add Category
                </button>
            )}
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
                    <li key={category.id} className="category-item">
                        {editingCategory && editingCategory.id === category.id ? (
                            <div className="category-edit-form">
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="category-edit-input"
                                    autoFocus
                                />
                                <div className="category-edit-actions">
                                    <button 
                                        onClick={handleUpdate}
                                        disabled={loading || !categoryName.trim()}
                                        className="category-save-btn"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={cancelEdit}
                                        disabled={loading}
                                        className="category-cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="category-link-wrapper">
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
                                {isAdmin && (
                                    <div className="category-actions">
                                        <button
                                            onClick={() => startEdit(category)}
                                            className="category-edit-btn"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            disabled={loading}
                                            className="category-delete-btn"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create Category</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <div className="modal-actions">
                                <button type="submit" disabled={loading || !categoryName.trim()} className="auth-btn">
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCategoryName('');
                                        setError('');
                                    }}
                                    className="auth-btn"
                                    style={{ background: '#999', marginLeft: '10px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </aside>
    );
}

export default CategoryMenu;

