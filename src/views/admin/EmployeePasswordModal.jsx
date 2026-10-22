import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import { updateEmployeePassword } from '../../api/employees'
import { required } from '../../utils/validators'

const FIELDS = ['password', 'confirmPassword']

// Igual que el DTO del back end: sin recortar espacios (forman parte de la contrasena).
// bcrypt solo toma en cuenta los primeros 72 bytes.
const RULES = {
  password: [
    required('Ingrese la nueva contraseña.'),
    (value) => (value.length < 8 ? 'La contrasena debe tener al menos 8 caracteres.' : null),
    (value) => (value.length > 72 ? 'La contrasena no puede exceder los 72 caracteres.' : null),
  ],
  confirmPassword: [required('Confirme la contraseña.'), (value, all) => (value !== all.password ? 'Las contraseñas no coinciden.' : null)],
}

// PATCH /employees/:id/password. Renderizar con key={employee?.id}.
export default function EmployeePasswordModal({ employee, onClose }) {
  const toast = useToast()
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm({ password: '', confirmPassword: '' }, { rules: RULES })

  const onSubmit = handleSubmit(async (form) => {
    const result = await updateEmployeePassword(employee.id, form.password)
    toast.success(result.message)
    onClose()
  })

  return (
    <FormModal
      visible={Boolean(employee)}
      title={`Cambiar contraseña de ${employee?.name ?? ''} ${employee?.lastname ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel="Cambiar contraseña"
    >
      <p className="small text-body-secondary">
        Se cerrarán las sesiones activas del empleado: en menos de 15 minutos deberá iniciar sesión con la nueva contraseña.
      </p>
      <FormField
        name="password"
        type="password"
        label="Nueva contraseña"
        helpText="De 8 a 72 caracteres."
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
        className="mb-0"
        value={values.confirmPassword}
        onChange={handleChange}
        error={fieldError('confirmPassword')}
      />
    </FormModal>
  )
}
