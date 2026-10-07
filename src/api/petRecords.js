import client from './client'

// Expediente de la mascota: dietas, enfermedades y vacunas comparten el mismo patron de rutas.
const recordApi = (base, pluralKey) => ({
  listByPet: (petId) => client.get(`${base}/pet/${petId}`).then((r) => r.data[pluralKey]),
  create: (data) => client.post(base, data).then((r) => r.data),
  update: (id, data) => client.put(`${base}/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`${base}/${id}`).then((r) => r.data),
})

export const petDietsApi = {
  ...recordApi('/pet-diets', 'petDiets'),
  activate: (id) => client.patch(`/pet-diets/${id}/activate`).then((r) => r.data),
  deactivate: (id) => client.patch(`/pet-diets/${id}/deactivate`).then((r) => r.data),
}

export const petSanityApi = recordApi('/pet-sanity', 'petSanities')

export const petVaccinesApi = recordApi('/pet-vaccines', 'petVaccines')
