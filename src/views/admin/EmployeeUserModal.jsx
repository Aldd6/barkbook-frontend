import { useCallback, useState } from 'react'
import { CAlert, CFormCheck } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import { getRoles } from '../../api/roles'
import { createUser, getUsers } from '../../api/users'
import { assignEmployeeUser } from '../../api/employees'
import { ApiError, toApiError } from '../../api/errors'
import { CUSTOMER_ROLE_NAME } from '../../constants/permissions'
import { email, required, username } from '../../utils/validators'

const MODE = Object.freeze({ NEW: 'new', EXISTING: 'existing' })
const FIELDS = ['rolId', 'username', 'email', 'password', 'confirmPassword', 'userId']

const buildRules = (mode) =>
  mode === MODE.NEW
    ? {
        rolId: [required('Seleccione el rol.')],
        username: [required('Ingrese un nombre de usuario.'), username],
        email: [required('Ingrese el correo electrónico.'), email],
        password: [required('Ingrese una contraseña.')],
        confirmPassword: [required('Confirme la contraseña.'), (value, all) => (value !== all.password ? 'Las contraseñas no coinciden.' : null)],
      }
    : { userId: [required('Seleccione un usuario.')] }

// Roles del personal (GET /roles) y usuarios de personal aun sin empleado (GET /users).
// Un usuario vinculado queda con profileCompleted: true, asi que los pendientes son los de personal sin perfil.
const loadOptions = async () => {
  const [roles, users] = await Promise.all([getRoles(), getUsers()])
  const staffRoles = roles.filter((role) => role.name !== CUSTOMER_ROLE_NAME)
  const staffRoleIds = new Set(staffRoles.map((role) => role.id))
  return {
    roles: staffRoles,
    roleNameById: new Map(roles.map((role) => [role.id, role.name])),
    pendingUsers: users.filter((user) => staffRoleIds.has(user.rolId) && !user.profileCompleted),
  }
}

// Da acceso al sistema a un empleado: crea el usuario (POST /users) y lo vincula
// (PATCH /employees/:id/assign-user), o vincula un usuario de personal que ya exista.
// Renderizar con key={employee?.id}.
export default function EmployeeUserModal({ employee, onClose, onSaved }) {
  const toast = useToast()
  const options = useApiQuery(useCallback(() => (employee ? loadOptions() : Promise.resolve(null)), [employee]))
  const [mode, setMode] = useState(MODE.NEW)
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError, reset } = useForm(
    { rolId: '', username: '', email: '', password: '', confirmPassword: '', userId: '' },
    { rules: buildRules(mode) },
  )

  const changeMode = (next) => {
    setMode(next)
    reset({ ...values, userId: '' })
  }

  const onSubmit = handleSubmit(async (form) => {
    let userId = Number(form.userId)
    if (mode === MODE.NEW) {
      const created = await createUser({
        rolId: Number(form.rolId),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      userId = created.user.id
      try {
        const result = await assignEmployeeUser(employee.id, userId)
        toast.success(result.message)
      } catch (error) {
        // El usuario ya existe: se puede reintentar desde "Vincular usuario existente".
        options.reload()
        setMode(MODE.EXISTING)
        reset({ ...form, userId: String(userId) })
        throw new ApiError({
          ...toApiError(error),
          message: `Se creó el usuario ${created.user.username}, pero no se pudo vincular: ${toApiError(error).message} Intente vincularlo de nuevo.`,
        })
      }
    } else {
      const result = await assignEmployeeUser(employee.id, userId)
      toast.success(result.message)
    }
    onSaved()
    onClose()
  })

  const roleOptions = (options.data?.roles ?? []).map((role) => ({ value: String(role.id), label: role.name }))
  const userOptions = (options.data?.pendingUsers ?? []).map((user) => ({
    value: String(user.id),
    label: `${user.username} · ${user.email} (${options.data.roleNameById.get(user.rolId) ?? 'Sin rol'})`,
  }))

  return (
    <FormModal
      visible={Boolean(employee)}
      title={`Usuario de ${employee?.name ?? ''} ${employee?.lastname ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel={mode === MODE.NEW ? 'Crear y vincular' : 'Vincular'}
    >
      {options.error && <ApiErrorAlert error={options.error} />}
      <p className="small text-body-secondary">
        El empleado inicia sesión con este usuario. El rol define qué puede hacer en el sistema.
      </p>
      <div className="mb-3">
        <CFormCheck
          inline
          type="radio"
          id="user-mode-new"
          name="userMode"
          label="Crear usuario nuevo"
          checked={mode === MODE.NEW}
          onChange={() => changeMode(MODE.NEW)}
          disabled={submitting}
        />
        <CFormCheck
          inline
          type="radio"
          id="user-mode-existing"
          name="userMode"
          label="Vincular usuario existente"
          checked={mode === MODE.EXISTING}
          onChange={() => changeMode(MODE.EXISTING)}
          disabled={submitting}
        />
      </div>

      {mode === MODE.NEW ? (
        <>
          <EnumSelect
            name="rolId"
            label="Rol"
            placeholder={options.loading ? 'Cargando roles...' : 'Seleccione un rol'}
            options={roleOptions}
            value={values.rolId}
            onChange={handleChange}
            error={fieldError('rolId')}
          />
          <FormField
            name="username"
            label="Nombre de usuario"
            helpText="Solo letras y números, de 3 a 50 caracteres."
            autoComplete="off"
            value={values.username}
            onChange={handleChange}
            error={fieldError('username')}
          />
          <FormField name="email" type="email" label="Correo electrónico" autoComplete="off" value={values.email} onChange={handleChange} error={fieldError('email')} />
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
        </>
      ) : options.data && userOptions.length === 0 ? (
        <CAlert color="info" className="small mb-0">
          No hay usuarios de personal pendientes de vincular. Cree uno nuevo.
        </CAlert>
      ) : (
        <EnumSelect
          name="userId"
          label="Usuario"
          placeholder={options.loading ? 'Cargando usuarios...' : 'Seleccione un usuario'}
          options={userOptions}
          value={values.userId}
          onChange={handleChange}
          error={fieldError('userId')}
        />
      )}
    </FormModal>
  )
}
