import client from './client'


export const getBookingsByCustomer = (customerId) =>
  client.get(`/bookings/customer/${customerId}`).then((r) => r.data.bookings)

export const getBooking = (id) => client.get(`/bookings/${id}`).then((r) => r.data.booking)

export const createBooking = (data) => client.post('/bookings', data).then((r) => r.data)


export const getBookings = () => client.get('/bookings').then((r) => r.data.bookings)

export const getPendingBookings = () => client.get('/bookings/pending').then((r) => r.data.pendingBookings)

export const getAutoCancelledBookings = () => client.get('/bookings/auto-cancelled').then((r) => r.data.bookings)

export const confirmBookingPayment = (id, data) => client.patch(`/bookings/${id}/confirm-payment`, data).then((r) => r.data)
