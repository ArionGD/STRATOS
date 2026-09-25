/**
 * Stratos Web API Client
 * Used when running in a normal browser (hosted build) instead of Tauri.
 * Talks to server/index.js and attaches the signed-in user's token.
 */
import useUserStore from '../store/useUserStore'

export const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

async function request(method, path, body) {
  const { token, logout } = useUserStore.getState();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired or invalid session: drop it so the UI sends the user back to login
    if (res.status === 401 && token) logout();
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const WebApi = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path)
};
