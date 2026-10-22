import client from './client'
import { deleteFile, putFile } from './files'

// P: Gestionar empleados. Consultas: devuelven el recurso. Mutaciones: el body completo ({ message, employee }).

export const getEmployees = () => client.get('/employees').then((r) => r.data.employees)

export const createEmployee = (data) => client.post('/employees', data).then((r) => r.data)

export const updateEmployee = (id, data) => client.put(`/employees/${id}`, data).then((r) => r.data)

export const deleteEmployee = (id) => client.delete(`/employees/${id}`).then((r) => r.data)

// Vincula un usuario (id numerico, no el uid) al empleado; el usuario queda con profileCompleted: true.
export const assignEmployeeUser = (id, userId) => client.patch(`/employees/${id}/assign-user`, { userId }).then((r) => r.data)

export const updateEmployeeProfilePicture = (id, file) => putFile(`/employees/${id}/profile-picture`, file)

export const removeEmployeeProfilePicture = (id) => deleteFile(`/employees/${id}/profile-picture`)
