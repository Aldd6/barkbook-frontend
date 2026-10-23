import { CButton, CCol, CForm, CFormCheck, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useForm from '../../hooks/useForm'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import CityPicker from '../../components/CityPicker'
import { dpi, maxLength, minLength, nit, phone, required } from '../../utils/validators'

const FIELDS = [
  'stateId',
  'cityId',
  'name',
  'lastname',
  'dpiNumber',
  'nitOrCf',
  'nitNumber',
  'phoneNumber',
  'addressLineOne',
  'addressLineTwo',
  'termsAcceptance',
]

const buildRules = (values) => ({
  stateId: [required('Seleccione un departamento.')],
  cityId: [required('Seleccione un municipio.')],
  name: [required('Ingrese su nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  lastname: [required('Ingrese su apellido.'), minLength(2, 'El apellido debe tener al menos 2 caracteres.'), maxLength(100, 'El apellido no puede exceder los 100 caracteres.')],
  dpiNumber: [required('Ingrese su número de DPI.'), dpi],
  nitNumber: values.nitOrCf ? [required('El numero de NIT es obligatorio cuando el cliente factura con NIT.'), nit] : [],
  phoneNumber: [required('Ingrese su número de teléfono.'), phone],
  addressLineOne: [required('Ingrese su dirección.'), minLength(3, 'La direccion debe tener al menos 3 caracteres.'), maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
  addressLineTwo: [maxLength(254, 'La direccion no puede exceder los 254 caracteres.')],
  termsAcceptance: [(value) => (value ? null : 'Debe aceptar los terminos y condiciones para continuar.')],
})

const toCustomerPayload = (values) => {
  const payload = {
    cityId: Number(values.cityId),
    name: values.name.trim(),
    lastname: values.lastname.trim(),
    dpiNumber: values.dpiNumber.trim(),
    nitOrCf: values.nitOrCf,
    addressLineOne: values.addressLineOne.trim(),
    phoneNumber: values.phoneNumber.trim(),
    termsAcceptance: values.termsAcceptance,
  }
  if (values.nitOrCf) payload.nitNumber = values.nitNumber.trim()
  if (values.addressLineTwo.trim()) payload.addressLineTwo = values.addressLineTwo.trim()
  return payload
}

export default function CompleteProfile() {
  const { user, completeProfile, logout } = useAuth()

  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    {
      stateId: '',
      cityId: '',
      name: '',
      lastname: '',
      dpiNumber: '',
      nitOrCf: false,
      nitNumber: '',
      phoneNumber: '+502',
      addressLineOne: '',
      addressLineTwo: '',
      termsAcceptance: false,
    },
    { rules: buildRules },
  )

  const onSubmit = handleSubmit(async (form) => {
    await completeProfile(toCustomerPayload(form))
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <h1 className="h4 text-center mb-1">Completa tu perfil</h1>
      <p className="text-center text-body-secondary mb-4">
        Hola {user.username}! Necesitamos tus datos antes de que puedas registrar mascotas y hacer reservas.
      </p>

      <ApiErrorAlert error={apiError} fields={FIELDS} />

      <CRow>
        <CCol md={6}>
          <FormField name="name" label="Nombre" autoComplete="given-name" value={values.name} onChange={handleChange} error={fieldError('name')} />
        </CCol>
        <CCol md={6}>
          <FormField name="lastname" label="Apellido" autoComplete="family-name" value={values.lastname} onChange={handleChange} error={fieldError('lastname')} />
        </CCol>
        <CCol md={6}>
          <FormField
            name="dpiNumber"
            label="DPI"
            inputMode="numeric"
            maxLength={13}
            helpText="13 dígitos, sin espacios ni guiones."
            value={values.dpiNumber}
            onChange={handleChange}
            error={fieldError('dpiNumber')}
          />
        </CCol>
        <CCol md={6}>
          <FormField
            name="phoneNumber"
            label="Teléfono"
            type="tel"
            autoComplete="tel"
            maxLength={12}
            helpText="Formato +502 seguido de 8 dígitos."
            value={values.phoneNumber}
            onChange={handleChange}
            error={fieldError('phoneNumber')}
          />
        </CCol>

        <CityPicker
          stateId={values.stateId}
          cityId={values.cityId}
          onStateChange={(value) => setValue('stateId', value)}
          onCityChange={(value) => setValue('cityId', value)}
          stateError={fieldError('stateId')}
          cityError={fieldError('cityId')}
        />

        <CCol xs={12}>
          <FormField
            name="addressLineOne"
            label="Dirección"
            autoComplete="address-line1"
            value={values.addressLineOne}
            onChange={handleChange}
            error={fieldError('addressLineOne')}
          />
        </CCol>
        <CCol xs={12}>
          <FormField
            name="addressLineTwo"
            label="Dirección (línea 2, opcional)"
            autoComplete="address-line2"
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
            id="nitOrCf-cf"
            name="nitOrCfOption"
            label="Consumidor final (CF)"
            checked={!values.nitOrCf}
            onChange={() => setValue('nitOrCf', false)}
          />
          <CFormCheck
            inline
            type="radio"
            id="nitOrCf-nit"
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
              helpText="Ejemplo: 1234567-8 o 1234567K."
              value={values.nitNumber}
              onChange={handleChange}
              error={fieldError('nitNumber')}
            />
          </CCol>
        )}

        <CCol xs={12} className="mb-4">
          <CFormCheck
            id="termsAcceptance"
            name="termsAcceptance"
            label="Acepto los términos y condiciones del servicio."
            checked={values.termsAcceptance}
            onChange={handleChange}
            invalid={Boolean(fieldError('termsAcceptance'))}
            feedbackInvalid={fieldError('termsAcceptance')}
          />
        </CCol>
      </CRow>

      <div className="d-flex flex-wrap justify-content-between gap-2">
        <CButton color="secondary" variant="ghost" onClick={logout} disabled={submitting}>
          Cerrar sesión
        </CButton>
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting && <CSpinner size="sm" className="me-2" />}
          Guardar perfil
        </CButton>
      </div>
    </CForm>
  )
}
