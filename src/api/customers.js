import client from './client'

// POST /customers: crea el perfil del usuario del token.
// Devuelve un accessToken nuevo (profileCompleted: true) que reemplaza al anterior.
export const createCustomer = (data) =>
  client.post('/customers', data).then(({ data: body }) => ({
    customer: body.customer,
    accessToken: body.accessToken,
  }))

export const getCustomer = (id) => client.get(`/customers/${id}`).then((r) => r.data.customer)

export const updateCustomer = (id, data) => client.put(`/customers/${id}`, data).then((r) => r.data)

// Listado global (bloqueado para Clientes).
export const getCustomers = () => client.get('/customers').then((r) => r.data.customers)
