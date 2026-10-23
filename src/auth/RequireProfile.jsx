import { Navigate, Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import { CUSTOMER_ROLE_NAME } from '../constants/permissions'
import PendingEmployeeLink from '../views/pages/PendingEmployeeLink'

export default function RequireProfile() {
  const { user } = useAuth()

  if (!user.profileCompleted) {
    if (user.roleName === CUSTOMER_ROLE_NAME) return <Navigate to="/completar-perfil" replace />
    return <PendingEmployeeLink />
  }
  return <Outlet />
}
