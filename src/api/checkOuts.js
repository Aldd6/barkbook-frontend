import client from './client'
import { ERROR_FLAGS } from './errors'
import { getCheckInByBooking } from './checkIns'

// null si el check-in todavia no tiene check-out (la API responde 404).
export const getCheckOutByCheckIn = (checkInId) =>
  client
    .get(`/check-outs/check-in/${checkInId}`)
    .then((r) => r.data.checkOut)
    .catch((error) => {
      if (error.flag === ERROR_FLAGS.RESOURCE_NOT_FOUND) return null
      throw error
    })

// Check-in y check-out de una reserva (cada uno null si no existe).
export const getStayByBooking = async (bookingId) => {
  const checkIn = await getCheckInByBooking(bookingId)
  const checkOut = checkIn ? await getCheckOutByCheckIn(checkIn.id) : null
  return { checkIn, checkOut }
}

// { checkInId, observations?, payment?: { methodPayment, reference?, description? } }
// payment cobra el saldo pendiente en el mismo paso (requiere "Aplicar pagos cobrados en mostrador").
export const createCheckOut = (data) => client.post('/check-outs', data).then((r) => r.data)
