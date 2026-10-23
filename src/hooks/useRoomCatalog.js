import useApiQuery from './useApiQuery'
import { getBranches } from '../api/branches'
import { getRoomBranches, getRoomTypes } from '../api/rooms'

const byId = (items) => new Map(items.map((item) => [item.id, item]))

const loadCatalog = () =>
  Promise.all([getBranches(), getRoomTypes(), getRoomBranches()]).then(([branches, roomTypes, roomBranches]) => ({
    branches,
    roomTypes,
    roomBranches,
    branchById: byId(branches),
    roomTypeById: byId(roomTypes),
    roomBranchById: byId(roomBranches),
  }))

export default function useRoomCatalog() {
  return useApiQuery(loadCatalog)
}

export const describeRoomBranch = (catalog, branchRoomId) => {
  const roomBranch = catalog?.roomBranchById.get(branchRoomId)
  return {
    branch: roomBranch ? catalog.branchById.get(roomBranch.branchId) : undefined,
    roomType: roomBranch ? catalog.roomTypeById.get(roomBranch.roomTypeId) : undefined,
  }
}
