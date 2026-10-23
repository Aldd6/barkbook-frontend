import client, { refreshAccessToken } from './client'

export const signup = (data) => client.post('/auth/signup', data).then((r) => r.data.signup)

export const signin = (credentials) => client.post('/auth/signin', credentials).then((r) => r.data.accessToken)

export const refresh = refreshAccessToken

export const signout = () => client.post('/auth/signout')

export const me = () =>
  client.get('/auth/me').then(({ data }) => ({
    user: data.user,
    customer: data.customer,
    employee: data.employee,
    permissions: data.permissions,
  }))
