import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../../auth/useAuth'
import useForm from '../../../hooks/useForm'
import useApiQuery from '../../../hooks/useApiQuery'
import useToast from '../../../components/toast/useToast'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import FormField from '../../../components/FormField'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import ConfirmModal from '../../../components/ConfirmModal'
import StripeProvider from '../../../payments/StripeProvider'
import CardField from '../../../payments/CardField'
import useCardPayment from '../../../payments/useCardPayment'
import { isStripeConfigured } from '../../../payments/stripe'
import { getBooking } from '../../../api/bookings'
import { getServicesForBooking, chargeServiceToBooking } from '../../../api/services'
import { getCheckInByBooking } from '../../../api/checkIns'
import { getPetsByCustomer } from '../../../api/pets'
import { BOOKING_STATUS, PET_SPECIES_LABELS, SERVICE_PAYMENT_OPTION, SERVICE_PAYMENT_OPTION_OPTIONS, SERVICE_TYPE_LABELS } from '../../../constants/enums'
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
  const { state } = useLocation()
  const { customer } = useAuth()
  // Vuelve a la pantalla desde la que se llego (Mi estancia o el detalle de la reserva).
  const backTo = state?.backTo ?? `/reservas/${id}`
  const context = useApiQuery(useCallback(() => loadBookingContext(id, customer.id), [id, customer.id]))

  return (
    <>
      <PageHeader
        title={`Solicitar servicio · Reserva #${id}`}
        subtitle="Los servicios se prestan en la sede de su reserva."
        actions={
          <CButton color="secondary" variant="ghost" as={Link} to={backTo}>
            Volver
          </CButton>
        }
      />
      <QueryState query={context}>
        {context.data &&
          (context.data.booking.bookingStatus !== BOOKING_STATUS.EN_ESTANCIA ? (
            <CAlert color="info">Solo puede solicitar servicios mientras la reserva está en estancia.</CAlert>
          ) : (
            <ServiceCatalog bookingId={id} checkIn={context.data.checkIn} pets={context.data.pets} backTo={backTo} />
          ))}
      </QueryState>
    </>
  )
}

function ServiceCatalog({ bookingId, checkIn, pets, backTo }) {
  const services = useApiQuery(useCallback(() => getServicesForBooking(bookingId), [bookingId]))

  // Solo las mascotas admitidas en el check-in pueden recibir servicios.
  const admittedPets = (checkIn?.pets ?? [])
    .filter((checkInPet) => checkInPet.admitted)
    .map((checkInPet) => {
      const pet = pets.find((item) => item.id === checkInPet.petId)
      return { id: checkInPet.petId, name: pet?.name ?? `Mascota #${checkInPet.petId}`, species: pet?.species }
    })
  // Todas las mascotas de una reserva son de la especie de su tipo de habitacion.
  const species = admittedPets.find((pet) => pet.species)?.species

  if (admittedPets.length === 0) {
    return <CAlert color="warning">Su reserva no tiene mascotas admitidas en el check-in, por lo que no puede solicitar servicios.</CAlert>
  }

  return (
    <QueryState query={services}>
      {services.data?.length === 0 ? (
        <CAlert color="info">
          La sede de su reserva no ofrece servicios para {species ? `la especie ${PET_SPECIES_LABELS[species].toLowerCase()}` : 'su mascota'} en
          este momento.
        </CAlert>
      ) : (
        <StripeProvider>
          <ServiceForm bookingId={bookingId} services={services.data ?? []} admittedPets={admittedPets} backTo={backTo} />
        </StripeProvider>
      )}
    </QueryState>
  )
}

// Agrupa el catalogo por tipo de servicio, en el orden de SERVICE_TYPE.
const groupByType = (services) =>
  Object.keys(SERVICE_TYPE_LABELS)
    .map((type) => ({ type, services: services.filter((service) => service.serviceType === type) }))
    .filter((group) => group.services.length > 0)

function ServiceForm({ bookingId, services, admittedPets, backTo }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
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

  const selectedPetNames = admittedPets.filter((pet) => values.petIds.includes(pet.id)).map((pet) => pet.name)

  // Primero valida y pide confirmacion; el cargo se hace al confirmar (con tarjeta se cobra al momento).
  const onSubmit = handleSubmit(async () => setConfirming(true))

  const onConfirm = handleSubmit(async (form) => {
    const payload = { serviceId: Number(form.serviceId), paymentMethod: form.paymentMethod }
    if (perPet) payload.petIds = form.petIds
    if (form.description.trim()) payload.description = form.description.trim()
    // Ante cualquier error se cierra el modal para que se vea el mensaje en el formulario.
    try {
      if (form.paymentMethod === SERVICE_PAYMENT_OPTION.TARJETA) payload.stripePaymentMethodId = await createPaymentMethodId()
      const result = await chargeServiceToBooking(bookingId, payload)
      toast.success(result.message)
      navigate(backTo)
    } finally {
      setConfirming(false)
    }
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <ApiErrorAlert error={apiError} fields={FIELDS} />
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">1. Servicio</CCardHeader>
            <CCardBody>
              {groupByType(services).map((group) => (
                <div key={group.type} className="mb-3">
                  <div className="small text-uppercase fw-semibold text-body-secondary mb-2">{SERVICE_TYPE_LABELS[group.type]}</div>
                  <CRow className="g-3">
                    {group.services.map((service) => {
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
                              <div className="fw-semibold mb-1">{service.name}</div>
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
                </div>
              ))}
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

      <ConfirmModal
        visible={confirming}
        title="Confirmar servicio"
        confirmLabel={payWithCard ? `Pagar ${formatCurrency(amount)}` : 'Cargar a mi cuenta'}
        loading={submitting}
        onConfirm={onConfirm}
        onClose={() => setConfirming(false)}
      >
        <p>
          <strong>{selectedService?.name}</strong>
          {perPet && selectedPetNames.length > 0 && <> para {selectedPetNames.join(', ')}</>} por <strong>{formatCurrency(amount)}</strong>.
        </p>
        <p className="mb-0 text-body-secondary">
          {payWithCard
            ? 'El monto se cobrará de inmediato a su tarjeta.'
            : 'El monto se sumará al saldo de su reserva y se cobrará en recepción al hacer el check-out.'}
        </p>
      </ConfirmModal>
    </CForm>
  )
}
