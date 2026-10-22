import client from './client'

// P: Gestionar usuarios. `user`: { id, uid, rolId, username, email, profileCompleted }.

export const getUsers = () => client.get('/users').then((r) => r.data.users)

export const createUser = (data) => client.post('/users', data).then((r) => r.data)
