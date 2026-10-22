import client from './client'

export const getBranches = () => client.get('/branches').then((r) => r.data.branches)

export const getBranch = (id) => client.get(`/branches/${id}`).then((r) => r.data.branch)

// Mutaciones (P: Gestionar sedes): devuelven el body completo ({ message, branch }).
export const createBranch = (data) => client.post('/branches', data).then((r) => r.data)

export const updateBranch = (id, data) => client.put(`/branches/${id}`, data).then((r) => r.data)

export const deleteBranch = (id) => client.delete(`/branches/${id}`).then((r) => r.data)
