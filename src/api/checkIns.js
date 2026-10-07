import client from './client'
import { ERROR_FLAGS } from './errors'

// null si la reserva todavia no tiene check-in (la API responde 404).
export const getCheckInByBooking = (bookingId) =>
  client
    .get(`/check-ins/booking/${bookingId}`)
    .then((r) => r.data.checkIn)
    .catch((error) => {
      if (error.flag === ERROR_FLAGS.RESOURCE_NOT_FOUND) return null
      throw error
    })

// Habitaciones fisicas disponibles del tipo y sede de la reserva.
export const getAvailableRoomsForBooking = (bookingId) =>
  client.get(`/check-ins/booking/${bookingId}/available-rooms`).then((r) => r.data.roomInventory)

// { bookingId, pets: [{ bookingPetId, admitted, nonadmissionReason? }], customerAcceptsPartialAdmission?, roomNumber?, observations? }
export const createCheckIn = (data) => client.post('/check-ins', data).then((r) => r.data)
