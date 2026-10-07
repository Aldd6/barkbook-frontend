import client from './client'

// Catalogo para cargar a una reserva: solo servicios de la sede y especie de la reserva.
export const getServicesForBooking = (bookingId) => client.get(`/services/booking/${bookingId}`).then((r) => r.data.services)

// { serviceId, paymentMethod (SERVICE_PAYMENT_OPTION), petIds?, stripePaymentMethodId?, description? }
// -> { message, bill, payment (abono con tarjeta o null), balance }
export const chargeServiceToBooking = (bookingId, data) =>
  client.post(`/services/booking/${bookingId}/charge`, data).then((r) => r.data)
