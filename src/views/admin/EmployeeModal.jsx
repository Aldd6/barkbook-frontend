import { CCol, CFormInput, CRow } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import CityPicker from '../../components/CityPicker'
import FileUpload from '../../components/FileUpload'
import { createEmployee, removeEmployeeProfilePicture, updateEmployee, updateEmployeeProfilePicture } from '../../api/employees'
import { dpi, maxLength, minLength, phone, required } from '../../utils/validators'

const FIELDS = ['branchId', 'stateId', 'cityId', 'name', 'lastname', 'dpiNumber', 'phoneNumber', 'addressLineOne', 'addressLineTwo']

// Al crear, municipio y DPI son obligatorios; al editar el DPI no se puede cambiar y el municipio
// solo se envia si se elige uno nuevo.
const buildRules = (isNew) => (values) => ({
  branchId: [required('Seleccione la sede.')],
  cityId: isNew || values.stateId ? [required('Seleccione un municipio.')] : [],
  name: [required('Ingrese el nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  lastname: [required('Ingrese el apellido.'), minLength(2, 'El apellido debe tener al menos 2 caracteres.'), maxLength(100, 'El apellido no puede exceder los 100 caracteres.')],
  dpiNumber: isNew ? [required('Ingrese el DPI.'), dpi] : [],
  phoneNumber: [required('Ingrese el número de teléfono.'), phone],
  addressLineOne: [required('Ingrese la dirección.'), minLength(3, 'La direccion debe tener al menos 3 caracteres.'), maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
  addressLineTwo: [maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
})

const toFormValues = (employee) => ({
  branchId: employee ? String(employee.branchId) : '',
  stateId: '',
  cityId: '',
  name: employee?.name ?? '',
  lastname: employee?.lastname ?? '',
  dpiNumber: employee?.dpiNumber ?? '',
  phoneNumber: employee?.phoneNumber ?? '',
  addressLineOne: employee?.addressLineOne ?? '',
  addressLineTwo: employee?.addressLineTwo ?? '',
})

const toPayload = (values, isNew) => {
  const payload = {
    branchId: Number(values.branchId),
    name: values.name.trim(),
    lastname: values.lastname.trim(),
    phoneNumber: values.phoneNumber.trim(),
    addressLineOne: values.addressLineOne.trim(),
  }
  const lineTwo = values.addressLineTwo.trim()
  if (lineTwo || !isNew) payload.addressLineTwo = lineTwo
  if (values.cityId) payload.cityId = Number(values.cityId)
  if (isNew) payload.dpiNumber = values.dpiNumber.trim()
  return payload
}

// POST /employees o PUT /employees/:id. Renderizar con key para reiniciar el formulario.
// `employee`: undefined = cerrado, null = nuevo, objeto = editar (incluye la foto).
export default function EmployeeModal({ employee, branches, onClose, onSaved }) {
  const toast = useToast()
  const isNew = employee === null
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(employee), {
    rules: buildRules(isNew),
  })

  const branchOptions = branches.map((branch) => ({ value: String(branch.id), label: branch.branchName }))

  const onSubmit = handleSubmit(async (form) => {
    const result = isNew ? await createEmployee(toPayload(form, true)) : await updateEmployee(employee.id, toPayload(form, false))
    toast.success(result.message)
    onSaved()
    onClose()
  })

  return (
    <FormModal
      visible={employee !== undefined}
      title={isNew ? 'Nuevo empleado' : `Editar ${employee?.name ?? ''} ${employee?.lastname ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      size="lg"
    >
      <CRow>
        {!isNew && employee && (
          <CCol xs={12} className="mb-3">
            <div className="form-label">Foto de perfil</div>
            <div className="profile-picture">
              <FileUpload
                url={employee.profilePicture}
                emptyLabel="Sin foto"
                onUpload={(file) => updateEmployeeProfilePicture(employee.id, file)}
                onRemove={() => removeEmployeeProfilePicture(employee.id)}
                onChanged={onSaved}
              />
            </div>
          </CCol>
        )}
        <CCol md={6}>
          <FormField name="name" label="Nombre" value={values.name} onChange={handleChange} error={fieldError('name')} />
        </CCol>
        <CCol md={6}>
          <FormField name="lastname" label="Apellido" value={values.lastname} onChange={handleChange} error={fieldError('lastname')} />
        </CCol>
        <CCol md={6}>
          {isNew ? (
            <FormField
              name="dpiNumber"
              label="DPI"
              maxLength={13}
              inputMode="numeric"
              helpText="13 dígitos."
              value={values.dpiNumber}
              onChange={handleChange}
              error={fieldError('dpiNumber')}
            />
          ) : (
            <div className="mb-3">
              <CFormInput id="dpiNumber" label="DPI" value={values.dpiNumber} disabled text="El DPI no se puede modificar." />
            </div>
          )}
        </CCol>
        <CCol md={6}>
          <FormField
            name="phoneNumber"
            type="tel"
            maxLength={12}
            label="Teléfono"
            helpText="Formato +502 seguido de 8 dígitos."
            value={values.phoneNumber}
            onChange={handleChange}
            error={fieldError('phoneNumber')}
          />
        </CCol>
        <CCol md={6}>
          <EnumSelect
            name="branchId"
            label="Sede"
            placeholder="Seleccione una sede"
            options={branchOptions}
            value={values.branchId}
            onChange={handleChange}
            error={fieldError('branchId')}
          />
        </CCol>
        <CCol xs={12}>
          <div className="form-text mb-2">
            {isNew ? 'Municipio de residencia del empleado.' : 'Para cambiar el municipio de residencia, elija el departamento y el municipio nuevos. Si no, déjelos como están.'}
          </div>
        </CCol>
        <CityPicker
          stateId={values.stateId}
          cityId={values.cityId}
          onStateChange={(value) => setValue('stateId', value)}
          onCityChange={(value) => setValue('cityId', value)}
          stateError={fieldError('stateId')}
          cityError={fieldError('cityId')}
          statePlaceholder={isNew ? 'Seleccione un departamento' : 'Sin cambios'}
        />
        <CCol xs={12}>
          <FormField name="addressLineOne" label="Dirección" value={values.addressLineOne} onChange={handleChange} error={fieldError('addressLineOne')} />
        </CCol>
        <CCol xs={12}>
          <FormField
            name="addressLineTwo"
            label="Dirección (línea 2, opcional)"
            value={values.addressLineTwo}
            onChange={handleChange}
            error={fieldError('addressLineTwo')}
          />
        </CCol>
      </CRow>
    </FormModal>
  )
}
