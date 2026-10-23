import { useState } from 'react'
import { CButton } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import AuthLayout from '../../layout/AuthLayout'

export default function PendingEmployeeLink() {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <AuthLayout>
      <h1 className="h4 text-center mb-3">Hola {user.username}!</h1>
      <p className="text-center">
        Tu cuenta aún no está vinculada a un empleado. Pide al administrador que la vincule para poder usar el sistema.
      </p>
      <div className="d-grid">
        <CButton color="primary" variant="outline" onClick={handleLogout} disabled={loggingOut}>
          Cerrar sesión
        </CButton>
      </div>
    </AuthLayout>
  )
}
