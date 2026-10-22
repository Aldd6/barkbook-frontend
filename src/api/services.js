import client from './client'

// --- Catalogo de servicios ---

// GET con cualquier sesion. La API no lista los servicios archivados.
export const getServices = () => client.get('/services').then((r) => r.data.services)

// Mutaciones (P: Gestionar catalogo de servicios): devuelven el body completo ({ message, service }).
// { name, description?, serviceType, speciesType? (null = cualquier especie), isMultiGuest, rate }
// Cambiar la tarifa no afecta las ordenes ya contratadas ni los cargos registrados.
export const createService = (data) => client.post('/services', data).then((r) => r.data)

export const updateService = (id, data) => client.put(`/services/${id}`, data).then((r) => r.data)

export const deleteService = (id) => client.delete(`/services/${id}`).then((r) => r.data)

// --- Servicios por sede (ServiceBranch) ---

// Asignaciones vigentes: [{ id, branchId, serviceId, service }].
export const getServiceBranches = () => client.get('/service-branches').then((r) => r.data.serviceBranches)

// { branchId, serviceId }. 409 si la sede ya lo presta; si estaba retirado, el back end lo restaura.
export const createServiceBranch = (data) => client.post('/service-branches', data).then((r) => r.data)

export const deleteServiceBranch = (id) => client.delete(`/service-branches/${id}`).then((r) => r.data)

// --- Catalogo para una reserva EN ESTANCIA (Cliente) ---

// Solo servicios de la sede y especie de la reserva. Para contratarlos, ver api/serviceOrders.js.
export const getServicesForBooking = (bookingId) => client.get(`/services/booking/${bookingId}`).then((r) => r.data.services)
