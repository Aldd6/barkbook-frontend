import client from './client'
import { deleteFile, putFile } from './files'


export const getPetsByCustomer = (customerId) => client.get(`/pets/customer/${customerId}`).then((r) => r.data.pets)

export const getPet = (id) => client.get(`/pets/${id}`).then((r) => r.data.pet)

export const createPet = (data) => client.post('/pets', data).then((r) => r.data)

export const updatePet = (id, data) => client.put(`/pets/${id}`, data).then((r) => r.data)

export const deletePet = (id) => client.delete(`/pets/${id}`).then((r) => r.data)

export const updatePetProfilePicture = (id, file) => putFile(`/pets/${id}/profile-picture`, file)

export const removePetProfilePicture = (id) => deleteFile(`/pets/${id}/profile-picture`)

export const updatePetVaccinationCard = (id, file) => putFile(`/pets/${id}/vaccination-card`, file)

export const removePetVaccinationCard = (id) => deleteFile(`/pets/${id}/vaccination-card`)
