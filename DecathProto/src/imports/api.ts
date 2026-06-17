const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiGet(path: string) {
  return apiFetch(path, { method: 'GET' });
}

export async function apiPost(path: string, body?: unknown) {
  return apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export async function apiPut(path: string, body?: unknown) {
  return apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export default API_BASE_URL;
