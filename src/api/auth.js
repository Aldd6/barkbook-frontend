import client, { refreshAccessToken } from './client'

// POST /auth/signup -> { username, email }
export const signup = (data) => client.post('/auth/signup', data).then((r) => r.data.signup)

// POST /auth/signin ({ username? | email?, password }) -> accessToken
export const signin = (credentials) => client.post('/auth/signin', credentials).then((r) => r.data.accessToken)

// POST /auth/refresh (usa la cookie) -> accessToken
export const refresh = refreshAccessToken

// POST /auth/signout: invalida el refresh token y borra la cookie.
export const signout = () => client.post('/auth/signout')

// GET /auth/me -> { user, customer, employee, permissions }
export const me = () =>
  client.get('/auth/me').then(({ data }) => ({
    user: data.user,
    customer: data.customer,
    employee: data.employee,
    permissions: data.permissions,
  }))
