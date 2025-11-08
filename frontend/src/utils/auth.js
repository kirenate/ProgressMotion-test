export function getToken() {
    return localStorage.getItem('jwt_token');
}

export function setToken(token) {
    if (token) {
        localStorage.setItem('jwt_token', token);
    } else {
        localStorage.removeItem('jwt_token');
    }
}

export function isAuthenticated() {
    return getToken() !== null;
}

export function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.username,
            admin: payload.admin || false
        };
    } catch (e) {
        console.error('Error parsing token:', e);
        return null;
    }
}

