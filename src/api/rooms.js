import client from './client'

export const getRoomTypes = () => client.get('/room-types').then((r) => r.data.roomTypes)

// RoomBranch: que tipo de habitacion ofrece una sede (es lo que se reserva como branchRoomId).
export const getRoomBranches = () => client.get('/room-branches').then((r) => r.data.roomBranches)

export const getRoomBranchesByBranch = (branchId) =>
  client.get(`/room-branches/branch/${branchId}`).then((r) => r.data.roomBranches)
