import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import useAuth from '../../../auth/useAuth'
import useApiQuery from '../../../hooks/useApiQuery'
import useRoomCatalog from '../../../hooks/useRoomCatalog'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import StatusBadge from '../../../components/StatusBadge'
import BillTable from '../../../components/BillTable'
import BookingInfoCard from '../../../components/booking/BookingInfoCard'
import StayInfoCard from '../../../components/booking/StayInfoCard'
import { getBooking } from '../../../api/bookings'
import { getPetsByCustomer } from '../../../api/pets'
import { getStayByBooking } from '../../../api/checkOuts'
import { BOOKING_STATUS } from '../../../constants/enums'
import { PERMISSIONS } from '../../../constants/permissions'
import { formatCurrency } from '../../../utils/format'

export default function BookingDetail() {
  const { id } = useParams()
  const { customer, hasPermission } = useAuth()
  const booking = useApiQuery(useCallback(() => getBooking(id), [id]))
  const stay = useApiQuery(useCallback(() => getStayByBooking(id), [id]))
  const pets = useApiQuery(useCallback(() => getPetsByCustomer(customer.id), [customer.id]))
  const catalog = useRoomCatalog()

  const petName = (petId) => pets.data?.find((pet) => pet.id === petId)?.name ?? `Mascota #${petId}`
  const canRequestServices =
    booking.data?.bookingStatus === BOOKING_STATUS.EN_ESTANCIA && hasPermission(PERMISSIONS.CARGAR_SERVICIOS_RESERVACION)

  return (
    <QueryState query={booking}>
      {booking.data && (
        <>
          <PageHeader
            title={
              <>
                Reserva #{booking.data.id} <StatusBadge status={booking.data.bookingStatus} />
              </>
            }
            actions={
              <>
                <CButton color="secondary" variant="ghost" as={Link} to="/reservas">
                  Volver
                </CButton>
                {canRequestServices && (
                  <CButton color="primary" as={Link} to={`/reservas/${id}/servicios`}>
                    <CIcon icon={cilPlus} className="me-1" />
                    Solicitar servicio
                  </CButton>
                )}
              </>
            }
          />

          <StatusNotice booking={booking.data} />

          <CRow className="g-4">
            <CCol lg={5}>
              <BookingInfoCard booking={booking.data} catalog={catalog.data} petName={petName} />
              <StayInfoCard checkIn={stay.data?.checkIn} checkOut={stay.data?.checkOut} petName={petName} />
            </CCol>
            <CCol lg={7}>
              <CCard>
                <CCardHeader className="fw-semibold">Estado de cuenta</CCardHeader>
                <CCardBody>
                  <BillTable bill={booking.data.bill} balance={booking.data.balance} />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </QueryState>
  )
}

function StatusNotice({ booking }) {
  if (booking.bookingStatus === BOOKING_STATUS.PENDIENTE) {
    return (
      <CAlert color="warning">
        Su reserva está pendiente de pago ({formatCurrency(booking.balance)}). Páguela en recepción dentro de los 5 días posteriores a la reserva;
        de lo contrario se cancelará automáticamente.
      </CAlert>
    )
  }
  if (booking.bookingStatus === BOOKING_STATUS.EN_ESTANCIA && booking.balance > 0) {
    return (
      <CAlert color="info">
        Tiene un saldo pendiente de {formatCurrency(booking.balance)} por servicios cargados a la cuenta. Se cobrará en recepción al hacer el
        check-out.
      </CAlert>
    )
  }
  if (booking.bookingStatus === BOOKING_STATUS.CANCELADA && booking.cancellationReason) {
    return <CAlert color="secondary">Reserva cancelada: {booking.cancellationReason}</CAlert>
  }
  return null
}
