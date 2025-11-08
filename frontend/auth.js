const API_BASE = 'http://localhost:8080/api';

function getToken() {
    return localStorage.getItem('jwt_token');
}

function setToken(token) {
    if (token) {
        localStorage.setItem('jwt_token', token);
    } else {
        localStorage.removeItem('jwt_token');
    }
}

function isAuthenticated() {
    return getToken() !== null;
}

function getAuthHeaders() {
    const token = getToken();
    if (!token) {
        return {
            'Content-Type': 'application/json'
        };
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

async function apiFetch(url, options = {}) {
    const defaultOptions = {
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(url, mergedOptions);
        return response;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server. Please check if the backend is running and CORS is enabled.');
        }
        throw error;
    }
}

async function logout() {
    const token = getToken();
    if (!token) {
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE}/restricted/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            setToken(null);
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        setToken(null);
        window.location.href = 'index.html';
    }
}

