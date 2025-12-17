const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  '';

/**
 * Small helper to detect if API base is missing and expose a message
 */
export function getApiConfigStatus() {
  const missing = !API_BASE || API_BASE.trim() === '';
  return {
    missing,
    message: missing
      ? 'API base URL is not configured. Set REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) to enable saving/loading notes.'
      : '',
    base: API_BASE,
  };
}

// Wrap fetch with basic error handling
async function request(path, options = {}) {
  if (!API_BASE) {
    // Simulate a failed network when not configured
    const err = new Error('API base URL missing');
    err.code = 'NO_API_BASE';
    throw err;
  }

  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const resp = await fetch(url, { ...options, headers });
  const text = await resp.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!resp.ok) {
    const err = new Error((data && data.message) || `Request failed: ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** List notes from backend. Returns [] if API missing to allow graceful UI. */
  try {
    const res = await request('/notes', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  } catch (e) {
    if (e.code === 'NO_API_BASE') {
      // Graceful fallback
      return [];
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Get a single note by id. */
  const res = await request(`/notes/${encodeURIComponent(id)}`, { method: 'GET' });
  return res;
}

// PUBLIC_INTERFACE
export async function createNote(note) {
  /** Create a note: {title, content}. Returns created note. */
  const res = await request('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
  return res;
}

// PUBLIC_INTERFACE
export async function updateNote(id, note) {
  /** Update a note by id. Returns updated note. */
  const res = await request(`/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
  return res;
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. Returns success response. */
  const res = await request(`/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res;
}
