import client from './client'
import { deleteFile, putFile } from './files'

// P: Gestionar empleados. Consultas: devuelven el recurso. Mutaciones: el body completo ({ message, employee }).

export const getEmployees = () => client.get('/employees').then((r) => r.data.employees)

export const createEmployee = (data) => client.post('/employees', data).then((r) => r.data)

export const updateEmployee = (id, data) => client.put(`/employees/${id}`, data).then((r) => r.data)

export const deleteEmployee = (id) => client.delete(`/employees/${id}`).then((r) => r.data)

// Vincula un usuario (id numerico, no el uid) al empleado; el usuario queda con profileCompleted: true.
export const assignEmployeeUser = (id, userId) => client.patch(`/employees/${id}/assign-user`, { userId }).then((r) => r.data)

// Requieren que el empleado tenga usuario (409 si no). Ambas cierran las sesiones activas de ese usuario:
// su access token sigue valido hasta que vence (15 min) y despues debe iniciar sesion otra vez.

// { password } (8-72 caracteres). No pide la contrasena actual: la restablece quien gestiona empleados.
export const updateEmployeePassword = (id, password) => client.patch(`/employees/${id}/password`, { password }).then((r) => r.data)

// Inverso de assign-user: el empleado queda sin usuario (userId: null) y la cuenta, con profileCompleted: false.
// La cuenta no se archiva: puede volver a vincularse a este u otro empleado.
export const revokeEmployeeUser = (id) => client.patch(`/employees/${id}/revoke-user`).then((r) => r.data)

export const updateEmployeeProfilePicture = (id, file) => putFile(`/employees/${id}/profile-picture`, file)

export const removeEmployeeProfilePicture = (id) => deleteFile(`/employees/${id}/profile-picture`)
