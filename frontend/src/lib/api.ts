/**
 * Centralized API client for Sparkle Bangles Shop.
 * Replaces the old Supabase client with direct fetch calls to the Express backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helper: get stored auth token ───────────────────────────────────────
function getToken(): string | null {
    return localStorage.getItem('sparkle_token');
}

export function setToken(token: string): void {
    localStorage.setItem('sparkle_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('sparkle_token');
}

// ─── Generic fetch wrapper ───────────────────────────────────────────────
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorBody.error || `Request failed: ${res.status}`);
    }

    return res.json();
}

// ─── Auth API ────────────────────────────────────────────────────────────
export const authAPI = {
    login: (email: string, password: string) =>
        request<{ user: any; session: { access_token: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (email: string, password: string, display_name?: string) =>
        request<{ user: any; session: { access_token: string } }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, display_name }),
        }),

    me: () => request<{ id: string; email: string; display_name?: string; avatar_url?: string; role: string }>('/auth/me'),

    updateProfile: (data: { display_name?: string; avatar_url?: string }) =>
        request<{ id: string; email: string; display_name?: string; avatar_url?: string; role: string }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ─── Payments API ────────────────────────────────────────────────────────
export const paymentsAPI = {
    createCheckoutSession: (data: { items: any[]; successUrl: string; cancelUrl: string }) =>
        request<{ url: string }>('/payments/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── Products API ────────────────────────────────────────────────────────
export const productsAPI = {
    getAll: (params?: { category?: string; hot_sales?: boolean; latest?: boolean }) => {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.hot_sales) query.set('hot_sales', 'true');
        if (params?.latest) query.set('latest', 'true');
        const qs = query.toString();
        return request<any[]>(`/products${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string) => request<any>(`/products/${id}`),

    create: (data: any) =>
        request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Orders API ──────────────────────────────────────────────────────────
export const ordersAPI = {
    getAll: (params?: { status?: string; limit?: number; offset?: number }) => {
        const query = new URLSearchParams();
        if (params?.status) query.set('status', params.status);
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        const qs = query.toString();
        return request<{ orders: any[]; total: number }>(`/orders${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string) => request<any>(`/orders/${id}`),

    create: (data: any) =>
        request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    getStats: () => request<{ totalRevenue: number; totalOrders: number; totalCustomers: number; recentOrders: any[] }>('/orders/stats'),
};

// ─── Customers API ───────────────────────────────────────────────────────
export const customersAPI = {
    getAll: (params?: { limit?: number; offset?: number }) => {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        const qs = query.toString();
        return request<{ customers: any[]; total: number }>(`/customers${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string) => request<any>(`/customers/${id}`),
};

// ─── Reviews API ─────────────────────────────────────────────────────────
export const reviewsAPI = {
    getAll: (params?: { product_id?: string; limit?: number; offset?: number }) => {
        const query = new URLSearchParams();
        if (params?.product_id) query.set('product_id', params.product_id);
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        const qs = query.toString();
        return request<{ reviews: any[]; total: number }>(`/reviews${qs ? `?${qs}` : ''}`);
    },

    hide: (id: string) =>
        request<any>(`/reviews/${id}`, { method: 'DELETE' }),

    getByProduct: (productId: string) => request<any[]>(`/reviews/product/${productId}`),

    postReview: (data: any) =>
        request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── User API ────────────────────────────────────────────────────────────
export const userAPI = {
    getProfile: () => request<{ _id: string; email: string; display_name: string; avatar_url?: string; role: string }>('/users/me'),
    getDashboard: () => request<{ user: any; orders: any[] }>('/users/dashboard'),
    toggleWishlist: (productId: string) =>
        request<{ wishlist: string[] }>(`/users/wishlist/toggle/${productId}`, { method: 'POST' }),
    updateCart: (items: any[]) =>
        request<{ cart: any[] }>('/users/cart', { method: 'POST', body: JSON.stringify({ items }) }),
};

// ─── Admin API ────────────────────────────────────────────────────────────
export const adminAPI = {
    getPaymentMethods: () => 
        request<{ stripe: boolean; paypal: boolean; cod: boolean }>(`/admin/settings/payment-methods?t=${Date.now()}`),
    
    updatePaymentMethods: (methods: { stripe?: boolean; paypal?: boolean; cod?: boolean }) =>
        request<{ message: string; payment_methods: { stripe: boolean; paypal: boolean; cod: boolean } }>(
            '/admin/settings/payment-methods',
            { method: 'PUT', body: JSON.stringify(methods) }
        ),
};
