import { CBadge } from '@coreui/react'
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  CHECK_IN_STATUS,
  CHECK_IN_STATUS_LABELS,
  ROOM_STATUS,
  ROOM_STATUS_LABELS,
} from '../constants/enums'

const STATUS_COLORS = {
  [BOOKING_STATUS.PENDIENTE]: 'warning',
  [BOOKING_STATUS.CONFIRMADA]: 'info',
  [BOOKING_STATUS.EN_ESTANCIA]: 'primary',
  [BOOKING_STATUS.FINALIZADA]: 'success',
  [BOOKING_STATUS.CANCELADA]: 'secondary',
  [ROOM_STATUS.DISPONIBLE]: 'success',
  [ROOM_STATUS.OCUPADA]: 'primary',
  [ROOM_STATUS.MANTENIMIENTO]: 'danger',
  [ROOM_STATUS.LIMPIEZA]: 'warning',
  [ROOM_STATUS.INACTIVA]: 'secondary',
  [CHECK_IN_STATUS.COMPLETADO]: 'success',
  [CHECK_IN_STATUS.CANCELADO]: 'secondary',
}

const STATUS_LABELS = { ...BOOKING_STATUS_LABELS, ...ROOM_STATUS_LABELS, ...CHECK_IN_STATUS_LABELS }

// Estados de reserva, habitacion y check-in con color consistente.
export default function StatusBadge({ status }) {
  return <CBadge color={STATUS_COLORS[status] ?? 'secondary'}>{STATUS_LABELS[status] ?? status}</CBadge>
}
