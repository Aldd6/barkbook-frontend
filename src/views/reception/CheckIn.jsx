import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormSelect,
  CFormSwitch,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react'
import { cilDescription, cilPaw } from '@coreui/icons'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useForm from '../../hooks/useForm'
import useRoomCatalog, { describeRoomBranch } from '../../hooks/useRoomCatalog'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import ConfirmModal from '../../components/ConfirmModal'
import ConfirmPaymentModal from '../../components/booking/ConfirmPaymentModal'
import Avatar from '../../components/Avatar'
import FileUpload from '../../components/FileUpload'
import { DOCUMENT_TYPES } from '../../api/files'
import { createCheckIn, getAvailableRoomsForBooking, getBookingPetsForCheckIn } from '../../api/checkIns'
import {
  BOOKING_STATUS,
  PET_SIZE_LABELS,
  PET_SPECIES_LABELS,
  ROOM_STATUS_LABELS,
  SEX_LABELS,
  UNIT_MEASURE_WEIGHT_PET_LABELS,
  VACCINE_USE_LABELS,
} from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { formatAge, formatCurrency, formatDate, todayISO, yesNo } from '../../utils/format'
import { maxLength } from '../../utils/validators'
import { customerName, isArrivalDue, loadBookingFile } from './frontDesk'

const loadCheckInData = async (bookingId) => {
  const [file, rooms, bookingPets] = await Promise.all([
    loadBookingFile(bookingId),
    getAvailableRoomsForBooking(bookingId),
    getBookingPetsForCheckIn(bookingId),
  ])
  return { ...file, rooms, bookingPets }
}

export default function CheckIn() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const data = useApiQuery(useCallback(() => loadCheckInData(id), [id]))
  const catalog = useRoomCatalog()
  const [toPay, setToPay] = useState(null)

  const booking = data.data?.booking
  const canPay = hasPermission(PERMISSIONS.APLICAR_PAGOS_MOSTRADOR)

  return (
    <>
      <PageHeader
        title={`Check-in · Reserva #${id}`}
        subtitle={data.data ? customerName(data.data.customer) : undefined}
        actions={
          <CButton color="secondary" variant="ghost" as={Link} to={`/recepcion/reservas/${id}`}>
            Ver reserva
          </CButton>
        }
      />
      <QueryState query={data}>
        {booking && <CheckInBody data={data.data} catalog={catalog.data} canPay={canPay} onPay={() => setToPay(booking)} />}
      </QueryState>
      <ConfirmPaymentModal key={toPay?.id ?? 'none'} booking={toPay} onClose={() => setToPay(null)} onPaid={data.reload} />
    </>
  )
}

function CheckInBody({ data, catalog, canPay, onPay }) {
  const { booking, rooms, checkIn } = data
  const today = todayISO()

  if (checkIn) {
    return <CAlert color="info">Esta reserva ya tiene un check-in registrado ({formatDate(checkIn.checkInDate)}).</CAlert>
  }
  if (![BOOKING_STATUS.CONFIRMADA, BOOKING_STATUS.PENDIENTE].includes(booking.bookingStatus)) {
    return <CAlert color="info">No se puede hacer check-in de una reserva en estado "{booking.bookingStatus}".</CAlert>
  }
  if (!isArrivalDue(booking, today)) {
    return (
      <CAlert color="info">
        El check-in de esta reserva solo puede realizarse a partir del {formatDate(booking.checkInDate)} y antes del {formatDate(booking.checkOutDate)}.
      </CAlert>
    )
  }
  if (booking.balance > 0) {
    return (
      <CAlert color="warning" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>
          La reserva tiene un saldo pendiente de <strong>{formatCurrency(booking.balance)}</strong>. Registre el pago antes de hacer el check-in.
        </span>
        {canPay ? (
          <CButton color="warning" onClick={onPay}>
            Registrar pago
          </CButton>
        ) : (
          <span className="small">No tiene permiso para registrar pagos en mostrador.</span>
        )}
      </CAlert>
    )
  }

  return <CheckInForm booking={booking} bookingPets={data.bookingPets} rooms={rooms} catalog={catalog} />
}

const buildRules = (values) => {
  const admitted = values.pets.filter((pet) => pet.admitted).length
  const partial = admitted > 0 && admitted < values.pets.length
  const willCancel = admitted === 0 || (partial && values.customerAcceptsPartialAdmission === 'no')

  const rules = {
    customerAcceptsPartialAdmission: partial
      ? [(value) => (value ? null : 'Algunas mascotas no fueron admitidas: debe indicar si el cliente acepta dejar solo las mascotas admitidas.')]
      : [],
    roomNumber: willCancel ? [] : [(value) => (value ? null : 'Debe ingresar el numero de habitacion a asignar a la reserva.')],
    observations: [maxLength(255, 'Las observaciones no pueden exceder los 255 caracteres.')],
  }
  values.pets.forEach((pet, index) => {
    rules[`pets.${index}.nonadmissionReason`] = [
      () => {
        if (pet.admitted) return null
        if (!pet.nonadmissionReason.trim()) return 'Debe indicar el motivo por el cual la mascota no es admitida.'
        return pet.nonadmissionReason.trim().length > 255 ? 'El motivo de no admision no puede exceder los 255 caracteres.' : null
      },
    ]
  })
  return rules
}

