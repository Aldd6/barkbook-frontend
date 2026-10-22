import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useForm from '../../hooks/useForm'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import BillTable from '../../components/BillTable'
import BookingInfoCard from '../../components/booking/BookingInfoCard'
import ServiceOrdersTable from '../../components/booking/ServiceOrdersTable'
import ResolveServiceOrderModal from '../../components/booking/ResolveServiceOrderModal'
import CounterPaymentFields from '../../components/booking/CounterPaymentFields'
import { COUNTER_PAYMENT_FIELDS, counterPaymentRules, emptyCounterPayment, toCounterPayment } from '../../components/booking/counterPayment'
import { createCheckOut } from '../../api/checkOuts'
import { getServiceOrdersByBooking } from '../../api/serviceOrders'
import { BOOKING_STATUS, SERVICE_ORDER_STATUS } from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { formatCurrency } from '../../utils/format'
import { maxLength } from '../../utils/validators'
import { customerName, loadBookingFile, petNameFrom } from './frontDesk'

// Flujo de API.md: GET /service-orders/booking/:id -> resolver las PENDIENTE -> GET /bookings/:id
// -> mostrar bill y balance -> si balance > 0, pedir metodo de pago -> POST /check-outs con payment.
export default function CheckOut() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const file = useApiQuery(useCallback(() => loadBookingFile(id), [id]))
  const orders = useApiQuery(useCallback(() => getServiceOrdersByBooking(id), [id]))
  const catalog = useRoomCatalog()
  const [action, setAction] = useState(null) // { order, complete }
  const booking = file.data?.booking
  const pendingOrders = orders.data?.filter((order) => order.status === SERVICE_ORDER_STATUS.PENDIENTE) ?? []
  // Completar carga el servicio a la cuenta: hay que volver a pedir la reserva porque el balance pudo subir.
  const onOrderResolved = () => {
    orders.reload()
    file.reload()
  }

  return (
    <>
      <PageHeader
        title={`Check-out · Reserva #${id}`}
        subtitle={file.data ? customerName(file.data.customer) : undefined}
        actions={
          <CButton color="secondary" variant="ghost" as={Link} to={`/recepcion/reservas/${id}`}>
            Ver reserva
          </CButton>
        }
      />
      <QueryState query={file}>
        {booking &&
          (booking.bookingStatus !== BOOKING_STATUS.EN_ESTANCIA || !file.data.checkIn ? (
            <CAlert color="info">Solo se puede hacer check-out de una reserva en estancia.</CAlert>
          ) : (
            <CRow className="g-4">
              <CCol lg={7}>
                {pendingOrders.length > 0 && (
                  <CCard className="mb-4 border-warning">
                    <CCardHeader className="fw-semibold">Servicios pendientes</CCardHeader>
                    <CCardBody>
                      <p className="small text-body-secondary">
                        Espere a que el cuidador los complete (se cargarán a la cuenta) o cancélelos antes de registrar la salida.
                      </p>
                      <ServiceOrdersTable
                        orders={pendingOrders}
                        onCancel={(order) => setAction({ order, complete: false })}
                        onComplete={hasPermission(PERMISSIONS.SUBIR_INFORMES_SERVICIOS) ? (order) => setAction({ order, complete: true }) : undefined}
                      />
                    </CCardBody>
                  </CCard>
                )}
                <CCard className="mb-4">
                  <CCardHeader className="fw-semibold">Estado de cuenta</CCardHeader>
                  <CCardBody>
                    <BillTable bill={booking.bill} balance={booking.balance} />
                  </CCardBody>
                </CCard>
                <BookingInfoCard
                  booking={booking}
                  catalog={catalog.data}
                  petName={petNameFrom(file.data.pets)}
                  extraRows={[['Habitación asignada', file.data.checkIn.roomNumber ?? '—']]}
                />
              </CCol>
              <CCol lg={5}>
                <CheckOutForm
                  booking={booking}
                  checkIn={file.data.checkIn}
                  // Si la consulta falla no se bloquea: el back end igual valida las ordenes pendientes.
                  ordersLoaded={orders.data !== undefined || Boolean(orders.error)}
                  pendingOrders={pendingOrders.length}
                />
              </CCol>
            </CRow>
          ))}
      </QueryState>

      <ResolveServiceOrderModal
        key={action ? `${action.order.id}-${action.complete}` : 'closed'}
        action={action}
        onClose={() => setAction(null)}
        onResolved={onOrderResolved}
      />
    </>
  )
}

function CheckOutForm({ booking, checkIn, ordersLoaded, pendingOrders }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { hasPermission } = useAuth()
  const hasBalance = booking.balance > 0
  const canCollect = hasPermission(PERMISSIONS.APLICAR_PAGOS_MOSTRADOR)
  // El back end responde 409 si quedan ordenes de servicio PENDIENTE.
  const blockedByOrders = !ordersLoaded || pendingOrders > 0

  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    { ...emptyCounterPayment, observations: '' },
    {
      rules: {
        ...(hasBalance ? counterPaymentRules : {}),
        observations: [maxLength(255, 'Las observaciones no pueden exceder los 255 caracteres.')],
      },
      // Los errores del pago vienen como payment.methodPayment, payment.reference...
      fieldMap: { 'payment.methodPayment': 'methodPayment', 'payment.reference': 'reference', 'payment.description': 'description' },
    },
  )

  const onSubmit = handleSubmit(async (form) => {
    const payload = { checkInId: checkIn.id }
    if (form.observations.trim()) payload.observations = form.observations.trim()
    if (hasBalance) payload.payment = toCounterPayment(form)

    const result = await createCheckOut(payload)
    toast.success(result.message)
    navigate(`/recepcion/reservas/${booking.id}`)
  })

  return (
    <CCard>
      <CCardHeader className="fw-semibold">Registrar salida</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit} noValidate>
          <ApiErrorAlert error={apiError} fields={[...COUNTER_PAYMENT_FIELDS, 'observations']} />
          {pendingOrders > 0 && (
            <CAlert color="warning">
              Hay {pendingOrders} servicio(s) pendiente(s). Deben completarse o cancelarse antes del check-out.
            </CAlert>
          )}
          {hasBalance ? (
            <>
              <CAlert color="warning">
                Saldo pendiente: <strong>{formatCurrency(booking.balance)}</strong>. Se cobrará en este mismo paso.
              </CAlert>
              {canCollect ? (
                <CounterPaymentFields values={values} handleChange={handleChange} fieldError={fieldError} />
              ) : (
                <CAlert color="danger">No tiene permiso para cobrar pagos en mostrador. Pida a un compañero que registre el pago antes del check-out.</CAlert>
              )}
            </>
          ) : (
            <CAlert color="success">La cuenta está saldada. El check-out procede sin cobro.</CAlert>
          )}
          <FormField
            name="observations"
            label="Observaciones (opcional)"
            multiline
            rows={3}
            value={values.observations}
            onChange={handleChange}
            error={fieldError('observations')}
          />
          <p className="small text-body-secondary">Al confirmar, la reserva pasa a Finalizada y la habitación a Limpieza y desinfección.</p>
          <div className="d-grid">
            <CButton type="submit" color="primary" disabled={submitting || blockedByOrders || (hasBalance && !canCollect)}>
              {submitting && <CSpinner size="sm" className="me-2" />}
              {hasBalance ? `Cobrar ${formatCurrency(booking.balance)} y hacer check-out` : 'Confirmar check-out'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
