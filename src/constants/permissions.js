// Nombres exactos de los permisos (PERMISSIONS en app/shared/constants/enums.js del back end).
// Se comparan contra GET /auth/me -> permissions.
export const PERMISSIONS = Object.freeze({
  GESTIONAR_ROLES_PERMISOS: 'Gestionar roles y permisos',
  GESTIONAR_USUARIOS: 'Gestionar usuarios',
  GESTIONAR_EMPLEADOS: 'Gestionar empleados',
  GESTIONAR_SEDES: 'Gestionar sedes',
  GESTIONAR_TIPOS_HABITACION: 'Gestionar tipos de habitacion',
  GESTIONAR_HABITACIONES_SEDE: 'Gestionar habitaciones por sede',
  GESTIONAR_HABITACIONES_FISICAS: 'Gestionar habitaciones fisicas',
  GESTIONAR_CATALOGO_SERVICIOS: 'Gestionar catalogo de servicios',
  GESTIONAR_MASCOTAS: 'Gestionar mascotas',
  GESTIONAR_CONTACTOS_EMERGENCIA: 'Gestionar contactos de emergencia',
  GESTIONAR_RESERVACIONES: 'Gestionar reservaciones',
  ACTUALIZAR_ESTADO_HABITACIONES: 'Actualizar estado de habitaciones',
  VER_RESERVAS_DIA: 'Ver reservas del dia',
  CONSULTAR_CUENTA_RESERVACION: 'Consultar cuenta de reservacion',
  HACER_CHECK_IN: 'Hacer check-in de reservas',
  HACER_CHECK_OUT: 'Hacer check-out de reservas',
  APLICAR_PAGOS_MOSTRADOR: 'Aplicar pagos cobrados en mostrador',
  CARGAR_SERVICIOS_RESERVACION: 'Cargar servicios a reservacion',
  VER_REPORTES_ESTADO_MASCOTA: 'Ver reportes de estado de mascota',
  SUBIR_REPORTES_ESTADO_MASCOTA: 'Subir reportes de estado de mascota',
  SUBIR_INFORMES_SERVICIOS: 'Subir informes de servicios completados',
  APLICAR_MEDICACION: 'Aplicar medicacion requerida a mascotas',
  SUBIR_INFORMES_LIMPIEZA: 'Subir informes de limpieza de habitaculos',
  APLICAR_ALIMENTACION: 'Aplicar alimentacion a mascotas',
})

// Mismo criterio que authorize.js del back end: el Administrador pasa cualquier chequeo.
export const ADMIN_ROLE_NAME = 'Administrador'

// Solo para el flujo de perfil obligatorio: identifica quien debe completar el perfil de cliente.
// No se usa para decidir permisos.
export const CUSTOMER_ROLE_NAME = 'Cliente'
