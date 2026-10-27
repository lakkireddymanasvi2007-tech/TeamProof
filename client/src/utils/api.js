const API_BASE = '' // Use same-origin relative URL so Render proxies /api/* directly to backend

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('teamproof_token')
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const config = {
    headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
    credentials: 'include',
    ...options,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, config)
  } catch (err) {
    throw new Error(err.message || 'Network error occurred. Please check your connection.')
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Invalid response'}`)
  }

  if (!data.success) {
    throw new Error(data.error || 'Something went wrong')
  }

  if (data.token) {
    localStorage.setItem('teamproof_token', data.token)
  }

  return data.data
}

api.get = (endpoint, options = {}) => api(endpoint, { method: 'GET', ...options })
api.post = (endpoint, body, options = {}) => api(endpoint, { method: 'POST', body, ...options })
api.put = (endpoint, body, options = {}) => api(endpoint, { method: 'PUT', body, ...options })
api.delete = (endpoint, options = {}) => api(endpoint, { method: 'DELETE', ...options })

export default api
