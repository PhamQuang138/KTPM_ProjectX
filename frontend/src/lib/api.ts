const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL =
  import.meta.env.PROD && (!configuredApiUrl || configuredApiUrl === '/api')
    ? '/api/api'
    : configuredApiUrl ?? '/api';

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
    throw new Error('Không thể kết nối tới máy chủ. Hãy kiểm tra backend và PostgreSQL đang chạy.');
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
    throw new Error(payload.message || `Yêu cầu thất bại với mã ${response.status}`);
  }

  return payload.data as T;
}
