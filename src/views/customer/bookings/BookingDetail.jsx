import { useCallback, useState } from 'react'
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
import CancellationRequestModal from '../../../components/booking/CancellationRequestModal'
import ServiceOrdersTable from '../../../components/booking/ServiceOrdersTable'
import ResolveServiceOrderModal from '../../../components/booking/ResolveServiceOrderModal'
import { getBooking } from '../../../api/bookings'
import { getPetsByCustomer } from '../../../api/pets'
import { getStayByBooking } from '../../../api/checkOuts'
import { getCancellationsByBooking } from '../../../api/bookingCancellations'
import { getServiceOrdersByBooking } from '../../../api/serviceOrders'
import { BOOKING_STATUS, CANCELLATION_STATUS } from '../../../constants/enums'
import { PERMISSIONS } from '../../../constants/permissions'
import { formatCurrency, formatDateTime } from '../../../utils/format'

export default function BookingDetail() {
  const { id } = useParams()
  const { customer, hasPermission } = useAuth()
  const booking = useApiQuery(useCallback(() => getBooking(id), [id]))
  const stay = useApiQuery(useCallback(() => getStayByBooking(id), [id]))
  const pets = useApiQuery(useCallback(() => getPetsByCustomer(customer.id), [customer.id]))
  const cancellations = useApiQuery(useCallback(() => getCancellationsByBooking(id), [id]))
  const serviceOrders = useApiQuery(useCallback(() => getServiceOrdersByBooking(id), [id]))
  const catalog = useRoomCatalog()
  const [requestingCancel, setRequestingCancel] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)

  const petName = (petId) => pets.data?.find((pet) => pet.id === petId)?.name ?? `Mascota #${petId}`
  const latestCancellation = cancellations.data?.[0]
  const cancellable = [BOOKING_STATUS.CONFIRMADA, BOOKING_STATUS.PENDIENTE].includes(booking.data?.bookingStatus)
  const canRequestCancel =
    cancellable &&
    cancellations.data !== undefined &&
    latestCancellation?.status !== CANCELLATION_STATUS.PENDIENTE &&
    hasPermission(PERMISSIONS.SOLICITAR_CANCELACION_RESERVACION)
  const inStay = booking.data?.bookingStatus === BOOKING_STATUS.EN_ESTANCIA
  const canRequestServices = inStay && hasPermission(PERMISSIONS.CARGAR_SERVICIOS_RESERVACION)
  const showServiceOrders = inStay || serviceOrders.data?.length > 0

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
                {canRequestCancel && (
                  <CButton color="danger" variant="outline" onClick={() => setRequestingCancel(true)}>
                    Solicitar cancelación
                  </CButton>
                )}
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
          {cancellable && <CancellationNotice cancellation={latestCancellation} />}

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
              {showServiceOrders && (
                <CCard className="mt-4">
                  <CCardHeader className="fw-semibold">Servicios contratados</CCardHeader>
                  <CCardBody>
                    <p className="small text-body-secondary">Cada servicio se carga al estado de cuenta cuando el cuidador lo completa.</p>
                    <QueryState query={serviceOrders}>
                      <ServiceOrdersTable
                        orders={serviceOrders.data}
                        onCancel={canRequestServices ? (order) => setOrderToCancel(order) : undefined}
                        emptyText="Aún no ha solicitado servicios en esta estancia."
                      />
                    </QueryState>
                  </CCardBody>
                </CCard>
              )}
            </CCol>
          </CRow>

          <CancellationRequestModal
            key={requestingCancel ? 'open' : 'closed'}
            booking={booking.data}
            visible={requestingCancel}
            onClose={() => setRequestingCancel(false)}
            onRequested={cancellations.reload}
          />
          <ResolveServiceOrderModal
            key={orderToCancel?.id ?? 'closed'}
            action={orderToCancel ? { order: orderToCancel, complete: false } : null}
            onClose={() => setOrderToCancel(null)}
            onResolved={serviceOrders.reload}
          />
        </>
      )}
    </QueryState>
  )
}

function CancellationNotice({ cancellation }) {
  if (cancellation?.status === CANCELLATION_STATUS.PENDIENTE) {
    return (
      <CAlert color="warning">
        Solicitó la cancelación de esta reserva el {formatDateTime(cancellation.requestedAt)}. Recepción de la sede la está revisando.
      </CAlert>
    )
  }
  if (cancellation?.status === CANCELLATION_STATUS.RECHAZADA) {
    return (
      <CAlert color="secondary">
        Su solicitud de cancelación fue rechazada{cancellation.resolutionNotes ? `: ${cancellation.resolutionNotes}` : '.'} Puede volver a
        solicitarla si lo necesita.
      </CAlert>
    )
  }
  return null
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
        Tiene un saldo pendiente de {formatCurrency(booking.balance)} por servicios completados. Se cobrará en recepción al hacer el
        check-out.
      </CAlert>
    )
  }
  if (booking.bookingStatus === BOOKING_STATUS.CANCELADA && booking.cancellationReason) {
    return <CAlert color="secondary">Reserva cancelada: {booking.cancellationReason}</CAlert>
  }
  return null
}
