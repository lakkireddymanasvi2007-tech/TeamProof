const API_BASE = import.meta.env.VITE_API_URL || '' // Uses VITE_API_URL in production, falls back to relative path for dev proxy

export async function api(endpoint, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
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

  return data.data
}

api.get = (endpoint, options = {}) => api(endpoint, { method: 'GET', ...options })
api.post = (endpoint, body, options = {}) => api(endpoint, { method: 'POST', body, ...options })
api.put = (endpoint, body, options = {}) => api(endpoint, { method: 'PUT', body, ...options })
api.delete = (endpoint, options = {}) => api(endpoint, { method: 'DELETE', ...options })

export default api
