import { ROOM_STATUS, ROOM_STATUS_OPTIONS } from '../../constants/enums'
import { describeRoomBranch } from '../../hooks/useRoomCatalog'

export const MANUAL_ROOM_STATUS_OPTIONS = ROOM_STATUS_OPTIONS.filter((option) => option.value !== ROOM_STATUS.OCUPADA)

export const ROOM_STATUS_ORDER = [
  ROOM_STATUS.DISPONIBLE,
  ROOM_STATUS.OCUPADA,
  ROOM_STATUS.LIMPIEZA,
  ROOM_STATUS.MANTENIMIENTO,
  ROOM_STATUS.INACTIVA,
]

const byName = (a, b) => a.name.localeCompare(b.name, 'es')
const byRoomNumber = (a, b) => a.roomNumber.localeCompare(b.roomNumber, 'es', { numeric: true })

export const groupRooms = (rooms, catalog) => {
  const branches = new Map()
  for (const room of rooms) {
    const roomBranch = catalog?.roomBranchById.get(room.roomBranchId)
    const { branch, roomType } = describeRoomBranch(catalog, room.roomBranchId)
    const branchKey = roomBranch?.branchId ?? 'sin-sede'
    if (!branches.has(branchKey)) {
      branches.set(branchKey, { key: branchKey, name: branch?.branchName ?? 'Sede no disponible', types: new Map() })
    }
    const types = branches.get(branchKey).types
    if (!types.has(room.roomBranchId)) {
      types.set(room.roomBranchId, {
        key: room.roomBranchId,
        name: roomType?.name ?? `Configuración #${room.roomBranchId}`,
        roomType,
        rooms: [],
      })
    }
    types.get(room.roomBranchId).rooms.push(room)
  }

  return [...branches.values()].sort(byName).map((branch) => ({
    ...branch,
    types: [...branch.types.values()].sort(byName).map((type) => ({ ...type, rooms: type.rooms.sort(byRoomNumber) })),
  }))
}

export const roomNumberFor = (prefix, consecutive, maximumQuantity) =>
  `${prefix}${String(consecutive).padStart(String(maximumQuantity).length, '0')}`

export const lastConsecutive = (rooms, prefix) =>
  rooms.reduce((max, room) => {
    const digits = room.roomNumber.startsWith(prefix) ? room.roomNumber.slice(prefix.length) : ''
    return /^\d+$/.test(digits) ? Math.max(max, Number(digits)) : max
  }, 0)
