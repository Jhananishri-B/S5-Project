/**
 * API Service Layer Placeholder
 * Configured to dynamically load backend URL from VITE_API_BASE_URL
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get current configured API Base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Standard fetch wrapper with basic error handling and JSON parsing
 * @param {string} endpoint - API path (e.g., '/health', '/api/v1/content')
 * @param {RequestInit} [options] - Fetch request options
 */
export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => null);

        return {
            ok: response.ok,
            status: response.status,
            data,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error.message || 'Network request failed',
        };
    }
}

/**
 * Application health check placeholder
 */
export async function checkBackendHealth() {
    return apiFetch('/health');
}

/**
 * Database health check placeholder
 */
export async function checkDatabaseHealth() {
    return apiFetch('/health/db');
}

export default {
    getApiBaseUrl,
    apiFetch,
    checkBackendHealth,
    checkDatabaseHealth,
};
