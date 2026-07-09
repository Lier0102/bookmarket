import { api, BASE_URL } from './client'

// -> PageResponse<BookResponse>
// keyword matches against title OR author (case-insensitive, server-side)
export const listBooks = ({ page = 0, size = 10, sortField = 'name', sortDir = 'desc', keyword = '' } = {}) => {
  const params = new URLSearchParams({ page, size, sortField, sortDir })
  if (keyword) params.set('keyword', keyword)
  return api.get(`/api/book?${params.toString()}`, { auth: false })
}

// -> BookResponse
export const getBook = (bookId) => api.get(`/api/book/${bookId}`, { auth: false })

// -> BookResponse[]
export const getBooksByCategory = (category) =>
  api.get(`/api/book/category/${encodeURIComponent(category)}`, { auth: false })

// -> BookResponse[]
export const filterBooks = ({ publisher, category } = {}) => {
  const params = new URLSearchParams()
  if (publisher) params.set('publisher', publisher)
  if (category) params.set('category', category)
  return api.get(`/api/book/filter?${params.toString()}`, { auth: false })
}

export const bookImageUrl = (bookId) => `${BASE_URL}/api/book/${bookId}/image`

// admin only
export const uploadBookImage = (bookId, file) => {
  const form = new FormData()
  form.append('imageFile', file)
  return api.post(`/api/book/${bookId}/image`, form, { isForm: true })
}
