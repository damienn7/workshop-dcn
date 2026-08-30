const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:4000' : '');

export type ApiOptions = {
  signal?: AbortSignal;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = payload?.message ?? `Erreur API ${response.status} sur ${path}`;
    const err: any = new Error(message);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload as T;
}

export function apiGet<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, { method: 'GET', signal: options?.signal });
}

export function apiPost<T>(path: string, body?: unknown, options?: ApiOptions): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, signal: options?.signal });
}

export function apiPut<T>(path: string, body?: unknown, options?: ApiOptions): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, signal: options?.signal });
}

export default API_BASE_URL;
