import { api } from './client'

// -> PageResponse<BoardResponse>
export const listBoards = ({ page = 0, size = 10, sortField = 'createdDate', sortDir = 'desc' } = {}) =>
  api.get(
    `/api/board?page=${page}&size=${size}&sortField=${sortField}&sortDir=${sortDir}`,
    { auth: false },
  )

// -> BoardResponse
export const getBoard = (id) => api.get(`/api/board/${id}`, { auth: false })

// payload: { title, content } -> BoardResponse
export const createBoard = (payload) => api.post('/api/board', payload)

export const updateBoard = (id, payload) => api.put(`/api/board/${id}`, payload)

// writer or admin only
export const deleteBoard = (id) => api.del(`/api/board/${id}`)
