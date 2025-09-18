// client/src/api.js
// Centralize API base to work in both dev and production.
// Production: backend and static build are served under '/nodeapp' on betterdigi.net
export const BASE_PATH = process.env.REACT_APP_BASE_PATH || '/nodeapp';

const withBase = (p = '') => `${BASE_PATH}${p}`;

export const API = {
  users: withBase('/users'),
  health: withBase('/api/health'),
};

export async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res;
}
