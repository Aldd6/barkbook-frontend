import { cilCalendar, cilCalendarCheck, cilContact, cilHome, cilPaw, cilUser, cilWallet } from '@coreui/icons'
import { PERMISSIONS } from '../constants/permissions'

// Menu lateral agrupado por secciones. Cada item se muestra solo si:
// - el usuario tiene `permission` (o alguno de `anyOf`), y
// - si `requiresCustomer`, la sesion tiene perfil de cliente (las rutas filtradas usan customerId).
// Sin condiciones, lo ve cualquier sesion.
const navigation = [
  {
    items: [{ name: 'Inicio', to: '/', icon: cilHome, end: true }],
  },
  {
    title: 'Mi cuenta',
    items: [
      { name: 'Mis mascotas', to: '/mascotas', icon: cilPaw, requiresCustomer: true },
      { name: 'Mis reservas', to: '/reservas', icon: cilCalendarCheck, permission: PERMISSIONS.CONSULTAR_CUENTA_RESERVACION, requiresCustomer: true },
      { name: 'Contactos de emergencia', to: '/contactos-emergencia', icon: cilContact, requiresCustomer: true },
      { name: 'Mi perfil', to: '/perfil', icon: cilUser, requiresCustomer: true },
    ],
  },
  {
    title: 'Recepción',
    items: [
      { name: 'Reservas del día', to: '/recepcion/reservas', icon: cilCalendar, permission: PERMISSIONS.VER_RESERVAS_DIA },
      { name: 'Pagos pendientes', to: '/recepcion/pendientes', icon: cilWallet, permission: PERMISSIONS.VER_RESERVAS_DIA },
    ],
  },
]

export default navigation
