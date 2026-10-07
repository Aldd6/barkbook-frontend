import { BOOKING_STATUS } from '../../constants/enums'
import { getBooking } from '../../api/bookings'
import { getCustomer } from '../../api/customers'
import { getPetsByCustomer } from '../../api/pets'
import { getEmergencyContactsByCustomer } from '../../api/emergencyContacts'
import { getStayByBooking } from '../../api/checkOuts'

// Expediente de una reserva para recepcion: reserva, cliente, sus mascotas y contactos, check-in/out.
export const loadBookingFile = async (bookingId) => {
  const booking = await getBooking(bookingId)
  const [customer, pets, emergencyContacts, stay] = await Promise.all([
    getCustomer(booking.customerId),
    getPetsByCustomer(booking.customerId),
    getEmergencyContactsByCustomer(booking.customerId),
    getStayByBooking(bookingId),
  ])
  return { booking, customer, pets, emergencyContacts, ...stay }
}

// Nombre de la mascota; las archivadas no vienen en el listado del cliente.
export const petNameFrom = (pets) => (petId) => pets.find((pet) => pet.id === petId)?.name ?? `Mascota #${petId}`

// Reglas de recepcion que reflejan las validaciones del back end (seccion 6 de API.md).

const AWAITING_ARRIVAL = [BOOKING_STATUS.CONFIRMADA, BOOKING_STATUS.PENDIENTE]

// El check-in solo se permite desde la fecha de entrada y antes de la fecha de salida.
export const isArrivalDue = (booking, today) =>
  AWAITING_ARRIVAL.includes(booking.bookingStatus) && booking.checkInDate <= today && today < booking.checkOutDate

// Estancias cuya fecha de salida es hoy o ya paso.
export const isDepartureDue = (booking, today) => booking.bookingStatus === BOOKING_STATUS.EN_ESTANCIA && booking.checkOutDate <= today

// Reserva activa en una fecha (entrada <= fecha < salida).
export const isActiveOn = (booking, day) => booking.checkInDate <= day && day < booking.checkOutDate

export const customerName = (customer) => (customer ? `${customer.name} ${customer.lastname}` : '—')
