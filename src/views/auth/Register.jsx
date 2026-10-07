import { Link, useNavigate } from 'react-router-dom'
import { CButton, CForm, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useForm from '../../hooks/useForm'
import FormField from '../../components/FormField'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import { signup } from '../../api/auth'
import { email, required, username } from '../../utils/validators'

const FIELDS = ['username', 'email', 'password', 'confirmPassword']

// POST /auth/signup crea un usuario Cliente sin perfil. Luego se inicia sesion con las
// mismas credenciales y RequireProfile lo lleva a completar el perfil.
export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    { username: '', email: '', password: '', confirmPassword: '' },
    {
      rules: {
        username: [required('Ingrese un nombre de usuario.'), username],
        email: [required('Ingrese su correo electrónico.'), email],
        password: [required('Ingrese una contraseña.')],
        confirmPassword: [
          required('Confirme su contraseña.'),
          (value, all) => (value !== all.password ? 'Las contraseñas no coinciden.' : null),
        ],
      },
    },
  )

  const onSubmit = handleSubmit(async (form) => {
    const account = { username: form.username.trim(), email: form.email.trim(), password: form.password }
    await signup(account)
    try {
      await login({ username: account.username, password: account.password })
    } catch {
      // La cuenta ya existe: si el inicio automatico falla, se pide iniciar sesion manualmente.
      navigate('/login', { replace: true, state: { message: 'Cuenta creada exitosamente. Inicie sesión para continuar.' } })
    }
  })

  return (
    <CForm onSubmit={onSubmit} noValidate>
      <h1 className="h4 text-center mb-1">Crear cuenta</h1>
      <p className="text-center text-body-secondary mb-4">Registre su cuenta para reservar la estancia de sus mascotas.</p>

      <ApiErrorAlert error={apiError} fields={FIELDS} />

      <FormField
        name="username"
        label="Nombre de usuario"
        autoComplete="username"
        helpText="Entre 3 y 50 caracteres, solo letras y números."
        autoFocus
        value={values.username}
        onChange={handleChange}
        error={fieldError('username')}
      />
      <FormField
        name="email"
        type="email"
        label="Correo electrónico"
        autoComplete="email"
        value={values.email}
        onChange={handleChange}
        error={fieldError('email')}
      />
      <FormField
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange}
        error={fieldError('password')}
      />
      <FormField
        name="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={fieldError('confirmPassword')}
      />

      <div className="d-grid mb-3">
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting && <CSpinner size="sm" className="me-2" />}
          Crear cuenta
        </CButton>
      </div>
      <p className="text-center mb-0">
        ¿Ya tiene cuenta? <Link to="/login">Inicie sesión</Link>
      </p>
    </CForm>
  )
}
