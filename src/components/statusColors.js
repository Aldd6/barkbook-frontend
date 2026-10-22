import { BOOKING_STATUS, CANCELLATION_STATUS, CHECK_IN_STATUS, ROOM_STATUS, SERVICE_ORDER_STATUS } from '../constants/enums'

// Color de CoreUI para cada estado de reserva, habitacion, check-in, solicitud de cancelacion y orden de servicio.
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
  // Mismas claves que CHECK_IN_STATUS y CANCELLATION_STATUS.PENDIENTE: mismo color.
  [SERVICE_ORDER_STATUS.PENDIENTE]: 'warning',
  [SERVICE_ORDER_STATUS.COMPLETADO]: 'success',
  [SERVICE_ORDER_STATUS.CANCELADO]: 'secondary',
})

export const statusColor = (status) => STATUS_COLORS[status] ?? 'secondary'
