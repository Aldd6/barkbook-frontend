import { BOOKING_STATUS, CANCELLATION_STATUS, CHECK_IN_STATUS, ROOM_STATUS } from '../constants/enums'

// Color de CoreUI para cada estado de reserva, habitacion, check-in y solicitud de cancelacion.
export const STATUS_COLORS = Object.freeze({
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
  [CANCELLATION_STATUS.PENDIENTE]: 'warning',
  [CANCELLATION_STATUS.APROBADA]: 'success',
  [CANCELLATION_STATUS.RECHAZADA]: 'danger',
})

export const statusColor = (status) => STATUS_COLORS[status] ?? 'secondary'
