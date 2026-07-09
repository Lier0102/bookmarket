export const BASE_URL = import.meta.env.VITE_API_BASE_URL

const ACCESS_KEY = 'bm.accessToken'
const REFRESH_KEY = 'bm.refreshToken'
const USER_KEY = 'bm.user'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setSession({ accessToken, refreshToken, username, role }) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify({ username, role }))
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  constructor(status, message, fieldErrors) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

let refreshPromise = null

// POST /api/auth/refresh expects the refresh token in the Authorization header, not a JSON body.
async function refreshSession() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError(401, '로그인이 필요합니다.')

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.data) {
    clearSession()
    throw new ApiError(res.status, json?.message ?? '세션이 만료되었습니다.')
  }

  setSession(json.data)
  return json.data
}

export async function request(
  path,
  { method = 'GET', body, auth = true, isForm = false, _retried = false } = {},
) {
  const headers = {}
  if (!isForm) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : isForm ? body : JSON.stringify(body),
  })

  const text = await res.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (res.status === 401 && auth && !_retried && getRefreshToken()) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null
        })
      }
      await refreshPromise
      return request(path, { method, body, auth, isForm, _retried: true })
    } catch {
      throw new ApiError(401, '세션이 만료되었습니다. 다시 로그인해주세요.')
    }
  }

  if (!res.ok) {
    const fieldErrors =
      json?.data && typeof json.data === 'object' && !Array.isArray(json.data)
        ? json.data
        : undefined
    throw new ApiError(json?.status ?? res.status, json?.message ?? '요청에 실패했습니다.', fieldErrors)
  }

  return json?.data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
