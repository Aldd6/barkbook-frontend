import client from './client'


export const getUsers = () => client.get('/users').then((r) => r.data.users)

export const createUser = (data) => client.post('/users', data).then((r) => r.data)
