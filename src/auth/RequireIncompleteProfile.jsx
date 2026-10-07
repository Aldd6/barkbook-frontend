import { Navigate, Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import { CUSTOMER_ROLE_NAME } from '../constants/permissions'

// Solo un Cliente sin perfil puede entrar a completar su perfil.
export default function RequireIncompleteProfile() {
  const { user } = useAuth()

  if (user.profileCompleted || user.roleName !== CUSTOMER_ROLE_NAME) return <Navigate to="/" replace />
  return <Outlet />
}
