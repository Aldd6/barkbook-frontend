import { useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../../auth/useAuth'
import useForm from '../../../hooks/useForm'
import useApiQuery from '../../../hooks/useApiQuery'
import useToast from '../../../components/toast/useToast'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import FormField from '../../../components/FormField'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import StripeProvider from '../../../payments/StripeProvider'
import CardField from '../../../payments/CardField'
import useCardPayment from '../../../payments/useCardPayment'
import { isStripeConfigured } from '../../../payments/stripe'
import { getBooking } from '../../../api/bookings'
import { getServicesForBooking, chargeServiceToBooking } from '../../../api/services'
import { getCheckInByBooking } from '../../../api/checkIns'
import { getPetsByCustomer } from '../../../api/pets'
import { BOOKING_STATUS, SERVICE_PAYMENT_OPTION, SERVICE_PAYMENT_OPTION_OPTIONS, SERVICE_TYPE_LABELS } from '../../../constants/enums'
import { maxLength, required } from '../../../utils/validators'
import { formatCurrency } from '../../../utils/format'

const FIELDS = ['serviceId', 'petIds', 'paymentMethod', 'description', 'stripePaymentMethodId']

const loadBookingContext = async (bookingId, customerId) => {
  const [booking, checkIn, pets] = await Promise.all([getBooking(bookingId), getCheckInByBooking(bookingId), getPetsByCustomer(customerId)])
  return { booking, checkIn, pets }
}

// El cliente carga servicios a su reserva EN ESTANCIA (seccion "Servicios" de API.md).
export default function RequestService() {
  const { id } = useParams()
  const { customer } = useAuth()
  const context = useApiQuery(useCallback(() => loadBookingContext(id, customer.id), [id, customer.id]))

  return (
    <>
      <PageHeader
        title={`Solicitar servicio · Reserva #${id}`}
        subtitle="Los servicios se prestan en la sede de su reserva."
        actions={
          <CButton color="secondary" variant="ghost" as={Link} to={`/reservas/${id}`}>
            Volver a la reserva
          </CButton>
        }
      />
      <QueryState query={context}>
        {context.data &&
          (context.data.booking.bookingStatus !== BOOKING_STATUS.EN_ESTANCIA ? (
            <CAlert color="info">Solo puede solicitar servicios mientras la reserva está en estancia.</CAlert>
          ) : (
            <ServiceCatalog bookingId={id} checkIn={context.data.checkIn} pets={context.data.pets} />
          ))}
      </QueryState>
    </>
  )
}

function ServiceCatalog({ bookingId, checkIn, pets }) {
  const services = useApiQuery(useCallback(() => getServicesForBooking(bookingId), [bookingId]))

  // Solo las mascotas admitidas en el check-in pueden recibir servicios.
  const admittedPets = (checkIn?.pets ?? [])
    .filter((checkInPet) => checkInPet.admitted)
    .map((checkInPet) => ({ id: checkInPet.petId, name: pets.find((pet) => pet.id === checkInPet.petId)?.name ?? `Mascota #${checkInPet.petId}` }))

  return (
    <QueryState query={services}>
      {services.data?.length === 0 ? (
        <CAlert color="info">La sede de su reserva no tiene servicios disponibles para su mascota.</CAlert>
      ) : (
        <StripeProvider>
          <ServiceForm bookingId={bookingId} services={services.data ?? []} admittedPets={admittedPets} />
        </StripeProvider>
      )}
    </QueryState>
  )
}

function ServiceForm({ bookingId, services, admittedPets }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { createPaymentMethodId } = useCardPayment()
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    { serviceId: '', petIds: admittedPets.map((pet) => pet.id), paymentMethod: '', description: '' },
    {
      rules: (current) => {
        const service = services.find((s) => String(s.id) === current.serviceId)
        return {
          serviceId: [required('Seleccione un servicio.')],
          petIds: service && !service.isMultiGuest ? [(value) => (value.length === 0 ? 'Debe indicar al menos una mascota.' : null)] : [],
          paymentMethod: [required('Seleccione cómo desea pagar el servicio.')],
          description: [maxLength(255, 'La descripcion no puede exceder los 255 caracteres.')],
        }
      },
    },
  )

  const selectedService = services.find((service) => String(service.id) === values.serviceId)
  const perPet = selectedService && !selectedService.isMultiGuest
  const amount = selectedService ? selectedService.rate * (perPet ? values.petIds.length : 1) : 0
  const payWithCard = values.paymentMethod === SERVICE_PAYMENT_OPTION.TARJETA

  const togglePet = (petId) => {
    const next = values.petIds.includes(petId) ? values.petIds.filter((id) => id !== petId) : [...values.petIds, petId]
    setValue('petIds', next)
  }

  const onSubmit = handleSubmit(async (form) => {
    const payload = { serviceId: Number(form.serviceId), paymentMethod: form.paymentMethod }
    if (perPet) payload.petIds = form.petIds
    if (form.description.trim()) payload.description = form.description.trim()
    if (form.paymentMethod === SERVICE_PAYMENT_OPTION.TARJETA) payload.stripePaymentMethodId = await createPaymentMethodId()

    const result = await chargeServiceToBooking(bookingId, payload)
    toast.success(result.message)
    navigate(`/reservas/${bookingId}`)
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <ApiErrorAlert error={apiError} fields={FIELDS} />
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">1. Servicio</CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                {services.map((service) => {
                  const selected = String(service.id) === values.serviceId
                  return (
                    <CCol md={6} key={service.id}>
                      <button
                        type="button"
                        className={`room-option card h-100 w-100 text-start ${selected ? 'room-option-selected' : ''}`}
                        onClick={() => setValue('serviceId', String(service.id))}
                        aria-pressed={selected}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                            <span className="fw-semibold">{service.name}</span>
                            <CBadge color="light" textColor="dark">
                              {SERVICE_TYPE_LABELS[service.serviceType]}
                            </CBadge>
                          </div>
                          <div className="text-primary fw-semibold mb-1">
                            {formatCurrency(service.rate)} {service.isMultiGuest ? 'por servicio' : 'por mascota'}
                          </div>
                          {service.description && <div className="small text-body-secondary">{service.description}</div>}
                        </div>
                      </button>
                    </CCol>
                  )
                })}
              </CRow>
              {fieldError('serviceId') && <div className="invalid-feedback d-block">{fieldError('serviceId')}</div>}
            </CCardBody>
          </CCard>

          {perPet && (
            <CCard className="mb-4">
              <CCardHeader className="fw-semibold">2. Mascotas</CCardHeader>
              <CCardBody>
                {admittedPets.map((pet) => (
                  <CFormCheck
                    key={pet.id}
                    id={`service-pet-${pet.id}`}
                    label={pet.name}
                    checked={values.petIds.includes(pet.id)}
                    onChange={() => togglePet(pet.id)}
                  />
                ))}
                {fieldError('petIds') && <div className="invalid-feedback d-block">{fieldError('petIds')}</div>}
              </CCardBody>
            </CCard>
          )}

          <CCard>
            <CCardHeader className="fw-semibold">{perPet ? '3' : '2'}. Pago</CCardHeader>
            <CCardBody>
              {SERVICE_PAYMENT_OPTION_OPTIONS.map((option) => (
                <CFormCheck
                  key={option.value}
                  type="radio"
                  name="paymentMethod"
                  id={`payment-${option.value}`}
                  value={option.value}
                  label={option.label}
                  checked={values.paymentMethod === option.value}
                  disabled={option.value === SERVICE_PAYMENT_OPTION.TARJETA && !isStripeConfigured}
                  onChange={handleChange}
                />
              ))}
              {fieldError('paymentMethod') && <div className="invalid-feedback d-block mb-2">{fieldError('paymentMethod')}</div>}
              <div className="mt-3">
                {payWithCard && <CardField error={fieldError('stripePaymentMethodId')} />}
                {values.paymentMethod === SERVICE_PAYMENT_OPTION.CARGO_A_CUENTA && (
                  <CAlert color="info">El monto se suma al saldo de su reserva y se cobra en recepción al hacer el check-out.</CAlert>
                )}
              </div>
              <FormField
                name="description"
                label="Indicaciones (opcional)"
                multiline
                rows={2}
                className="mb-0"
                value={values.description}
                onChange={handleChange}
                error={fieldError('description')}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4}>
          <CCard className="booking-summary">
            <CCardHeader className="fw-semibold">Resumen</CCardHeader>
            <CCardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-body-secondary">Servicio</span>
                <span className="fw-semibold text-end">{selectedService?.name ?? '—'}</span>
              </div>
              {perPet && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-body-secondary">Mascotas</span>
                  <span className="fw-semibold">{values.petIds.length}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-semibold mb-3">
                <span>Total</span>
                <span>{formatCurrency(amount)}</span>
              </div>
              <div className="d-grid">
                <CButton type="submit" color="primary" disabled={submitting}>
                  {submitting && <CSpinner size="sm" className="me-2" />}
                  {payWithCard
                    ? `Pagar ${formatCurrency(amount)}`
                    : values.paymentMethod === SERVICE_PAYMENT_OPTION.CARGO_A_CUENTA
                      ? 'Cargar a mi cuenta'
                      : 'Solicitar servicio'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CForm>
  )
}
