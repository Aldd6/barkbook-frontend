import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CForm, CFormSwitch, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../../auth/useAuth'
import useForm from '../../../hooks/useForm'
import useApiQuery from '../../../hooks/useApiQuery'
import useToast from '../../../components/toast/useToast'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import FormField from '../../../components/FormField'
import EnumSelect from '../../../components/EnumSelect'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import { createPet, getPet, updatePet } from '../../../api/pets'
import { PET_SIZE_OPTIONS, PET_SPECIES_OPTIONS, SEX_OPTIONS, UNIT_MEASURE_WEIGHT_PET_OPTIONS } from '../../../constants/enums'
import { date, integerBetween, maxLength, notFuture, positiveNumber, required } from '../../../utils/validators'
import { todayISO } from '../../../utils/format'

const FIELDS = ['name', 'species', 'sex', 'birthday', 'size', 'actualWeight', 'unitOfMeasureWeight', 'sociabilityLevel', 'isNeutered']

const SOCIABILITY_OPTIONS = [0, 1, 2, 3, 4, 5].map((level) => ({ value: String(level), label: String(level) }))

const RULES = {
  name: [required('El nombre de la mascota es obligatorio.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  species: [required('Seleccione la especie.')],
  sex: [required('Seleccione el sexo.')],
  birthday: [required('Ingrese la fecha de nacimiento.'), date, notFuture('La fecha de nacimiento no puede ser en el futuro.')],
  size: [required('Seleccione el tamaño.')],
  actualWeight: [required('Ingrese el peso.'), positiveNumber('El peso debe ser mayor a 0.')],
  unitOfMeasureWeight: [required('Seleccione la unidad de peso.')],
  sociabilityLevel: [required('Seleccione el nivel de sociabilidad.'), integerBetween(0, 5)],
}

const toFormValues = (pet) => ({
  name: pet?.name ?? '',
  species: pet?.species ?? '',
  sex: pet?.sex ?? '',
  birthday: pet?.birthday ?? '',
  size: pet?.size ?? '',
  actualWeight: pet?.actualWeight !== undefined ? String(pet.actualWeight) : '',
  unitOfMeasureWeight: pet?.unitOfMeasureWeight ?? '',
  sociabilityLevel: pet?.sociabilityLevel !== undefined ? String(pet.sociabilityLevel) : '',
  isNeutered: pet?.isNeutered ?? false,
})

const toPayload = (values) => ({
  name: values.name.trim(),
  species: values.species,
  sex: values.sex,
  birthday: values.birthday,
  size: values.size,
  actualWeight: Number(values.actualWeight),
  unitOfMeasureWeight: values.unitOfMeasureWeight,
  sociabilityLevel: Number(values.sociabilityLevel),
  isNeutered: values.isNeutered,
})

export default function PetFormPage() {
  const { id } = useParams()
  const pet = useApiQuery(useCallback(() => (id ? getPet(id) : Promise.resolve(null)), [id]))

  return (
    <>
      <PageHeader title={id ? 'Editar mascota' : 'Registrar mascota'} />
      <QueryState query={pet}>
        <PetForm key={pet.data?.id ?? 'new'} pet={pet.data} />
      </QueryState>
    </>
  )
}

function PetForm({ pet }) {
  const { customer } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(pet), { rules: RULES })

  const onSubmit = handleSubmit(async (form) => {
    const payload = toPayload(form)
    const result = pet ? await updatePet(pet.id, payload) : await createPet({ ...payload, customerId: customer.id })
    toast.success(result.message)
    navigate(`/mascotas/${result.pet.id}`)
  })

  return (
    <CCard>
      <CCardBody>
        <CForm onSubmit={onSubmit} noValidate>
          <ApiErrorAlert error={apiError} fields={FIELDS} />
          <CRow>
            <CCol md={6}>
              <FormField name="name" label="Nombre" value={values.name} onChange={handleChange} error={fieldError('name')} />
            </CCol>
            <CCol md={3}>
              <EnumSelect name="species" label="Especie" options={PET_SPECIES_OPTIONS} value={values.species} onChange={handleChange} error={fieldError('species')} />
            </CCol>
            <CCol md={3}>
              <EnumSelect name="sex" label="Sexo" options={SEX_OPTIONS} value={values.sex} onChange={handleChange} error={fieldError('sex')} />
            </CCol>
            <CCol md={4}>
              <FormField
                name="birthday"
                type="date"
                label="Fecha de nacimiento"
                max={todayISO()}
                value={values.birthday}
                onChange={handleChange}
                error={fieldError('birthday')}
              />
            </CCol>
            <CCol md={4}>
              <EnumSelect name="size" label="Tamaño" options={PET_SIZE_OPTIONS} value={values.size} onChange={handleChange} error={fieldError('size')} />
            </CCol>
            <CCol md={4}>
              <EnumSelect
                name="sociabilityLevel"
                label="Nivel de sociabilidad"
                options={SOCIABILITY_OPTIONS}
                value={values.sociabilityLevel}
                onChange={handleChange}
                error={fieldError('sociabilityLevel')}
              />
              <div className="form-text mt-n2 mb-3">0 = nada sociable, 5 = muy sociable.</div>
            </CCol>
            <CCol md={4}>
              <FormField
                name="actualWeight"
                type="number"
                step="0.01"
                min="0"
                label="Peso actual"
                value={values.actualWeight}
                onChange={handleChange}
                error={fieldError('actualWeight')}
              />
            </CCol>
            <CCol md={4}>
              <EnumSelect
                name="unitOfMeasureWeight"
                label="Unidad de peso"
                options={UNIT_MEASURE_WEIGHT_PET_OPTIONS}
                value={values.unitOfMeasureWeight}
                onChange={handleChange}
                error={fieldError('unitOfMeasureWeight')}
              />
            </CCol>
            <CCol md={4} className="d-flex align-items-center mb-3">
              <CFormSwitch
                id="isNeutered"
                label="Esterilizado(a)"
                checked={values.isNeutered}
                onChange={(event) => setValue('isNeutered', event.target.checked)}
              />
            </CCol>
          </CRow>
          <div className="d-flex justify-content-end gap-2">
            <CButton color="secondary" variant="ghost" onClick={() => navigate(-1)} disabled={submitting}>
              Cancelar
            </CButton>
            <CButton type="submit" color="primary" disabled={submitting}>
              {submitting && <CSpinner size="sm" className="me-2" />}
              Guardar
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
