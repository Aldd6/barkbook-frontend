import client from './client'


export const createServiceOrders = (bookingId, data) => client.post(`/service-orders/booking/${bookingId}`, data).then((r) => r.data)

export const getServiceOrdersByBooking = (bookingId) =>
  client.get(`/service-orders/booking/${bookingId}`).then((r) => r.data.serviceOrders)


export const getServiceOrders = (status) =>
  client.get('/service-orders', { params: status ? { status } : undefined }).then((r) => r.data.serviceOrders)

export const completeServiceOrder = (id, data) => client.patch(`/service-orders/${id}/complete`, data).then((r) => r.data)

export const cancelServiceOrder = (id, data) => client.patch(`/service-orders/${id}/cancel`, data).then((r) => r.data)
