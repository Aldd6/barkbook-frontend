import client from './client'

// Cada reserva incluye pets, bill y balance (saldo pendiente = CARGO - ABONO).

export const getBookingsByCustomer = (customerId) =>
  client.get(`/bookings/customer/${customerId}`).then((r) => r.data.bookings)

export const getBooking = (id) => client.get(`/bookings/${id}`).then((r) => r.data.booking)

// { branchRoomId, customerId, checkInDate, checkOutDate, petIds, paymentMethod, stripePaymentMethodId? }
export const createBooking = (data) => client.post('/bookings', data).then((r) => r.data)

// --- Recepcion (staff) ---

// Todas las reservas (P: Ver reservas del dia). La API no filtra por fecha: se filtra en el cliente.
export const getBookings = () => client.get('/bookings').then((r) => r.data.bookings)

// [{ booking, expiresAt, hoursRemaining }] de las reservas PENDIENTE DE CONFIRMAR.
export const getPendingBookings = () => client.get('/bookings/pending').then((r) => r.data.pendingBookings)

export const getAutoCancelledBookings = () => client.get('/bookings/auto-cancelled').then((r) => r.data.bookings)

// Registra un ABONO por todo el saldo. { methodPayment (no TARJETA), reference?, description? }
export const confirmBookingPayment = (id, data) => client.patch(`/bookings/${id}/confirm-payment`, data).then((r) => r.data)
