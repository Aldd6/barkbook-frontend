import client from './client'

export const getRoomTypes = () => client.get('/room-types').then((r) => r.data.roomTypes)

export const createRoomType = (data) => client.post('/room-types', data).then((r) => r.data)

export const updateRoomType = (id, data) => client.put(`/room-types/${id}`, data).then((r) => r.data)

export const deleteRoomType = (id) => client.delete(`/room-types/${id}`).then((r) => r.data)

export const getRoomBranches = () => client.get('/room-branches').then((r) => r.data.roomBranches)

export const getRoomBranchesByBranch = (branchId) =>
  client.get(`/room-branches/branch/${branchId}`).then((r) => r.data.roomBranches)

export const createRoomBranch = (data) => client.post('/room-branches', data).then((r) => r.data)

export const updateRoomBranch = (id, data) => client.put(`/room-branches/${id}`, data).then((r) => r.data)

export const deleteRoomBranch = (id) => client.delete(`/room-branches/${id}`).then((r) => r.data)


export const getRoomInventory = () => client.get('/room-inventory').then((r) => r.data.roomInventory)

export const generateRoomInventory = (data) => client.post('/room-inventory/generate', data).then((r) => r.data)

export const updateRoomInventory = (id, data) => client.put(`/room-inventory/${id}`, data).then((r) => r.data)

export const archiveRoomInventory = (id) => client.delete(`/room-inventory/${id}`).then((r) => r.data)

export const getArchivedRoomInventory = () => client.get('/room-inventory/archived').then((r) => r.data.roomInventory)

export const restoreRoomInventory = (id) => client.patch(`/room-inventory/${id}/restore`).then((r) => r.data)
