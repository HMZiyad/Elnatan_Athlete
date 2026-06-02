"use client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface APIError {
  message: string;
}

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === 'undefined';
  
  // Retrieve token depending on context (admin endpoints vs regular endpoints)
  let token = null;
  if (!isServer) {
    if (endpoint.includes('/admin/')) {
      token = localStorage.getItem('admin_token');
    } else {
      token = localStorage.getItem('uag_token');
    }
  }

  const headers = new Headers(options.headers || {});

  // Inject token if available
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject JSON content-type if we are sending a JSON payload and not a FormData/File
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && !isServer) {
      // If this is an authentication endpoint, let the form handle the 401 error
      if (endpoint.includes('/auth/')) {
        let errorMessage = 'Email or password is incorrect';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      // Clear session data on unauthorized
      localStorage.removeItem('uag_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('userRole');
      
      // Redirect based on whether it is an admin or fan/athlete endpoint
      if (endpoint.includes('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        if (errorData && errorData.error && typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || errorData.error.code || errorMessage;
        } else {
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Helper to upload files via multipart/form-data
export async function apiUpload(file: File, type: string = 'photo'): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await apiCall<{ success: boolean; data: { url: string } }>('/uploads', {
    method: 'POST',
    body: formData,
    // Note: Do not set Content-Type header manually for FormData,
    // the browser needs to set the boundary automatically.
  });
  return res.data;
}
