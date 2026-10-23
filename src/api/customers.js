import client from './client'
import { deleteFile, putFile } from './files'

export const createCustomer = (data) =>
  client.post('/customers', data).then(({ data: body }) => ({
    customer: body.customer,
    accessToken: body.accessToken,
  }))

export const getCustomer = (id) => client.get(`/customers/${id}`).then((r) => r.data.customer)

export const updateCustomer = (id, data) => client.put(`/customers/${id}`, data).then((r) => r.data)

export const getCustomers = () => client.get('/customers').then((r) => r.data.customers)

export const updateCustomerProfilePicture = (id, file) => putFile(`/customers/${id}/profile-picture`, file)

export const removeCustomerProfilePicture = (id) => deleteFile(`/customers/${id}/profile-picture`)