function CheckInForm({ booking, bookingPets, rooms, catalog }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { roomType } = describeRoomBranch(catalog, booking.branchRoomId)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    {
      pets: bookingPets.map(({ bookingPetId, pet, vaccines }) => ({ bookingPetId, pet, vaccines, admitted: true, nonadmissionReason: '' })),
      customerAcceptsPartialAdmission: '',
      roomNumber: '',
      observations: '',
    },
    { rules: buildRules },
  )

  const admittedCount = values.pets.filter((pet) => pet.admitted).length
  const partial = admittedCount > 0 && admittedCount < values.pets.length
  const willCancel = admittedCount === 0 || (partial && values.customerAcceptsPartialAdmission === 'no')

  const updatePet = (index, changes) => {
    setValue(
      'pets',
      values.pets.map((pet, i) => (i === index ? { ...pet, ...changes } : pet)),
    )
  }

  const submitCheckIn = async (form) => {
    const payload = {
      bookingId: booking.id,
      pets: form.pets.map((pet) =>
        pet.admitted
          ? { bookingPetId: pet.bookingPetId, admitted: true }
          : { bookingPetId: pet.bookingPetId, admitted: false, nonadmissionReason: pet.nonadmissionReason.trim() },
      ),
    }
    if (partial) payload.customerAcceptsPartialAdmission = form.customerAcceptsPartialAdmission === 'yes'
    if (!willCancel) payload.roomNumber = form.roomNumber
    if (form.observations.trim()) payload.observations = form.observations.trim()

    const result = await createCheckIn(payload)
    toast.success(result.message)
    navigate(`/recepcion/reservas/${booking.id}`)
  }

  const onSubmit = handleSubmit(async (form) => {
    if (willCancel) {
      setConfirmOpen(true)
      return
    }
    await submitCheckIn(form)
  })
  const confirmAndSubmit = handleSubmit(submitCheckIn)

  const fields = ['customerAcceptsPartialAdmission', 'roomNumber', 'observations', ...values.pets.map((_, index) => `pets.${index}.nonadmissionReason`)]

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <ApiErrorAlert error={apiError} fields={fields} />
      <CRow className="g-4">
        <CCol lg={7}>
          <CCard className="mb-4">
            <CCardHeader className="fw-semibold">Admisión de mascotas</CCardHeader>
            <CCardBody>
              <p className="small text-body-secondary">Verifique los datos y el carné de vacunación de cada mascota antes de admitirla.</p>
              <CListGroup flush>
                {values.pets.map((pet, index) => (
                  <CListGroupItem key={pet.bookingPetId} className="px-0 py-3">
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <Avatar src={pet.pet.profilePicture} icon={cilPaw} alt={pet.pet.name} />
                        <span className="fw-semibold">{pet.pet.name}</span>
                      </div>
                      <CFormSwitch
                        id={`admitted-${pet.bookingPetId}`}
                        label={pet.admitted ? 'Admitida' : 'No admitida'}
                        checked={pet.admitted}
                        onChange={(event) => updatePet(index, { admitted: event.target.checked })}
                      />
                    </div>
                    <PetCheckInDetails pet={pet.pet} vaccines={pet.vaccines} />
                    {!pet.admitted && (
                      <FormField
                        name={`pets.${index}.nonadmissionReason`}
                        label="Motivo de no admisión"
                        className="mt-2 mb-0"
                        value={pet.nonadmissionReason}
                        onChange={(event) => updatePet(index, { nonadmissionReason: event.target.value })}
                        error={fieldError(`pets.${index}.nonadmissionReason`)}
                      />
                    )}
                  </CListGroupItem>
                ))}
              </CListGroup>

              {partial && (
                <div className="mt-3">
                  <div className="form-label">¿El cliente acepta dejar solo las mascotas admitidas?</div>
                  <CFormCheck
                    inline
                    type="radio"
                    id="partial-yes"
                    name="customerAcceptsPartialAdmission"
                    value="yes"
                    label="Sí, acepta"
                    checked={values.customerAcceptsPartialAdmission === 'yes'}
                    onChange={handleChange}
                  />
                  <CFormCheck
                    inline
                    type="radio"
                    id="partial-no"
                    name="customerAcceptsPartialAdmission"
                    value="no"
                    label="No acepta"
                    checked={values.customerAcceptsPartialAdmission === 'no'}
                    onChange={handleChange}
                  />
                  {fieldError('customerAcceptsPartialAdmission') && (
                    <div className="invalid-feedback d-block">{fieldError('customerAcceptsPartialAdmission')}</div>
                  )}
                </div>
              )}

              {willCancel && (
                <CAlert color="danger" className="mt-3 mb-0">
                  {admittedCount === 0 ? 'Ninguna mascota es admitida' : 'El cliente no acepta la admisión parcial'}: el check-in quedará cancelado, la reserva
                  se cancelará y se reembolsarán los pagos.
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={5}>
          <CCard>
            <CCardHeader className="fw-semibold">Habitación</CCardHeader>
            <CCardBody>
              <p className="small text-body-secondary">
                {roomType ? `${roomType.name} · ${PET_SPECIES_LABELS[roomType.speciesType]}` : 'Tipo de habitación de la reserva'} ·{' '}
                {formatDate(booking.checkInDate)} al {formatDate(booking.checkOutDate)}
              </p>
              {!willCancel &&
                (rooms.length === 0 ? (
                  <CAlert color="warning">No hay habitaciones disponibles de este tipo en la sede.</CAlert>
                ) : (
                  <div className="mb-3">
                    <CFormSelect
                      id="roomNumber"
                      name="roomNumber"
                      label="Habitación a asignar"
                      value={values.roomNumber}
                      onChange={handleChange}
                      invalid={Boolean(fieldError('roomNumber'))}
                      feedbackInvalid={fieldError('roomNumber')}
                      options={[
                        { value: '', label: 'Seleccione una habitación', disabled: true },
                        ...rooms.map((room) => ({ value: room.roomNumber, label: `${room.roomNumber} · ${ROOM_STATUS_LABELS[room.status]}` })),
                      ]}
                    />
                  </div>
                ))}
              <FormField
                name="observations"
                label="Observaciones (opcional)"
                multiline
                rows={3}
                value={values.observations}
                onChange={handleChange}
                error={fieldError('observations')}
              />
              <div className="d-grid">
                <CButton type="submit" color={willCancel ? 'danger' : 'primary'} disabled={submitting}>
                  {submitting && <CSpinner size="sm" className="me-2" />}
                  {willCancel ? 'Registrar y cancelar reserva' : 'Confirmar check-in'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <ConfirmModal
        visible={confirmOpen}
        title="Cancelar reserva en el check-in"
        confirmLabel="Sí, cancelar reserva"
        color="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          confirmAndSubmit()
        }}
      >
        El check-in quedará cancelado, la reserva #{booking.id} pasará a <strong>Cancelada</strong> y se reembolsarán los pagos. ¿Desea continuar?
      </ConfirmModal>
    </CForm>
  )
}

