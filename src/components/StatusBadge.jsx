import { CBadge } from '@coreui/react'
import { BOOKING_STATUS_LABELS, CANCELLATION_STATUS_LABELS, CHECK_IN_STATUS_LABELS, ROOM_STATUS_LABELS, SERVICE_ORDER_STATUS_LABELS } from '../constants/enums'
import { statusColor } from './statusColors'

const STATUS_LABELS = { ...BOOKING_STATUS_LABELS, ...ROOM_STATUS_LABELS, ...CHECK_IN_STATUS_LABELS, ...CANCELLATION_STATUS_LABELS, ...SERVICE_ORDER_STATUS_LABELS }

// Estados de reserva, habitacion, check-in, cancelacion y orden de servicio con color consistente.
export default function StatusBadge({ status }) {
  return <CBadge color={statusColor(status)}>{STATUS_LABELS[status] ?? status}</CBadge>
}
