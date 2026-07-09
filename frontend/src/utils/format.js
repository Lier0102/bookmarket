const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

export function formatPrice(value) {
  const n = typeof value === 'string' ? Number(value) : value
  if (n == null || Number.isNaN(n)) return '-'
  return currencyFormatter.format(n)
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const NEW_RELEASE_WINDOW_DAYS = 30

export function isNewRelease(releaseDate) {
  if (!releaseDate) return false
  const parsed = new Date(releaseDate)
  if (Number.isNaN(parsed.getTime())) return false
  const days = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= NEW_RELEASE_WINDOW_DAYS
}
