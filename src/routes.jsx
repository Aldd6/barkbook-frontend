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
import MyStay from './views/customer/bookings/MyStay'
import Profile from './views/customer/Profile'
import TodayBookings from './views/reception/TodayBookings'
import PendingBookings from './views/reception/PendingBookings'
import FrontDeskBooking from './views/reception/FrontDeskBooking'
import CheckIn from './views/reception/CheckIn'
import CheckOut from './views/reception/CheckOut'
import Cancellations from './views/reception/Cancellations'
import Rooms from './views/operation/Rooms'
import PendingServices from './views/care/PendingServices'
import Branches from './views/admin/Branches'
import Employees from './views/admin/Employees'
import RoomTypes from './views/admin/RoomTypes'
import RoomBranches from './views/admin/RoomBranches'
import Services from './views/admin/Services'
import ServiceBranches from './views/admin/ServiceBranches'
import { PERMISSIONS, ROOM_OPERATION_PERMISSIONS } from './constants/permissions'

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
                {/* Mi estancia lista las reservas del cliente y el catalogo de servicios de cada una */}
                <Route element={<RequirePermission permission={PERMISSIONS.CARGAR_SERVICIOS_RESERVACION} />}>
                  <Route path="/mi-estancia" element={<MyStay />} />
                </Route>
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

            {/* La API filtra las solicitudes por la sede del empleado */}
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION} />}>
              <Route path="/recepcion/cancelaciones" element={<Cancellations />} />
            </Route>

            {/* Cuidado: la API filtra las ordenes por la sede del empleado */}
            <Route element={<RequirePermission permission={PERMISSIONS.SUBIR_INFORMES_SERVICIOS} />}>
              <Route path="/cuidado/servicios" element={<PendingServices />} />
            </Route>

            {/* Operacion: GET /room-inventory solo pide sesion; la pantalla sirve a quien cambia estados o gestiona habitaciones */}
            <Route element={<RequirePermission anyOf={ROOM_OPERATION_PERMISSIONS} />}>
              <Route path="/operacion/habitaciones" element={<Rooms />} />
            </Route>

            {/* Administracion */}
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_SEDES} />}>
              <Route path="/admin/sedes" element={<Branches />} />
            </Route>
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_TIPOS_HABITACION} />}>
              <Route path="/admin/tipos-habitacion" element={<RoomTypes />} />
            </Route>
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_HABITACIONES_SEDE} />}>
              <Route path="/admin/habitaciones-sede" element={<RoomBranches />} />
            </Route>
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS} />}>
              <Route path="/admin/servicios" element={<Services />} />
              <Route path="/admin/servicios-sede" element={<ServiceBranches />} />
            </Route>
            <Route element={<RequirePermission permission={PERMISSIONS.GESTIONAR_EMPLEADOS} />}>
              <Route path="/admin/empleados" element={<Employees />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
