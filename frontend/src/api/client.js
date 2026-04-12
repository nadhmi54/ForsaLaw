/**
 * Shared helpers for calling the Spring API (same origin + Vite proxy → backend).
 */

export async function parseApiError(response) {
  const text = await response.text()
  try {
    const data = JSON.parse(text)
    if (data && typeof data.message === 'string') return data.message
    return text || response.statusText
  } catch {
    return text || response.statusText || `HTTP ${response.status}`
  }
}

export function authHeaders(token, extra = {}) {
  const headers = { ...extra }
  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/** @returns {Promise<object>} UserDTO from GET /api/users/me */
export async function fetchCurrentUser(token) {
  const res = await fetch('/api/users/me', {
    headers: authHeaders(token),
  })
  if (!res.ok) {
    throw new Error(await parseApiError(res))
  }
  return res.json()
}
