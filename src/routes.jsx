import { Route, Routes } from 'react-router-dom'
import GuestOnly from './auth/GuestOnly'
import RequireAuth from './auth/RequireAuth'
import RequireProfile from './auth/RequireProfile'
import RequireIncompleteProfile from './auth/RequireIncompleteProfile'
import RequireCustomer from './auth/RequireCustomer'
import RequirePermission from './auth/RequirePermission'
import AuthLayout from './layout/AuthLayout'
import DefaultLayout from './layout/DefaultLayout'
import Login from './views/auth/Login'
import Register from './views/auth/Register'
import CompleteProfile from './views/auth/CompleteProfile'
import Home from './views/pages/Home'
import NotFound from './views/pages/NotFound'
import Pets from './views/customer/pets/Pets'
import PetFormPage from './views/customer/pets/PetForm'
import PetDetail from './views/customer/pets/PetDetail'
import EmergencyContacts from './views/customer/EmergencyContacts'
import Bookings from './views/customer/bookings/Bookings'
import NewBooking from './views/customer/bookings/NewBooking'
import BookingDetail from './views/customer/bookings/BookingDetail'
import RequestService from './views/customer/bookings/RequestService'
import Profile from './views/customer/Profile'
import TodayBookings from './views/reception/TodayBookings'
import PendingBookings from './views/reception/PendingBookings'
import FrontDeskBooking from './views/reception/FrontDeskBooking'
import CheckIn from './views/reception/CheckIn'
import CheckOut from './views/reception/CheckOut'
import { PERMISSIONS } from './constants/permissions'

// Cada ruta exige el mismo permiso que el endpoint principal que usa en el back end.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<RequireIncompleteProfile />}>
          <Route element={<AuthLayout wide />}>
            <Route path="/completar-perfil" element={<CompleteProfile />} />
          </Route>
        </Route>

        <Route element={<RequireProfile />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />

            {/* Cliente: rutas filtradas por su customerId */}
            <Route element={<RequireCustomer />}>
              <Route path="/mascotas" element={<Pets />} />
              <Route path="/mascotas/:id" element={<PetDetail />} />
              <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_MASCOTAS} />}>
                <Route path="/mascotas/nueva" element={<PetFormPage />} />
                <Route path="/mascotas/:id/editar" element={<PetFormPage />} />
              </Route>
              <Route path="/contactos-emergencia" element={<EmergencyContacts />} />
              <Route element={<RequirePermission permission={PERMISSIONS.CONSULTAR_CUENTA_RESERVACION} />}>
                <Route path="/reservas" element={<Bookings />} />
                <Route path="/reservas/:id" element={<BookingDetail />} />
              </Route>
              <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_RESERVACIONES} />}>
                <Route path="/reservas/nueva" element={<NewBooking />} />
              </Route>
              <Route element={<RequirePermission permission={PERMISSIONS.CARGAR_SERVICIOS_RESERVACION} />}>
                <Route path="/reservas/:id/servicios" element={<RequestService />} />
              </Route>
              <Route path="/perfil" element={<Profile />} />
            </Route>

            {/* Recepcion */}
            <Route element={<RequirePermission permission={PERMISSIONS.VER_RESERVAS_DIA} />}>
              <Route path="/recepcion/reservas" element={<TodayBookings />} />
              <Route path="/recepcion/pendientes" element={<PendingBookings />} />
              <Route element={<RequirePermission permission={PERMISSIONS.CONSULTAR_CUENTA_RESERVACION} />}>
                <Route path="/recepcion/reservas/:id" element={<FrontDeskBooking />} />
                <Route element={<RequirePermission permission={PERMISSIONS.HACER_CHECK_IN} />}>
                  <Route path="/recepcion/reservas/:id/check-in" element={<CheckIn />} />
                </Route>
                <Route element={<RequirePermission permission={PERMISSIONS.HACER_CHECK_OUT} />}>
                  <Route path="/recepcion/reservas/:id/check-out" element={<CheckOut />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
