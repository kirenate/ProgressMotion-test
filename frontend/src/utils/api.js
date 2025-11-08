const API_BASE = 'https://kirenate.ru/api';

export async function fetchCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.categories || [];
}

export async function fetchBooks(page = 0, pageSize = 10, category = 'all', search = '') {
    let url;
    if (search) {
        url = `${API_BASE}/books/search/${encodeURIComponent(search)}?page=${page}&pageSize=${pageSize}&sortBy=name&orderBy=DESC`;
    } else if (category === 'all') {
        url = `${API_BASE}/books?page=${page}&pageSize=${pageSize}&sortBy=name&orderBy=DESC`;
    } else {
        url = `${API_BASE}/books/${encodeURIComponent(category)}?page=${page}&pageSize=${pageSize}&sortBy=name&orderBy=DESC`;
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

