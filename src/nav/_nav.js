import { cilBan, cilBasket, cilBed, cilBuilding, cilCalendar, cilCalendarCheck, cilContact, cilHome, cilLayers, cilPaw, cilPeople, cilRoom, cilSitemap, cilSpa, cilTask, cilUser, cilWallet } from '@coreui/icons'
import { PERMISSIONS, ROOM_OPERATION_PERMISSIONS } from '../constants/permissions'

const navigation = [
  {
    items: [{ name: 'Inicio', to: '/', icon: cilHome, end: true }],
  },
  {
    title: 'Mi cuenta',
    items: [
      { name: 'Mis mascotas', to: '/mascotas', icon: cilPaw, requiresCustomer: true },
      {
        name: 'Mi estancia',
        to: '/mi-estancia',
        icon: cilBasket,
        allOf: [PERMISSIONS.CONSULTAR_CUENTA_RESERVACION, PERMISSIONS.CARGAR_SERVICIOS_RESERVACION],
        requiresCustomer: true,
      },
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
      { name: 'Cancelaciones', to: '/recepcion/cancelaciones', icon: cilBan, permission: PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION },
    ],
  },
  {
    title: 'Cuidado',
    items: [{ name: 'Servicios pendientes', to: '/cuidado/servicios', icon: cilTask, permission: PERMISSIONS.SUBIR_INFORMES_SERVICIOS }],
  },
  {
    title: 'Operación',
    items: [{ name: 'Habitaciones', to: '/operacion/habitaciones', icon: cilBed, anyOf: ROOM_OPERATION_PERMISSIONS }],
  },
  {
    title: 'Administración',
    items: [
      { name: 'Sedes', to: '/admin/sedes', icon: cilBuilding, permission: PERMISSIONS.GESTIONAR_SEDES },
      { name: 'Tipos de habitación', to: '/admin/tipos-habitacion', icon: cilRoom, permission: PERMISSIONS.GESTIONAR_TIPOS_HABITACION },
      { name: 'Habitaciones por sede', to: '/admin/habitaciones-sede', icon: cilLayers, permission: PERMISSIONS.GESTIONAR_HABITACIONES_SEDE },
      { name: 'Servicios', to: '/admin/servicios', icon: cilSpa, permission: PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS },
      { name: 'Servicios por sede', to: '/admin/servicios-sede', icon: cilSitemap, permission: PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS },
      { name: 'Empleados', to: '/admin/empleados', icon: cilPeople, permission: PERMISSIONS.GESTIONAR_EMPLEADOS },
    ],
  },
]

export default navigation
