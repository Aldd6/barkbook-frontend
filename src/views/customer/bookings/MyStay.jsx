import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import useAuth from '../../../auth/useAuth'
import useApiQuery from '../../../hooks/useApiQuery'
import useRoomCatalog, { describeRoomBranch } from '../../../hooks/useRoomCatalog'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import ServiceOrdersTable from '../../../components/booking/ServiceOrdersTable'
import ResolveServiceOrderModal from '../../../components/booking/ResolveServiceOrderModal'
import { getBookingsByCustomer } from '../../../api/bookings'
import { getPetsByCustomer } from '../../../api/pets'
import { getCheckInByBooking } from '../../../api/checkIns'
import { getServiceOrdersByBooking } from '../../../api/serviceOrders'
import { BOOKING_STATUS, SERVICE_ORDER_STATUS } from '../../../constants/enums'
import { formatCurrency, formatDate } from '../../../utils/format'

const loadStays = async (customerId) => {
  const [bookings, pets] = await Promise.all([getBookingsByCustomer(customerId), getPetsByCustomer(customerId)])
  return { stays: bookings.filter((booking) => booking.bookingStatus === BOOKING_STATUS.EN_ESTANCIA), pets }
}

const loadStayDetail = async (bookingId) => {
  const [checkIn, orders] = await Promise.all([getCheckInByBooking(bookingId), getServiceOrdersByBooking(bookingId)])
  return { checkIn, orders }
}

export default function MyStay() {
  const { customer } = useAuth()
  const query = useApiQuery(useCallback(() => loadStays(customer.id), [customer.id]))
  const catalog = useRoomCatalog()

  const petName = (petId) => query.data?.pets.find((pet) => pet.id === petId)?.name ?? `Mascota #${petId}`

  return (
    <>
      <PageHeader title="Mi estancia" subtitle="Solicite servicios para sus mascotas mientras están hospedadas con nosotros." />
      <QueryState query={query}>
        {query.data?.stays.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5">
              <p className="text-body-secondary mb-3">No tiene ninguna estancia activa en este momento.</p>
              <CButton color="primary" variant="outline" as={Link} to="/reservas">
                Ver mis reservas
              </CButton>
            </CCardBody>
          </CCard>
        ) : (
          query.data?.stays.map((booking) => (
            <ActiveStay key={booking.id} booking={booking} catalog={catalog.data} petName={petName} />
          ))
        )}
      </QueryState>
    </>
  )
}

function ActiveStay({ booking, catalog, petName }) {
  const detail = useApiQuery(useCallback(() => loadStayDetail(booking.id), [booking.id]))
  const [toCancel, setToCancel] = useState(null)
  const { branch, roomType } = describeRoomBranch(catalog, booking.branchRoomId)
  const admittedPets = detail.data?.checkIn?.pets.filter((checkInPet) => checkInPet.admitted) ?? []
  const orders = detail.data?.orders ?? []
  const pendingAmount = orders
    .filter((order) => order.status === SERVICE_ORDER_STATUS.PENDIENTE)
    .reduce((sum, order) => sum + Number(order.amount), 0)

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="fw-semibold">
          Reserva #{booking.id} · {branch?.branchName ?? '—'} · {roomType?.name ?? '—'}
        </span>
        <CButton color="primary" size="sm" as={Link} to={`/reservas/${booking.id}/servicios`} state={{ backTo: '/mi-estancia' }}>
          <CIcon icon={cilPlus} className="me-1" />
          Solicitar servicio
        </CButton>
      </CCardHeader>
      <CCardBody>
        <QueryState query={detail}>
          <CRow className="g-4">
            <CCol lg={4}>
              <dl className="row mb-0">
                <dt className="col-6">Habitación</dt>
                <dd className="col-6">{detail.data?.checkIn?.roomNumber ?? '—'}</dd>
                <dt className="col-6">Entrada</dt>
                <dd className="col-6">{formatDate(booking.checkInDate)}</dd>
                <dt className="col-6">Salida</dt>
                <dd className="col-6">{formatDate(booking.checkOutDate)}</dd>
                <dt className="col-6">Mascotas</dt>
                <dd className="col-6">
                  {admittedPets.length === 0
                    ? '—'
                    : admittedPets.map((checkInPet) => (
                        <CBadge key={checkInPet.id} color="success" className="me-1 mb-1">
                          {petName(checkInPet.petId)}
                        </CBadge>
                      ))}
                </dd>
                <dt className="col-6">Saldo pendiente</dt>
                <dd className={`col-6 mb-0 fw-semibold ${booking.balance > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(booking.balance)}</dd>
              </dl>
            </CCol>
            <CCol lg={8}>
              <h6 className="fw-semibold">Mis servicios</h6>
              <ServiceOrdersTable
                orders={orders}
                onCancel={(order) => setToCancel(order)}
                emptyText="Aún no ha solicitado servicios en esta estancia."
              />
              {pendingAmount > 0 && (
                <CAlert color="info" className="mt-3 mb-0">
                  Los servicios pendientes ({formatCurrency(pendingAmount)}) se cargarán a su cuenta cuando el cuidador los complete. El saldo se
                  paga en recepción al hacer el check-out.
                </CAlert>
              )}
              <div className="mt-3">
                <Link to={`/reservas/${booking.id}`} className="small">
                  Ver estado de cuenta completo
                </Link>
              </div>
            </CCol>
          </CRow>
        </QueryState>
      </CCardBody>

      <ResolveServiceOrderModal
        key={toCancel?.id ?? 'closed'}
        action={toCancel ? { order: toCancel, complete: false } : null}
        onClose={() => setToCancel(null)}
        onResolved={detail.reload}
      />
    </CCard>
  )
}
