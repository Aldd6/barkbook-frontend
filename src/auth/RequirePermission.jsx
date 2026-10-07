import { Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import Forbidden from '../views/pages/Forbidden'

// Protege rutas por permiso (no por rol). Acepta un permiso o una lista (basta con uno).
export default function RequirePermission({ permission, anyOf, children }) {
  const { hasPermission, hasAnyPermission } = useAuth()

  const allowed = permission ? hasPermission(permission) : anyOf ? hasAnyPermission(anyOf) : true
  if (!allowed) return <Forbidden />
  return children ?? <Outlet />
}
