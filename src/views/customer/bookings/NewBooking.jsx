import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../../auth/useAuth'
import useForm from '../../../hooks/useForm'
import useApiQuery from '../../../hooks/useApiQuery'
import useRoomCatalog from '../../../hooks/useRoomCatalog'
import useToast from '../../../components/toast/useToast'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import FormField from '../../../components/FormField'
import EnumSelect from '../../../components/EnumSelect'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import StripeProvider from '../../../payments/StripeProvider'
import CardField from '../../../payments/CardField'
import useCardPayment from '../../../payments/useCardPayment'
import { isStripeConfigured } from '../../../payments/stripe'
import { getPetsByCustomer } from '../../../api/pets'
import { createBooking } from '../../../api/bookings'
import { PAYMENT_METHOD, PAYMENT_METHOD_OPTIONS, PET_SPECIES_LABELS } from '../../../constants/enums'
import { date, required } from '../../../utils/validators'
import { formatCurrency, nightsBetween, todayISO } from '../../../utils/format'

const FIELDS = ['branchId', 'branchRoomId', 'checkInDate', 'checkOutDate', 'petIds', 'paymentMethod', 'stripePaymentMethodId']

const AMENITIES = [
  ['hasAC', 'Aire acondicionado'],
  ['isSoundproofed', 'Insonorizada'],
  ['hasCCTV', 'Cámaras'],
  ['hasOrthopedicBed', 'Cama ortopédica'],
  ['hasPrivateYard', 'Patio privado'],
  ['hasSharedYard', 'Patio compartido'],
  ['hasToys', 'Juguetes'],
]

const RULES = {
  branchId: [required('Seleccione una sede.')],
  branchRoomId: [required('Seleccione un tipo de habitación.')],
  checkInDate: [
    required('Seleccione la fecha de entrada.'),
    date,
    (value) => (value && value < todayISO() ? 'La fecha de check-in no puede ser en el pasado.' : null),
  ],
  checkOutDate: [
    required('Seleccione la fecha de salida.'),
    date,
    (value, all) => (value && all.checkInDate && value <= all.checkInDate ? 'La fecha de check-out debe ser posterior a la fecha de check-in.' : null),
  ],
  petIds: [(value) => (value.length === 0 ? 'Debe incluir al menos una mascota en la reserva.' : null)],
  paymentMethod: [required('Seleccione el método de pago.')],
}

export default function NewBooking() {
  const { customer } = useAuth()
  const catalog = useRoomCatalog()
  const pets = useApiQuery(useCallback(() => getPetsByCustomer(customer.id), [customer.id]))

  return (
    <>
      <PageHeader title="Nueva reserva" subtitle="Elija la sede, la habitación, las fechas y las mascotas que se hospedarán." />
      <QueryState query={catalog}>
        <QueryState query={pets}>
          <StripeProvider>
            <BookingForm catalog={catalog.data} pets={pets.data ?? []} />
          </StripeProvider>
        </QueryState>
      </QueryState>
    </>
  )
}

