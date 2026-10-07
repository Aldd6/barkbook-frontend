import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import { AUTH_STATUS } from './AuthContext'
import LoadingScreen from '../components/LoadingScreen'

// Login y registro: si ya hay sesion, vuelve a donde iba el usuario o al inicio.
export default function GuestOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === AUTH_STATUS.LOADING) return <LoadingScreen />
  if (status === AUTH_STATUS.AUTHENTICATED) {
    const from = location.state?.from
    const to = from ? `${from.pathname}${from.search ?? ''}` : '/'
    return <Navigate to={to} replace />
  }
  return <Outlet />
}
