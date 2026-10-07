import { Navigate, Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import { CUSTOMER_ROLE_NAME } from '../constants/permissions'
import PendingEmployeeLink from '../views/pages/PendingEmployeeLink'

// Perfil obligatorio: los endpoints de cliente responden 403 hasta que exista el perfil.
// - Cliente sin perfil -> completar perfil (POST /customers).
// - Personal sin perfil (usuario aun no vinculado con assign-user) -> aviso, no formulario de cliente.
export default function RequireProfile() {
  const { user } = useAuth()

  if (!user.profileCompleted) {
    if (user.roleName === CUSTOMER_ROLE_NAME) return <Navigate to="/completar-perfil" replace />
    return <PendingEmployeeLink />
  }
  return <Outlet />
}
