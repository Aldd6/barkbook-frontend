import client from './client'

// Solicitudes de cancelacion de reservas. Cada una: { id, bookingId, branchId, reason, status
// (CANCELLATION_STATUS), requestedByUserId, resolvedByUserId, resolutionNotes, requestedAt, resolvedAt }.

// Cliente: { bookingId, reason }. Solo reservas confirmadas o pendientes, una solicitud pendiente a la vez.
export const requestBookingCancellation = (data) => client.post('/booking-cancellations', data).then((r) => r.data)

// Historial de una reserva, de la mas reciente a la mas antigua (propio para el Cliente).
export const getCancellationsByBooking = (bookingId) =>
  client.get(`/booking-cancellations/booking/${bookingId}`).then((r) => r.data.bookingCancellations)

// --- Recepcion (P: Gestionar cancelaciones de reservacion) ---

// Solo las de la sede del empleado (todas para el Administrador); cada una incluye `booking`.
export const getBookingCancellations = (status) =>
  client.get('/booking-cancellations', { params: status ? { status } : undefined }).then((r) => r.data.bookingCancellations)

// Cancela la reserva y reembolsa sus pagos. { resolutionNotes? } -> { message, bookingCancellation, booking }
export const approveBookingCancellation = (id, data) => client.patch(`/booking-cancellations/${id}/approve`, data).then((r) => r.data)

// { resolutionNotes } (obligatorio): la reserva no cambia.
export const rejectBookingCancellation = (id, data) => client.patch(`/booking-cancellations/${id}/reject`, data).then((r) => r.data)
