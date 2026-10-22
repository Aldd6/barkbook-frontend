import { CCol, CFormInput, CFormSwitch, CRow } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import { createRoomType, updateRoomType } from '../../api/rooms'
import { PET_SPECIES_OPTIONS } from '../../constants/enums'
import { ROOM_AMENITIES } from '../../constants/roomTypes'
import { integerBetween, maxLength, minLength, positiveNumber, required } from '../../utils/validators'

const FIELDS = [
  'name',
  'prefix',
  'speciesType',
  'isCage',
  'lengthDimension',
  'widthDimensions',
  'heightDimensions',
  'description',
  'maximumNumberOfGuests',
  'nightlyRate',
  ...ROOM_AMENITIES.map(([key]) => key),
]

const PREFIX_REGEX = /^[A-Za-z0-9]{2,10}$/

// Las dimensiones son DECIMAL(5, 2) en la base de datos.
const dimension = (label) => [
  required(`Ingrese el ${label}.`),
  positiveNumber(`El ${label} debe ser mayor a 0.`),
  (value) => (Number(value) > 999.99 ? `El ${label} no puede ser mayor a 999.99.` : null),
]

const buildRules = (isNew) => ({
  name: [required('Ingrese el nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  prefix: isNew
    ? [
        required('Ingrese el prefijo.'),
        (value) => (PREFIX_REGEX.test(value.trim()) ? null : 'El prefijo debe tener entre 2 y 10 caracteres, solo letras y numeros.'),
      ]
    : [],
  speciesType: [required('Seleccione la especie.')],
  lengthDimension: dimension('largo'),
  widthDimensions: dimension('ancho'),
  heightDimensions: dimension('alto'),
  description: [maxLength(500, 'La descripcion no puede exceder los 500 caracteres.')],
  maximumNumberOfGuests: [required('Ingrese el máximo de huéspedes.'), integerBetween(1, undefined, 'El maximo de huespedes debe ser un numero entero mayor o igual a 1.')],
  nightlyRate: [required('Ingrese la tarifa por noche.'), positiveNumber('La tarifa por noche debe ser mayor a 0.')],
})

const toText = (value) => (value === undefined || value === null ? '' : String(value))

const toFormValues = (roomType) => ({
  name: roomType?.name ?? '',
  prefix: roomType?.prefix ?? '',
  speciesType: roomType?.speciesType ?? '',
  isCage: roomType?.isCage ?? false,
  lengthDimension: toText(roomType?.lengthDimension),
  widthDimensions: toText(roomType?.widthDimensions),
  heightDimensions: toText(roomType?.heightDimensions),
  description: roomType?.description ?? '',
  maximumNumberOfGuests: toText(roomType?.maximumNumberOfGuests ?? 1),
  nightlyRate: toText(roomType?.nightlyRate),
  ...Object.fromEntries(ROOM_AMENITIES.map(([key]) => [key, roomType?.[key] ?? false])),
})

const toPayload = (values, isNew) => {
  const payload = {
    name: values.name.trim(),
    speciesType: values.speciesType,
    isCage: values.isCage,
    lengthDimension: Number(values.lengthDimension),
    widthDimensions: Number(values.widthDimensions),
    heightDimensions: Number(values.heightDimensions),
    maximumNumberOfGuests: Number(values.maximumNumberOfGuests),
    nightlyRate: Number(values.nightlyRate),
    ...Object.fromEntries(ROOM_AMENITIES.map(([key]) => [key, values[key]])),
  }
  const description = values.description.trim()
  if (description || !isNew) payload.description = description
  if (isNew) payload.prefix = values.prefix.trim().toUpperCase()
  return payload
}

// POST /room-types o PUT /room-types/:id. Renderizar con key para reiniciar el formulario.
// `roomType`: undefined = cerrado, null = nuevo, objeto = editar.
export default function RoomTypeModal({ roomType, onClose, onSaved }) {
  const toast = useToast()
  const isNew = roomType === null
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(roomType), {
    rules: buildRules(isNew),
  })

  const onSubmit = handleSubmit(async (form) => {
    const result = isNew ? await createRoomType(toPayload(form, true)) : await updateRoomType(roomType.id, toPayload(form, false))
    toast.success(result.message)
    onSaved()
    onClose()
  })

  return (
    <FormModal
      visible={roomType !== undefined}
      title={isNew ? 'Nuevo tipo de habitación' : `Editar ${roomType?.name ?? 'tipo de habitación'}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      size="lg"
    >
      <CRow>
        <CCol md={6}>
          <FormField name="name" label="Nombre" placeholder="Ej. Suite estándar" value={values.name} onChange={handleChange} error={fieldError('name')} />
        </CCol>
        <CCol md={3}>
          {isNew ? (
            <FormField
              name="prefix"
              label="Prefijo"
              maxLength={10}
              placeholder="Ej. STD"
              helpText="Numera las habitaciones (STD001). No se puede cambiar después."
              value={values.prefix}
              onChange={(event) => setValue('prefix', event.target.value.toUpperCase())}
              error={fieldError('prefix')}
            />
          ) : (
            <div className="mb-3">
              <CFormInput id="prefix" label="Prefijo" value={values.prefix} disabled text="El prefijo no se puede modificar." />
            </div>
          )}
        </CCol>
        <CCol md={3}>
          <EnumSelect
            name="speciesType"
            label="Especie"
            options={PET_SPECIES_OPTIONS}
            value={values.speciesType}
            onChange={handleChange}
            error={fieldError('speciesType')}
          />
        </CCol>

        <CCol sm={4}>
          <FormField
            name="lengthDimension"
            type="number"
            step="0.01"
            min="0"
            label="Largo"
            value={values.lengthDimension}
            onChange={handleChange}
            error={fieldError('lengthDimension')}
          />
        </CCol>
        <CCol sm={4}>
          <FormField
            name="widthDimensions"
            type="number"
            step="0.01"
            min="0"
            label="Ancho"
            value={values.widthDimensions}
            onChange={handleChange}
            error={fieldError('widthDimensions')}
          />
        </CCol>
        <CCol sm={4}>
          <FormField
            name="heightDimensions"
            type="number"
            step="0.01"
            min="0"
            label="Alto"
            value={values.heightDimensions}
            onChange={handleChange}
            error={fieldError('heightDimensions')}
          />
        </CCol>

        <CCol sm={4}>
          <FormField
            name="maximumNumberOfGuests"
            type="number"
            step="1"
            min="1"
            label="Máximo de huéspedes"
            value={values.maximumNumberOfGuests}
            onChange={handleChange}
            error={fieldError('maximumNumberOfGuests')}
          />
        </CCol>
        <CCol sm={4}>
          <FormField
            name="nightlyRate"
            type="number"
            step="0.01"
            min="0"
            label="Tarifa por noche (Q)"
            value={values.nightlyRate}
            onChange={handleChange}
            error={fieldError('nightlyRate')}
          />
        </CCol>
        <CCol sm={4} className="d-flex align-items-center mb-3">
          <CFormSwitch id="isCage" label="Es jaula" checked={values.isCage} onChange={(event) => setValue('isCage', event.target.checked)} />
        </CCol>

        <CCol xs={12}>
          <FormField
            name="description"
            label="Descripción (opcional)"
            multiline
            rows={3}
            maxLength={500}
            value={values.description}
            onChange={handleChange}
            error={fieldError('description')}
          />
        </CCol>

        <CCol xs={12}>
          <div className="form-label">Comodidades</div>
        </CCol>
        {ROOM_AMENITIES.map(([key, label]) => (
          <CCol key={key} sm={6} md={4} className="mb-2">
            <CFormSwitch id={key} label={label} checked={values[key]} onChange={(event) => setValue(key, event.target.checked)} />
          </CCol>
        ))}
      </CRow>
    </FormModal>
  )
}
