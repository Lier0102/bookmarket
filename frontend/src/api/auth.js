import { api } from './client'

// payload: { memberId, password, name, phone, email, address } -> MemberResponse
export const signup = (payload) => api.post('/api/auth/signup', payload, { auth: false })

// payload: { username, password } -> TokenResponse
export const login = (payload) => api.post('/api/auth/login', payload, { auth: false })
