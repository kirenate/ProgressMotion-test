const API_BASE = 'https://kirenate.ru/api';

export async function fetchCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.categories || [];
}

export async function fetchBooks(page = 0, pageSize = 10, category = 'all', search = '', sortBy = 'name', orderBy = 'DESC') {
    let url;
    if (search) {
        url = `${API_BASE}/books/search/${encodeURIComponent(search)}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&orderBy=${orderBy}`;
    } else if (category === 'all') {
        url = `${API_BASE}/books?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&orderBy=${orderBy}`;
    } else {
        url = `${API_BASE}/books/${encodeURIComponent(category)}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&orderBy=${orderBy}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return { books: [] };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { books: data.books || [] };
}

export async function register(username, password, adminKey = '') {
    const body = { username, password };
    if (adminKey) {
        body.key = adminKey;
    }

    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

export async function login(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

export async function logout(token) {
    const response = await fetch(`${API_BASE}/restricted/auth/logout`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.ok;
}

function getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        throw new Error('Not authenticated');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

export async function createBook(book) {
    const response = await fetch(`${API_BASE}/restricted/books`, {
        method: 'POST',
        mode: 'cors',
        headers: getAuthHeaders(),
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        let errorMessage = 'Failed to create book';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function updateBook(bookId, book) {
    const response = await fetch(`${API_BASE}/restricted/books/${bookId}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: getAuthHeaders(),
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        let errorMessage = 'Failed to update book';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function deleteBook(bookId) {
    const response = await fetch(`${API_BASE}/restricted/books/${bookId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        let errorMessage = 'Failed to delete book';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function createCategory(category) {
    const response = await fetch(`${API_BASE}/restricted/categories`, {
        method: 'POST',
        mode: 'cors',
        headers: getAuthHeaders(),
        body: JSON.stringify(category)
    });

    if (!response.ok) {
        let errorMessage = 'Failed to create category';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function updateCategory(categoryId, category) {
    const response = await fetch(`${API_BASE}/restricted/categories/${categoryId}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: getAuthHeaders(),
        body: JSON.stringify(category)
    });

    if (!response.ok) {
        let errorMessage = 'Failed to update category';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function deleteCategory(categoryId) {
    const response = await fetch(`${API_BASE}/restricted/categories/${categoryId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        let errorMessage = 'Failed to delete category';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function addToCart(bookId) {
    const response = await fetch(`${API_BASE}/restricted/cart`, {
        method: 'POST',
        mode: 'cors',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: bookId })
    });

    if (!response.ok) {
        let errorMessage = 'Failed to add to cart';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

export async function getCart() {
    const response = await fetch(`${API_BASE}/restricted/cart`, {
        method: 'GET',
        mode: 'cors',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        if (response.status === 404) {
            return { cart: null, books: [] };
        }
        let errorMessage = 'Failed to get cart';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return { cart: data.cart, books: data.books || [] };
}

export async function removeFromCart(bookId) {
    const response = await fetch(`${API_BASE}/restricted/cart/${bookId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        let errorMessage = 'Failed to remove from cart';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return response.ok;
}

