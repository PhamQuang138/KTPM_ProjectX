const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...options?.headers,
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'API request failed');
  }

  return payload.data as T;
}
