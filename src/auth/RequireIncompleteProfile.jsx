import { Navigate, Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import { CUSTOMER_ROLE_NAME } from '../constants/permissions'

export default function RequireIncompleteProfile() {
  const { user } = useAuth()

  if (user.profileCompleted || user.roleName !== CUSTOMER_ROLE_NAME) return <Navigate to="/" replace />
  return <Outlet />
}
