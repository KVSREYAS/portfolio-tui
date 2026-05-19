/** Backend base URL (no trailing slash). Empty = same origin / Vite dev proxy. */
function normalizeApiBase(raw: string): string {
  const base = raw.trim().replace(/\/$/, '')
  if (!base) return ''
  if (/^https?:\/\//i.test(base)) return base
  return `https://${base}`
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL ?? '')

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${normalized}` : normalized
}
