import { api } from './client'

// -> MemberResponse
export const getMe = () => api.get('/api/member/me')

// payload: { name, phone, email, address, newPassword? }
// NOTE: fields omitted/null in the payload will overwrite existing values with null
// (except newPassword, which is only applied when non-blank) — always send full current values.
export const updateMe = (payload) => api.put('/api/member/me', payload)

export const deleteMe = () => api.del('/api/member/me')

// admin only -> MemberResponse[] (not paginated)
export const listMembers = () => api.get('/api/member')
