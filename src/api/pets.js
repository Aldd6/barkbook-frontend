import client from './client'

// Consultas: devuelven el recurso. Mutaciones: devuelven el body completo ({ message, pet }).

export const getPetsByCustomer = (customerId) => client.get(`/pets/customer/${customerId}`).then((r) => r.data.pets)

export const getPet = (id) => client.get(`/pets/${id}`).then((r) => r.data.pet)

export const createPet = (data) => client.post('/pets', data).then((r) => r.data)

export const updatePet = (id, data) => client.put(`/pets/${id}`, data).then((r) => r.data)

export const deletePet = (id) => client.delete(`/pets/${id}`).then((r) => r.data)
