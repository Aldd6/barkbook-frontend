import { CButton, CCard, CCardBody, CCol, CForm, CFormCheck, CFormInput, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import CityPicker from '../../components/CityPicker'
import { updateCustomer } from '../../api/customers'
import { maxLength, minLength, nit, phone, required } from '../../utils/validators'

const FIELDS = ['stateId', 'cityId', 'name', 'lastname', 'phoneNumber', 'addressLineOne', 'addressLineTwo', 'nitOrCf', 'nitNumber']

const buildRules = (values) => ({
  cityId: values.stateId ? [required('Seleccione un municipio.')] : [],
  name: [required('Ingrese su nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  lastname: [required('Ingrese su apellido.'), minLength(2, 'El apellido debe tener al menos 2 caracteres.'), maxLength(100, 'El apellido no puede exceder los 100 caracteres.')],
  phoneNumber: [required('Ingrese su número de teléfono.'), phone],
  addressLineOne: [required('Ingrese su dirección.'), minLength(3, 'La direccion debe tener al menos 3 caracteres.'), maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
  addressLineTwo: [maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
  nitNumber: values.nitOrCf ? [required('El numero de NIT es obligatorio cuando el cliente factura con NIT.'), nit] : [],
})

const toFormValues = (customer) => ({
  stateId: '',
  cityId: '',
  name: customer.name,
  lastname: customer.lastname,
  phoneNumber: customer.phoneNumber,
  addressLineOne: customer.addressLineOne,
  addressLineTwo: customer.addressLineTwo ?? '',
  nitOrCf: customer.nitOrCf,
  nitNumber: customer.nitNumber ?? '',
})

// PUT /customers/:id. El municipio solo se envia si el cliente elige uno nuevo.
const toPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    lastname: values.lastname.trim(),
    phoneNumber: values.phoneNumber.trim(),
    addressLineOne: values.addressLineOne.trim(),
    addressLineTwo: values.addressLineTwo.trim(),
    nitOrCf: values.nitOrCf,
  }
  if (values.cityId) payload.cityId = Number(values.cityId)
  if (values.nitOrCf) payload.nitNumber = values.nitNumber.trim()
  return payload
}

export default function Profile() {
  const { customer, user, reloadSession } = useAuth()
  const toast = useToast()
  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(customer), {
    rules: buildRules,
  })

  // Recarga /auth/me para que el header y el resto de la app vean los datos nuevos.
  const onSubmit = handleSubmit(async (form) => {
    const result = await updateCustomer(customer.id, toPayload(form))
    toast.success(result.message)
    await reloadSession()
  })

  return (
    <>
      <PageHeader title="Mi perfil" subtitle={`Usuario ${user.username} · ${user.email}`} />
      <CCard>
        <CCardBody>
          <CForm onSubmit={onSubmit} noValidate>
            <ApiErrorAlert error={apiError} fields={FIELDS} />
            <CRow>
              <CCol md={6}>
                <FormField name="name" label="Nombre" value={values.name} onChange={handleChange} error={fieldError('name')} />
              </CCol>
              <CCol md={6}>
                <FormField name="lastname" label="Apellido" value={values.lastname} onChange={handleChange} error={fieldError('lastname')} />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormInput id="dpiNumber" label="DPI" value={customer.dpiNumber} disabled text="El DPI no se puede modificar." />
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

              <CCol xs={12}>
                <div className="form-text mb-2">Para cambiar su municipio, elija el departamento y el municipio nuevos. Si no, déjelos como están.</div>
              </CCol>
              <CityPicker
                stateId={values.stateId}
                cityId={values.cityId}
                onStateChange={(value) => setValue('stateId', value)}
                onCityChange={(value) => setValue('cityId', value)}
                stateError={fieldError('stateId')}
                cityError={fieldError('cityId')}
                statePlaceholder="Sin cambios"
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

              <CCol xs={12} className="mb-2">
                <div className="form-label">Facturación</div>
                <CFormCheck
                  inline
                  type="radio"
                  id="profile-cf"
                  name="nitOrCfOption"
                  label="Consumidor final (CF)"
                  checked={!values.nitOrCf}
                  onChange={() => setValue('nitOrCf', false)}
                />
                <CFormCheck
                  inline
                  type="radio"
                  id="profile-nit"
                  name="nitOrCfOption"
                  label="Factura con NIT"
                  checked={values.nitOrCf}
                  onChange={() => setValue('nitOrCf', true)}
                />
              </CCol>
              {values.nitOrCf && (
                <CCol md={6}>
                  <FormField
                    name="nitNumber"
                    label="NIT"
                    maxLength={15}
                    value={values.nitNumber}
                    onChange={handleChange}
                    error={fieldError('nitNumber')}
                  />
                </CCol>
              )}
            </CRow>
            <div className="d-flex justify-content-end">
              <CButton type="submit" color="primary" disabled={submitting}>
                {submitting && <CSpinner size="sm" className="me-2" />}
                Guardar cambios
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}
