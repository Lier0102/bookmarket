import { api } from './client'

// payload: {
//   customerName, customerPhone,
//   customerAddress: { country, zipcode, addressName, detailAddress },
//   shippingName, shippingDate,
//   shippingAddress: { country, zipcode, addressName, detailAddress },
// } -> OrderResponse
export const createOrder = (payload) => api.post('/api/order', payload)

// -> PageResponse<OrderResponse>
export const getMyOrders = ({ page = 0, size = 10, sortField = 'createdDate', sortDir = 'desc' } = {}) =>
  api.get(`/api/order/me?page=${page}&size=${size}&sortField=${sortField}&sortDir=${sortDir}`)

// -> OrderResponse
export const getMyOrder = (orderId) => api.get(`/api/order/me/${orderId}`)

// admin
export const adminListOrders = ({ page = 0, size = 10, sortField = 'orderId', sortDir = 'desc' } = {}) =>
  api.get(`/api/order/admin?page=${page}&size=${size}&sortField=${sortField}&sortDir=${sortDir}`)

export const adminGetOrder = (orderId) => api.get(`/api/order/admin/${orderId}`)

// payload: { shippingName?, shippingDate?, shippingAddress? }
export const adminUpdateOrder = (orderId, payload) => api.put(`/api/order/admin/${orderId}`, payload)

export const adminDeleteOrder = (orderId) => api.del(`/api/order/admin/${orderId}`)

export const adminDeleteAllOrders = () => api.del('/api/order/admin')
