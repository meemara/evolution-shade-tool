const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Users
  getUsers: () => request('/users'),

  // Projects
  getProjects: (search = '') => request(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Shades
  saveShades: (projectId, shades, userId) =>
    request(`/projects/${projectId}/shades`, {
      method: 'PUT',
      body: JSON.stringify({ shades, userId }),
    }),
};
