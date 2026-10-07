import client from './client'

export const getBranches = () => client.get('/branches').then((r) => r.data.branches)

export const getBranch = (id) => client.get(`/branches/${id}`).then((r) => r.data.branch)
