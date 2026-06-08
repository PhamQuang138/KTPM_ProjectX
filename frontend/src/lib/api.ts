const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const isFormData = options?.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : {'Content-Type': 'application/json'}),
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('Cannot connect to the server. Check that the backend and PostgreSQL are running.');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : {message: await response.text()};

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload.data as T;
}
