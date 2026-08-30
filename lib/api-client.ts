export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code: number;
  message: string;
  timestamp?: string;
  data: T;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const payload: ApiResponse<T> = await res.json();

  if (!res.ok || payload.status === 'error') {
    throw new Error(payload.message || 'Something went wrong');
  }

  return payload.data;
}