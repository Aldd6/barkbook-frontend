import client from './client'

// Ordenes de servicio durante la estancia. Cada una: { id, bookingId, branchId, serviceId, service, status
// (SERVICE_ORDER_STATUS), amount, description, pets: [{ id, name }], requestedByUserId, resolvedByUserId,
// resolutionNotes, requestedAt, resolvedAt, bookingBillId }.
// Contratar no carga nada a la cuenta: el CARGO se registra cuando el Cuidador completa la orden.

// Cliente (reserva EN ESTANCIA): { serviceId, petIds?, description? } -> { message, serviceOrders }.
// Un servicio por mascota genera una orden por cada mascota; uno grupal, una sola orden.
export const createServiceOrders = (bookingId, data) => client.post(`/service-orders/booking/${bookingId}`, data).then((r) => r.data)

// Historial de una reserva (propio para el Cliente).
export const getServiceOrdersByBooking = (bookingId) =>
  client.get(`/service-orders/booking/${bookingId}`).then((r) => r.data.serviceOrders)

// --- Cuidador (P: Subir informes de servicios completados) ---

// Solo las de la sede del empleado (todas para el Administrador), de la mas antigua a la mas reciente.
export const getServiceOrders = (status) =>
  client.get('/service-orders', { params: status ? { status } : undefined }).then((r) => r.data.serviceOrders)

// { resolutionNotes? } (informe) -> { message, serviceOrder, bill, balance }
export const completeServiceOrder = (id, data) => client.patch(`/service-orders/${id}/complete`, data).then((r) => r.data)

// { resolutionNotes } (motivo, obligatorio). Cliente dueño, Cuidador o Recepcionista de la sede.
export const cancelServiceOrder = (id, data) => client.patch(`/service-orders/${id}/cancel`, data).then((r) => r.data)
