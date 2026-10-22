import { CCol, CRow } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import CityPicker from '../../components/CityPicker'
import { createBranch, updateBranch } from '../../api/branches'
import { maxLength, minLength, required } from '../../utils/validators'

const FIELDS = ['stateId', 'cityId', 'branchName', 'addressLineOne', 'addressLineTwo']

// Al crear, el municipio es obligatorio; al editar solo se envia si se elige uno nuevo.
const buildRules = (isNew) => (values) => ({
  cityId: isNew || values.stateId ? [required('Seleccione un municipio.')] : [],
  branchName: [
    required('Ingrese el nombre de la sede.'),
    minLength(3, 'El nombre de la sede debe tener al menos 3 caracteres.'),
    maxLength(150, 'El nombre de la sede no puede exceder los 150 caracteres.'),
  ],
  addressLineOne: [
    required('Ingrese la dirección.'),
    minLength(3, 'La direccion debe tener al menos 3 caracteres.'),
    maxLength(254, 'La direccion no puede exceder los 254 caracteres.'),
  ],
  addressLineTwo: [maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
})

const toFormValues = (branch) => ({
  stateId: '',
  cityId: '',
  branchName: branch?.branchName ?? '',
  addressLineOne: branch?.addressLineOne ?? '',
  addressLineTwo: branch?.addressLineTwo ?? '',
})

const toPayload = (values, isNew) => {
  const payload = {
    branchName: values.branchName.trim(),
    addressLineOne: values.addressLineOne.trim(),
  }
  const lineTwo = values.addressLineTwo.trim()
  if (lineTwo || !isNew) payload.addressLineTwo = lineTwo
  if (values.cityId) payload.cityId = Number(values.cityId)
  return payload
}

// POST /branches o PUT /branches/:id. Renderizar con key para reiniciar el formulario.
// `branch`: undefined = cerrado, null = nueva, objeto = editar.
export default function BranchModal({ branch, onClose, onSaved }) {
  const toast = useToast()
  const isNew = branch === null
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(branch), {
    rules: buildRules(isNew),
  })

  const onSubmit = handleSubmit(async (form) => {
    const result = isNew ? await createBranch(toPayload(form, true)) : await updateBranch(branch.id, toPayload(form, false))
    toast.success(result.message)
    onSaved()
    onClose()
  })

  return (
    <FormModal
      visible={branch !== undefined}
      title={isNew ? 'Nueva sede' : `Editar ${branch?.branchName ?? 'sede'}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      size="lg"
    >
      <FormField name="branchName" label="Nombre" value={values.branchName} onChange={handleChange} error={fieldError('branchName')} />
      <CRow>
        {!isNew && (
          <CCol xs={12}>
            <div className="form-text mb-2">Para cambiar el municipio, elija el departamento y el municipio nuevos. Si no, déjelos como están.</div>
          </CCol>
        )}
        <CityPicker
          stateId={values.stateId}
          cityId={values.cityId}
          onStateChange={(value) => setValue('stateId', value)}
          onCityChange={(value) => setValue('cityId', value)}
          stateError={fieldError('stateId')}
          cityError={fieldError('cityId')}
          statePlaceholder={isNew ? 'Seleccione un departamento' : 'Sin cambios'}
        />
      </CRow>
      <FormField name="addressLineOne" label="Dirección" value={values.addressLineOne} onChange={handleChange} error={fieldError('addressLineOne')} />
      <FormField
        name="addressLineTwo"
        label="Dirección (línea 2, opcional)"
        value={values.addressLineTwo}
        onChange={handleChange}
        error={fieldError('addressLineTwo')}
      />
    </FormModal>
  )
}
