import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import { AUTH_STATUS } from './AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import Landing from '../views/landing/Landing'

export default function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === AUTH_STATUS.LOADING) return <LoadingScreen />
  if (status === AUTH_STATUS.ANONYMOUS && location.pathname === '/') return <Landing />
  if (status === AUTH_STATUS.ANONYMOUS) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
