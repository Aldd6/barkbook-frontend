import { Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import Forbidden from '../views/pages/Forbidden'

// Pantallas "Mi cuenta": usan las rutas filtradas por customerId, asi que requieren
// que la sesion tenga perfil de cliente (GET /auth/me -> customer).
export default function RequireCustomer() {
  const { customer } = useAuth()
  if (!customer) return <Forbidden />
  return <Outlet />
}
