import { CCol, CFormSelect, CFormSwitch, CRow } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import { createService, updateService } from '../../api/services'
import { PET_SPECIES_OPTIONS, SERVICE_TYPE_OPTIONS } from '../../constants/enums'
import { maxLength, minLength, positiveNumber, required } from '../../utils/validators'

const FIELDS = ['name', 'description', 'serviceType', 'speciesType', 'isMultiGuest', 'rate']

const RULES = {
  name: [required('Ingrese el nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  description: [maxLength(500, 'La descripcion no puede exceder los 500 caracteres.')],
  serviceType: [required('Seleccione el tipo de servicio.')],
  rate: [required('Ingrese la tarifa.'), positiveNumber('La tarifa del servicio debe ser mayor a 0.')],
}

const toFormValues = (service) => ({
  name: service?.name ?? '',
  description: service?.description ?? '',
  serviceType: service?.serviceType ?? '',
  speciesType: service?.speciesType ?? '',
  isMultiGuest: service?.isMultiGuest ?? false,
  rate: service?.rate === undefined ? '' : String(service.rate),
})

// speciesType '' en el formulario = null en la API (aplica a cualquier especie).
const toPayload = (values, isNew) => {
  const payload = {
    name: values.name.trim(),
    serviceType: values.serviceType,
    speciesType: values.speciesType || null,
    isMultiGuest: values.isMultiGuest,
    rate: Number(values.rate),
  }
  const description = values.description.trim()
  if (description || !isNew) payload.description = description
  return payload
}

// POST /services o PUT /services/:id. Renderizar con key para reiniciar el formulario.
// `service`: undefined = cerrado, null = nuevo, objeto = editar.
export default function ServiceModal({ service, onClose, onSaved }) {
  const toast = useToast()
  const isNew = service === null
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(service), { rules: RULES })

  const onSubmit = handleSubmit(async (form) => {
    const result = isNew ? await createService(toPayload(form, true)) : await updateService(service.id, toPayload(form, false))
    toast.success(result.message)
    onSaved()
    onClose()
  })

  return (
    <FormModal
      visible={service !== undefined}
      title={isNew ? 'Nuevo servicio' : `Editar ${service?.name ?? 'servicio'}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      size="lg"
    >
      <CRow>
        <CCol md={6}>
          <FormField name="name" label="Nombre" placeholder="Ej. Baño y cepillado" value={values.name} onChange={handleChange} error={fieldError('name')} />
        </CCol>
        <CCol md={3}>
          <EnumSelect
            name="serviceType"
            label="Tipo"
            options={SERVICE_TYPE_OPTIONS}
            value={values.serviceType}
            onChange={handleChange}
            error={fieldError('serviceType')}
          />
        </CCol>
        <CCol md={3}>
          <div className="mb-3">
            <CFormSelect
              id="speciesType"
              name="speciesType"
              label="Especie"
              value={values.speciesType}
              onChange={handleChange}
              invalid={Boolean(fieldError('speciesType'))}
              feedbackInvalid={fieldError('speciesType')}
              options={[{ value: '', label: 'Cualquier especie' }, ...PET_SPECIES_OPTIONS]}
            />
          </div>
        </CCol>

        <CCol sm={6}>
          <FormField
            name="rate"
            type="number"
            step="0.01"
            min="0"
            label="Tarifa (Q)"
            helpText={isNew ? undefined : 'Cambiar la tarifa no modifica los cargos ya registrados en las reservas.'}
            value={values.rate}
            onChange={handleChange}
            error={fieldError('rate')}
          />
        </CCol>
        <CCol sm={6} className="mb-3">
          <div className="form-label">Modalidad de cobro</div>
          <CFormSwitch
            id="isMultiGuest"
            label={values.isMultiGuest ? 'Un cobro por servicio (todas las mascotas)' : 'Un cobro por cada mascota'}
            checked={values.isMultiGuest}
            onChange={(event) => setValue('isMultiGuest', event.target.checked)}
          />
        </CCol>

        <CCol xs={12}>
          <FormField
            name="description"
            label="Descripción (opcional)"
            multiline
            rows={3}
            maxLength={500}
            className="mb-0"
            value={values.description}
            onChange={handleChange}
            error={fieldError('description')}
          />
        </CCol>
      </CRow>
    </FormModal>
  )
}
