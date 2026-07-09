import { api } from './client'

// -> CartResponse
export const getCart = () => api.get('/api/cart')

// -> CartResponse
export const addCartItem = (bookId, quantity) => api.post('/api/cart/items', { bookId, quantity })

// -> CartResponse (quantity is a query param, not a body field)
export const updateCartItem = (cartItemId, quantity) =>
  api.put(`/api/cart/items/${cartItemId}?quantity=${quantity}`)

// -> CartResponse
export const removeCartItem = (cartItemId) => api.del(`/api/cart/items/${cartItemId}`)

// -> void
export const clearCart = () => api.del('/api/cart')
