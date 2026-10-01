const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000')
const apiOrigin = new URL(baseUrl, window.location.origin).origin

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }

  return response.status === 204 ? null : response.json()
}

export const githubLoginUrl = `${baseUrl}/api/auth/github`

export async function uploadPhoto(file) {
  const signed = await api('/uploads/sign', { method: 'POST', body: JSON.stringify({ type: file.type, size: file.size }) })
  if (signed.mode === 'supabase') {
    const response = await fetch(signed.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'x-upsert': 'false', 'cache-control': 'max-age=3600' },
      body: file,
    })
    if (!response.ok) throw new Error('Photo upload failed. Please try again.')
    return { url: signed.url }
  }
  const body = new FormData()
  body.append('photo', file)
  return api('/uploads', { method: 'POST', body })
}

export function assetUrl(path) {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path
  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}
