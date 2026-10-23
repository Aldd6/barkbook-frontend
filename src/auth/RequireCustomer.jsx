import { Outlet } from 'react-router-dom'
import useAuth from './useAuth'
import Forbidden from '../views/pages/Forbidden'

export default function RequireCustomer() {
  const { customer } = useAuth()
  if (!customer) return <Forbidden />
  return <Outlet />
}
