import { Link, useLocation } from 'react-router-dom'
import { CAlert, CButton, CForm, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useForm from '../../hooks/useForm'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import { required } from '../../utils/validators'

const FIELDS = ['identifier', 'password']

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    { identifier: '', password: '' },
    {
      rules: {
        identifier: [required('Ingrese su usuario o correo electrónico.')],
        password: [required('Ingrese su contraseña.')],
      },
      fieldMap: { username: 'identifier', email: 'identifier' },
    },
  )

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    const value = identifier.trim()
    const credentials = value.includes('@') ? { email: value, password } : { username: value, password }
    await login(credentials)
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <h1 className="h4 text-center mb-1">Iniciar sesión</h1>
      <p className="text-center text-body-secondary mb-4">Ingrese con su usuario o correo electrónico.</p>

      {location.state?.message && <CAlert color="success">{location.state.message}</CAlert>}
      <ApiErrorAlert error={apiError} fields={FIELDS} />

      <FormField
        name="identifier"
        label="Usuario o correo electrónico"
        autoComplete="username"
        autoFocus
        value={values.identifier}
        onChange={handleChange}
        error={fieldError('identifier')}
      />
      <FormField
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        error={fieldError('password')}
      />

      <div className="d-grid mb-3">
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting && <CSpinner size="sm" className="me-2" />}
          Iniciar sesión
        </CButton>
      </div>
      <p className="text-center mb-0">
        ¿No tiene cuenta? <Link to="/registro">Regístrese</Link>
      </p>
    </CForm>
  )
}
