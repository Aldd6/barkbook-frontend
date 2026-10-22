import client from './client'

export const getRoomTypes = () => client.get('/room-types').then((r) => r.data.roomTypes)

// Mutaciones (P: Gestionar tipos de habitacion): devuelven el body completo ({ message, roomType }).
// El prefijo solo se envia al crear: queda en el roomNumber de cada habitacion fisica y no se edita.
export const createRoomType = (data) => client.post('/room-types', data).then((r) => r.data)

export const updateRoomType = (id, data) => client.put(`/room-types/${id}`, data).then((r) => r.data)

export const deleteRoomType = (id) => client.delete(`/room-types/${id}`).then((r) => r.data)

// RoomBranch: que tipo de habitacion ofrece una sede (es lo que se reserva como branchRoomId).
export const getRoomBranches = () => client.get('/room-branches').then((r) => r.data.roomBranches)

export const getRoomBranchesByBranch = (branchId) =>
  client.get(`/room-branches/branch/${branchId}`).then((r) => r.data.roomBranches)

// Mutaciones (P: Gestionar habitaciones por sede): devuelven el body completo ({ message, roomBranch }).
// Alta: { branchId, roomTypeId, maximumQuantity }; 409 si la sede ya tiene ese tipo.
// Si la configuracion estaba archivada, el back end la restaura con el cupo nuevo.
export const createRoomBranch = (data) => client.post('/room-branches', data).then((r) => r.data)

// Solo { maximumQuantity }: 409 si es menor que las habitaciones vigentes ya generadas.
export const updateRoomBranch = (id, data) => client.put(`/room-branches/${id}`, data).then((r) => r.data)

export const deleteRoomBranch = (id) => client.delete(`/room-branches/${id}`).then((r) => r.data)

// --- Habitaciones fisicas (RoomInventory) ---

// Habitaciones fisicas vigentes (no incluye las archivadas). Cada una trae archivedAt: null.
export const getRoomInventory = () => client.get('/room-inventory').then((r) => r.data.roomInventory)

// Unica forma de crear habitaciones: en lote. { branchId, roomTypeId, quantity (1-500) }
export const generateRoomInventory = (data) => client.post('/room-inventory/generate', data).then((r) => r.data)

// Solo { status?, active? }: el numero de habitacion y su RoomBranch no se editan.
export const updateRoomInventory = (id, data) => client.put(`/room-inventory/${id}`, data).then((r) => r.data)

export const archiveRoomInventory = (id) => client.delete(`/room-inventory/${id}`).then((r) => r.data)

// Solo archivadas, de la mas reciente a la mas antigua (P: Gestionar habitaciones fisicas).
export const getArchivedRoomInventory = () => client.get('/room-inventory/archived').then((r) => r.data.roomInventory)

// 409 si la configuracion ya tiene maximumQuantity habitaciones vigentes.
export const restoreRoomInventory = (id) => client.patch(`/room-inventory/${id}/restore`).then((r) => r.data)