function BookingForm({ catalog, pets }) {
  const { customer } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { createPaymentMethodId } = useCardPayment()
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    { branchId: '', branchRoomId: '', checkInDate: '', checkOutDate: '', petIds: [], paymentMethod: '' },
    { rules: RULES },
  )

  const roomOptions = catalog.roomBranches
    .filter((roomBranch) => String(roomBranch.branchId) === values.branchId)
    .map((roomBranch) => ({ roomBranch, roomType: catalog.roomTypeById.get(roomBranch.roomTypeId) }))
    .filter(({ roomType }) => roomType)

  const selectedRoomType = roomOptions.find(({ roomBranch }) => String(roomBranch.id) === values.branchRoomId)?.roomType
  const eligiblePets = selectedRoomType ? pets.filter((pet) => pet.species === selectedRoomType.speciesType) : []
  const maxGuests = selectedRoomType?.maximumNumberOfGuests ?? 0
  const nights = nightsBetween(values.checkInDate, values.checkOutDate)
  const total = selectedRoomType ? selectedRoomType.nightlyRate * nights : 0
  const payWithCard = values.paymentMethod === PAYMENT_METHOD.TARJETA

  const selectBranch = (event) => {
    setValue('branchId', event.target.value)
    setValue('branchRoomId', '')
    setValue('petIds', [])
  }

  const selectRoom = (roomBranchId) => {
    setValue('branchRoomId', String(roomBranchId))
    setValue('petIds', [])
  }

  const togglePet = (petId) => {
    const next = values.petIds.includes(petId) ? values.petIds.filter((id) => id !== petId) : [...values.petIds, petId]
    setValue('petIds', next)
  }

  const onSubmit = handleSubmit(async (form) => {
    const payload = {
      branchRoomId: Number(form.branchRoomId),
      customerId: customer.id,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      petIds: form.petIds,
      paymentMethod: form.paymentMethod,
    }
    if (form.paymentMethod === PAYMENT_METHOD.TARJETA) payload.stripePaymentMethodId = await createPaymentMethodId()
    const result = await createBooking(payload)
    toast.success(result.message)
    navigate(`/reservas/${result.booking.id}`)
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <ApiErrorAlert error={apiError} fields={FIELDS} />
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">1. Sede y habitación</CCardHeader>
            <CCardBody>
              <EnumSelect
                name="branchId"
                label="Sede"
                placeholder="Seleccione una sede"
                options={catalog.branches.map((branch) => ({ value: String(branch.id), label: branch.branchName }))}
                value={values.branchId}
                onChange={selectBranch}
                error={fieldError('branchId')}
              />
              {values.branchId && roomOptions.length === 0 && (
                <CAlert color="info" className="mb-0">
                  Esta sede no tiene habitaciones disponibles para reservar.
                </CAlert>
              )}
              <CRow className="g-3">
                {roomOptions.map(({ roomBranch, roomType }) => {
                  const selected = String(roomBranch.id) === values.branchRoomId
                  return (
                    <CCol md={6} key={roomBranch.id}>
                      <button
                        type="button"
                        className={`room-option card h-100 w-100 text-start ${selected ? 'room-option-selected' : ''}`}
                        onClick={() => selectRoom(roomBranch.id)}
                        aria-pressed={selected}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                            <span className="fw-semibold">{roomType.name}</span>
                            <CBadge color="light" textColor="dark">
                              {PET_SPECIES_LABELS[roomType.speciesType]}
                            </CBadge>
                          </div>
                          <div className="text-primary fw-semibold mb-2">{formatCurrency(roomType.nightlyRate)} por noche</div>
                          <div className="small text-body-secondary mb-2">
                            Hasta {roomType.maximumNumberOfGuests} huésped(es) · {roomType.isCage ? 'Jaula' : 'Habitación'} de {roomType.lengthDimension} ×{' '}
                            {roomType.widthDimensions} × {roomType.heightDimensions}
                          </div>
                          {roomType.description && <div className="small mb-2">{roomType.description}</div>}
                          <div className="d-flex flex-wrap gap-1">
                            {AMENITIES.filter(([key]) => roomType[key]).map(([key, label]) => (
                              <CBadge key={key} color="secondary" className="fw-normal">
                                {label}
                              </CBadge>
                            ))}
                          </div>
                        </div>
                      </button>
                    </CCol>
                  )
                })}
              </CRow>
              {fieldError('branchRoomId') && <div className="invalid-feedback d-block">{fieldError('branchRoomId')}</div>}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">2. Fechas</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <FormField
                    name="checkInDate"
                    type="date"
                    label="Entrada"
                    min={todayISO()}
                    value={values.checkInDate}
                    onChange={handleChange}
                    error={fieldError('checkInDate')}
                  />
                </CCol>
                <CCol md={6}>
                  <FormField
                    name="checkOutDate"
                    type="date"
                    label="Salida"
                    min={values.checkInDate || todayISO()}
                    value={values.checkOutDate}
                    onChange={handleChange}
                    error={fieldError('checkOutDate')}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">3. Mascotas</CCardHeader>
            <CCardBody>
              {!selectedRoomType ? (
                <p className="text-body-secondary mb-0">Seleccione primero el tipo de habitación.</p>
              ) : eligiblePets.length === 0 ? (
                <p className="text-body-secondary mb-0">
                  No tiene mascotas de especie {PET_SPECIES_LABELS[selectedRoomType.speciesType].toLowerCase()} registradas para esta habitación.
                </p>
              ) : (
                <>
                  <p className="small text-body-secondary">
                    Esta habitación admite hasta {maxGuests} mascota(s) de especie {PET_SPECIES_LABELS[selectedRoomType.speciesType].toLowerCase()}.
                  </p>
                  {eligiblePets.map((pet) => {
                    const checked = values.petIds.includes(pet.id)
                    return (
                      <CFormCheck
                        key={pet.id}
                        id={`pet-${pet.id}`}
                        label={pet.name}
                        checked={checked}
                        disabled={!checked && values.petIds.length >= maxGuests}
                        onChange={() => togglePet(pet.id)}
                      />
                    )
                  })}
                </>
              )}
              {fieldError('petIds') && <div className="invalid-feedback d-block">{fieldError('petIds')}</div>}
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader className="fw-semibold">4. Pago</CCardHeader>
            <CCardBody>
              <EnumSelect
                name="paymentMethod"
                label="Método de pago"
                placeholder="Seleccione el método de pago"
                options={PAYMENT_METHOD_OPTIONS.map((option) =>
                  option.value === PAYMENT_METHOD.TARJETA && !isStripeConfigured ? { ...option, disabled: true } : option,
                )}
                value={values.paymentMethod}
                onChange={handleChange}
                error={fieldError('paymentMethod')}
              />
              {payWithCard && <CardField error={fieldError('stripePaymentMethodId')} />}
              {values.paymentMethod && !payWithCard && (
                <CAlert color="info" className="mb-0">
                  La reserva quedará pendiente de confirmar. Tiene 5 días para pagarla en recepción; si no, se cancelará automáticamente.
                </CAlert>
              )}
              {payWithCard && <p className="small text-body-secondary mb-0">El cobro se realiza al confirmar y la reserva queda confirmada de inmediato.</p>}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4}>
          <CCard className="booking-summary">
            <CCardHeader className="fw-semibold">Resumen</CCardHeader>
            <CCardBody>
              <SummaryRow label="Habitación" value={selectedRoomType?.name ?? '—'} />
              <SummaryRow label="Tarifa por noche" value={selectedRoomType ? formatCurrency(selectedRoomType.nightlyRate) : '—'} />
              <SummaryRow label="Noches" value={nights || '—'} />
              <SummaryRow label="Mascotas" value={values.petIds.length || '—'} />
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-semibold mb-3">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="d-grid">
                <CButton type="submit" color="primary" disabled={submitting}>
                  {submitting && <CSpinner size="sm" className="me-2" />}
                  {payWithCard ? `Pagar ${formatCurrency(total)} y reservar` : 'Confirmar reserva'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CForm>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span className="text-body-secondary">{label}</span>
      <span className="fw-semibold">{value}</span>
    </div>
  )
}
