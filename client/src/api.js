const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const apiOrigin = new URL(baseUrl, window.location.origin).origin

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }

  return response.status === 204 ? null : response.json()
}

export async function uploadPhoto(file) {
  const body = new FormData()
  body.append('photo', file)
  return api('/uploads', { method: 'POST', body })
}

export function assetUrl(path) {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path
  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}
