import { parseApiError } from './client.js'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(await parseApiError(res))
  }
  const text = await res.text()
  if (!text) return null
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return JSON.parse(text)
  }
  return text
}

/** @returns {Promise<{ token: string, id: string, email: string, nom: string, prenom: string, roleUser: string }>} */
export function login({ email, motDePasse }) {
  return postJson('/api/auth/login', { email, motDePasse })
}

/** @returns {Promise<{ token: string, id: string, email: string, nom: string, prenom: string, roleUser: string }>} */
export function register({ nom, prenom, email, motDePasse }) {
  return postJson('/api/auth/register', { nom, prenom, email, motDePasse })
}

/** @returns {Promise<string>} */
export function forgotPassword({ email }) {
  return postJson('/api/auth/forgot-password', { email })
}

/** @returns {Promise<string>} */
export function resetPassword({ token, nouveauMotDePasse }) {
  return postJson('/api/auth/reset-password', { token, nouveauMotDePasse })
}

/** @returns {Promise<string>} */
export function requestUnlock({ email, message }) {
  return postJson('/api/auth/request-unlock', { email, message: message ?? '' })
}