function PetCheckInDetails({ pet, vaccines }) {
  return (
    <CRow className="g-3 mt-1">
      <CCol sm={7}>
        <CRow className="g-2 small">
          <PetInfo label="Especie" value={PET_SPECIES_LABELS[pet.species]} />
          <PetInfo label="Sexo" value={SEX_LABELS[pet.sex]} />
          <PetInfo label="Tamaño" value={PET_SIZE_LABELS[pet.size]} />
          <PetInfo label="Edad" value={formatAge(pet.birthday)} />
          <PetInfo label="Peso" value={`${pet.actualWeight} ${UNIT_MEASURE_WEIGHT_PET_LABELS[pet.unitOfMeasureWeight]?.toLowerCase()}`} />
          <PetInfo label="Sociabilidad" value={`${pet.sociabilityLevel} de 5`} />
          <PetInfo label="Esterilizado(a)" value={yesNo(pet.isNeutered)} />
        </CRow>
        <div className="small text-body-secondary mt-3 mb-1">Vacunas registradas</div>
        {vaccines.length === 0 ? (
          <div className="small">Sin vacunas registradas.</div>
        ) : (
          <ul className="small ps-3 mb-0">
            {vaccines.map((vaccine) => (
              <li key={vaccine.id}>
                <span className="fw-semibold">{vaccine.vaccineName}</span> · {VACCINE_USE_LABELS[vaccine.vaccineUse]} · {formatDate(vaccine.dateOfPlacement)}
              </li>
            ))}
          </ul>
        )}
      </CCol>
      <CCol sm={5}>
        <div className="small text-body-secondary mb-1">Carné de vacunación</div>
        <FileUpload url={pet.vaccinationCard} types={DOCUMENT_TYPES} canEdit={false} icon={cilDescription} emptyLabel="Sin carné" />
      </CCol>
    </CRow>
  )
}

function PetInfo({ label, value }) {
  return (
    <CCol xs={6} md={4}>
      <div className="text-body-secondary">{label}</div>
      <div className="fw-semibold">{value}</div>
    </CCol>
  )
}
