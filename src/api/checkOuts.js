import client from './client'
import { ERROR_FLAGS } from './errors'
import { getCheckInByBooking } from './checkIns'

export const getCheckOutByCheckIn = (checkInId) =>
  client
    .get(`/check-outs/check-in/${checkInId}`)
    .then((r) => r.data.checkOut)
    .catch((error) => {
      if (error.flag === ERROR_FLAGS.RESOURCE_NOT_FOUND) return null
      throw error
    })

export const getStayByBooking = async (bookingId) => {
  const checkIn = await getCheckInByBooking(bookingId)
  const checkOut = checkIn ? await getCheckOutByCheckIn(checkIn.id) : null
  return { checkIn, checkOut }
}

export const createCheckOut = (data) => client.post('/check-outs', data).then((r) => r.data)
