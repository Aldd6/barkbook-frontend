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
  SOLICITAR_CANCELACION_RESERVACION: 'Solicitar cancelacion de reservacion',
  GESTIONAR_CANCELACIONES_RESERVACION: 'Gestionar cancelaciones de reservacion',
  VER_REPORTES_ESTADO_MASCOTA: 'Ver reportes de estado de mascota',
  SUBIR_REPORTES_ESTADO_MASCOTA: 'Subir reportes de estado de mascota',
  SUBIR_INFORMES_SERVICIOS: 'Subir informes de servicios completados',
  APLICAR_MEDICACION: 'Aplicar medicacion requerida a mascotas',
  SUBIR_INFORMES_LIMPIEZA: 'Subir informes de limpieza de habitaculos',
  APLICAR_ALIMENTACION: 'Aplicar alimentacion a mascotas',
})

export const ROOM_OPERATION_PERMISSIONS = Object.freeze([
  PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES,
  PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS,
])

export const ADMIN_ROLE_NAME = 'Administrador'

export const CUSTOMER_ROLE_NAME = 'Cliente'
