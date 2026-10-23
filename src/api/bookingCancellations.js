import client from './client'


export const requestBookingCancellation = (data) => client.post('/booking-cancellations', data).then((r) => r.data)

export const getCancellationsByBooking = (bookingId) =>
  client.get(`/booking-cancellations/booking/${bookingId}`).then((r) => r.data.bookingCancellations)


export const getBookingCancellations = (status) =>
  client.get('/booking-cancellations', { params: status ? { status } : undefined }).then((r) => r.data.bookingCancellations)

export const approveBookingCancellation = (id, data) => client.patch(`/booking-cancellations/${id}/approve`, data).then((r) => r.data)

export const rejectBookingCancellation = (id, data) => client.patch(`/booking-cancellations/${id}/reject`, data).then((r) => r.data)
