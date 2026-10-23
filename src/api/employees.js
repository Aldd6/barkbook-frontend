import client from './client'
import { deleteFile, putFile } from './files'


export const getEmployees = () => client.get('/employees').then((r) => r.data.employees)

export const createEmployee = (data) => client.post('/employees', data).then((r) => r.data)

export const updateEmployee = (id, data) => client.put(`/employees/${id}`, data).then((r) => r.data)

export const deleteEmployee = (id) => client.delete(`/employees/${id}`).then((r) => r.data)

export const assignEmployeeUser = (id, userId) => client.patch(`/employees/${id}/assign-user`, { userId }).then((r) => r.data)


export const updateEmployeePassword = (id, password) => client.patch(`/employees/${id}/password`, { password }).then((r) => r.data)

export const revokeEmployeeUser = (id) => client.patch(`/employees/${id}/revoke-user`).then((r) => r.data)

export const updateEmployeeProfilePicture = (id, file) => putFile(`/employees/${id}/profile-picture`, file)

export const removeEmployeeProfilePicture = (id) => deleteFile(`/employees/${id}/profile-picture`)
