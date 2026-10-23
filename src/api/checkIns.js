import client from './client'
import { ERROR_FLAGS } from './errors'

export const getCheckInByBooking = (bookingId) =>
  client
    .get(`/check-ins/booking/${bookingId}`)
    .then((r) => r.data.checkIn)
    .catch((error) => {
      if (error.flag === ERROR_FLAGS.RESOURCE_NOT_FOUND) return null
      throw error
    })

export const getAvailableRoomsForBooking = (bookingId) =>
  client.get(`/check-ins/booking/${bookingId}/available-rooms`).then((r) => r.data.roomInventory)

export const getBookingPetsForCheckIn = (bookingId) => client.get(`/check-ins/booking/${bookingId}/pets`).then((r) => r.data.pets)

export const createCheckIn = (data) => client.post('/check-ins', data).then((r) => r.data)
