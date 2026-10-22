import client from './client'

// Solo Administrador. `roles`: [{ id, name, permissions }].
export const getRoles = () => client.get('/roles').then((r) => r.data.roles)
