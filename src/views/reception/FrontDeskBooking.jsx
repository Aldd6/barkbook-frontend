import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CListGroup, CListGroupItem, CRow } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import StatusBadge from '../../components/StatusBadge'
import BillTable from '../../components/BillTable'
import BookingInfoCard from '../../components/booking/BookingInfoCard'
import StayInfoCard from '../../components/booking/StayInfoCard'
import ConfirmPaymentModal from '../../components/booking/ConfirmPaymentModal'
import { BOOKING_STATUS, KINSHIP_LABELS } from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { formatCurrency, todayISO } from '../../utils/format'
import { customerName, isArrivalDue, loadBookingFile, petNameFrom } from './frontDesk'

export default function FrontDeskBooking() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const file = useApiQuery(useCallback(() => loadBookingFile(id), [id]))
  const catalog = useRoomCatalog()
  const [toPay, setToPay] = useState(null)

  const booking = file.data?.booking
  const canCheckIn = booking && isArrivalDue(booking, todayISO()) && hasPermission(PERMISSIONS.HACER_CHECK_IN)
  const canCheckOut = booking?.bookingStatus === BOOKING_STATUS.EN_ESTANCIA && hasPermission(PERMISSIONS.HACER_CHECK_OUT)
  const canPay = booking?.bookingStatus === BOOKING_STATUS.PENDIENTE && booking.balance > 0 && hasPermission(PERMISSIONS.APLICAR_PAGOS_MOSTRADOR)

  return (
    <QueryState query={file}>
      {booking && (
        <>
          <PageHeader
            title={
              <>
                Reserva #{booking.id} <StatusBadge status={booking.bookingStatus} />
              </>
            }
            subtitle={customerName(file.data.customer)}
            actions={
              <>
                <CButton color="secondary" variant="ghost" as={Link} to="/recepcion/reservas">
                  Volver
                </CButton>
                {canPay && (
                  <CButton color="warning" onClick={() => setToPay(booking)}>
                    Registrar pago
                  </CButton>
                )}
                {canCheckIn && (
                  <CButton color="primary" as={Link} to={`/recepcion/reservas/${booking.id}/check-in`}>
                    Hacer check-in
                  </CButton>
                )}
                {canCheckOut && (
                  <CButton color="primary" as={Link} to={`/recepcion/reservas/${booking.id}/check-out`}>
                    Hacer check-out
                  </CButton>
                )}
              </>
            }
          />

          {booking.bookingStatus === BOOKING_STATUS.CANCELADA && booking.cancellationReason && (
            <CAlert color="secondary">Reserva cancelada: {booking.cancellationReason}</CAlert>
          )}
          {booking.bookingStatus === BOOKING_STATUS.PENDIENTE && (
            <CAlert color="warning">La reserva está pendiente de pago ({formatCurrency(booking.balance)}). Debe pagarse antes del check-in.</CAlert>
          )}

          <CRow className="g-4">
            <CCol lg={5}>
              <BookingInfoCard
                booking={booking}
                catalog={catalog.data}
                petName={petNameFrom(file.data.pets)}
                extraRows={[
                  ['Cliente', customerName(file.data.customer)],
                  ['Teléfono', file.data.customer.phoneNumber],
                ]}
              />
              <StayInfoCard checkIn={file.data.checkIn} checkOut={file.data.checkOut} petName={petNameFrom(file.data.pets)} />
              <CCard>
                <CCardHeader className="fw-semibold">Contactos de emergencia</CCardHeader>
                <CCardBody>
                  {file.data.emergencyContacts.length === 0 ? (
                    <p className="text-body-secondary mb-0">El cliente no tiene contactos de emergencia registrados.</p>
                  ) : (
                    <CListGroup flush>
                      {file.data.emergencyContacts.map((contact) => (
                        <CListGroupItem key={contact.id} className="px-0 d-flex justify-content-between gap-2">
                          <span>
                            {contact.name} {contact.lastname}
                            <span className="d-block small text-body-secondary">{KINSHIP_LABELS[contact.kinship]}</span>
                          </span>
                          <span className="text-nowrap">{contact.phoneNumber}</span>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={7}>
              <CCard>
                <CCardHeader className="fw-semibold">Estado de cuenta</CCardHeader>
                <CCardBody>
                  <BillTable bill={booking.bill} balance={booking.balance} />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <ConfirmPaymentModal key={toPay?.id ?? 'none'} booking={toPay} onClose={() => setToPay(null)} onPaid={file.reload} />
        </>
      )}
    </QueryState>
  )
}
