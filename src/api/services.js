import client from './client'


export const getServices = () => client.get('/services').then((r) => r.data.services)

export const createService = (data) => client.post('/services', data).then((r) => r.data)

export const updateService = (id, data) => client.put(`/services/${id}`, data).then((r) => r.data)

export const deleteService = (id) => client.delete(`/services/${id}`).then((r) => r.data)


export const getServiceBranches = () => client.get('/service-branches').then((r) => r.data.serviceBranches)

export const createServiceBranch = (data) => client.post('/service-branches', data).then((r) => r.data)

export const deleteServiceBranch = (id) => client.delete(`/service-branches/${id}`).then((r) => r.data)


export const getServicesForBooking = (bookingId) => client.get(`/services/booking/${bookingId}`).then((r) => r.data.services)
