import client from './client'

export const getEmergencyContactsByCustomer = (customerId) =>
  client.get(`/emergency-contacts/customer/${customerId}`).then((r) => r.data.emergencyContacts)

export const createEmergencyContact = (data) => client.post('/emergency-contacts', data).then((r) => r.data)

export const updateEmergencyContact = (id, data) => client.put(`/emergency-contacts/${id}`, data).then((r) => r.data)

export const deleteEmergencyContact = (id) => client.delete(`/emergency-contacts/${id}`).then((r) => r.data)
