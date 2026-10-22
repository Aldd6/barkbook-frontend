// Enums de la API (seccion 7 de API.md). Los valores son exactos: se envian tal cual.
// *_LABELS solo sirven para mostrar texto mas legible en la UI.

const toOptions = (values, labels = {}) => Object.values(values).map((value) => ({ value, label: labels[value] ?? value }))

export const PET_SPECIES = Object.freeze({ FELINO: 'FELINO', CANINO: 'CANINO' })
export const PET_SPECIES_LABELS = Object.freeze({ FELINO: 'Felino', CANINO: 'Canino' })

export const SEX = Object.freeze({ MACHO: 'MACHO', HEMBRA: 'HEMBRA' })
export const SEX_LABELS = Object.freeze({ MACHO: 'Macho', HEMBRA: 'Hembra' })

export const PET_SIZE = Object.freeze({ PEQUENIO: 'PEQUENIO', MEDIANO: 'MEDIANO', GRANDE: 'GRANDE', EXTRA: 'EXTRA' })
export const PET_SIZE_LABELS = Object.freeze({ PEQUENIO: 'Pequeño', MEDIANO: 'Mediano', GRANDE: 'Grande', EXTRA: 'Extra grande' })

export const UNIT_MEASURE_WEIGHT_PET = Object.freeze({ KILOGRAMOS: 'KILOGRAMOS', LIBRAS: 'LIBRAS', GRAMOS: 'GRAMOS' })
export const UNIT_MEASURE_WEIGHT_PET_LABELS = Object.freeze({ KILOGRAMOS: 'Kilogramos', LIBRAS: 'Libras', GRAMOS: 'Gramos' })

export const VACCINE_USE = Object.freeze({ INMUNIZACION: 'INMUNIZACION', REFUERZO: 'REFUERZO' })
export const VACCINE_USE_LABELS = Object.freeze({ INMUNIZACION: 'Inmunización', REFUERZO: 'Refuerzo' })

export const DIET_TYPE = Object.freeze({
  CROQUETAS: 'CROQUETAS/ALIMENTO SECO',
  HUMEDO: 'ALIMENTO HUMEDO',
  NATURAL: 'ALIMENTO NATURAL',
  HIBRIDA: 'ALIMENTACION HIBRIDA',
})
export const DIET_TYPE_LABELS = Object.freeze({
  'CROQUETAS/ALIMENTO SECO': 'Croquetas / alimento seco',
  'ALIMENTO HUMEDO': 'Alimento húmedo',
  'ALIMENTO NATURAL': 'Alimento natural',
  'ALIMENTACION HIBRIDA': 'Alimentación híbrida',
})

export const UNIT_MEASURE_SERVING_PET = Object.freeze({
  TAZAS: 'TAZAS',
  CUCHARADAS: 'CUCHARADAS',
  GRAMOS: 'GRAMOS',
  MILIGRAMOS: 'MILIGRAMOS',
  LIBRAS: 'LIBRAS',
  ONZAS: 'ONZAS',
})
export const UNIT_MEASURE_SERVING_PET_LABELS = Object.freeze({
  TAZAS: 'Tazas',
  CUCHARADAS: 'Cucharadas',
  GRAMOS: 'Gramos',
  MILIGRAMOS: 'Miligramos',
  LIBRAS: 'Libras',
  ONZAS: 'Onzas',
})

export const KINSHIP = Object.freeze({
  PADRE_MADRE: 'PADRE/MADRE',
  HERMANO: 'HERMANO(A)',
  PRIMO: 'PRIMO(A)',
  ABUELO: 'ABUELO(A)',
  PAREJA: 'PAREJA',
  ESPOSO: 'ESPOSO(A)',
  HIJO: 'HIJO(A)',
})
export const KINSHIP_LABELS = Object.freeze({
  'PADRE/MADRE': 'Padre / madre',
  'HERMANO(A)': 'Hermano(a)',
  'PRIMO(A)': 'Primo(a)',
  'ABUELO(A)': 'Abuelo(a)',
  PAREJA: 'Pareja',
  'ESPOSO(A)': 'Esposo(a)',
  'HIJO(A)': 'Hijo(a)',
})

export const ROOM_STATUS = Object.freeze({
  DISPONIBLE: 'DISPONIBLE',
  OCUPADA: 'OCUPADA',
  MANTENIMIENTO: 'MANTENIMIENTO/REPARACION',
  LIMPIEZA: 'LIMPIEZA Y DESINFECCION',
  INACTIVA: 'INACTIVA',
})
export const ROOM_STATUS_LABELS = Object.freeze({
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  'MANTENIMIENTO/REPARACION': 'Mantenimiento / reparación',
  'LIMPIEZA Y DESINFECCION': 'Limpieza y desinfección',
  INACTIVA: 'Inactiva',
})

export const BOOKING_STATUS = Object.freeze({
  CONFIRMADA: 'RESERVA CONFIRMADA',
  PENDIENTE: 'RESERVA PENDIENTE DE CONFIRMAR',
  EN_ESTANCIA: 'EN ESTANCIA',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
})
export const BOOKING_STATUS_LABELS = Object.freeze({
  'RESERVA CONFIRMADA': 'Confirmada',
  'RESERVA PENDIENTE DE CONFIRMAR': 'Pendiente de confirmar',
  'EN ESTANCIA': 'En estancia',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
})

export const PAYMENT_METHOD = Object.freeze({
  TARJETA: 'TARJETA CREDITO/DEBITO',
  POS: 'POS',
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
})
export const PAYMENT_METHOD_LABELS = Object.freeze({
  'TARJETA CREDITO/DEBITO': 'Tarjeta de crédito / débito',
  POS: 'POS',
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
})

// Orden de servicio: el cliente la contrata (PENDIENTE) y el cuidador de la sede la completa o se cancela.
export const SERVICE_ORDER_STATUS = Object.freeze({ PENDIENTE: 'PENDIENTE', COMPLETADO: 'COMPLETADO', CANCELADO: 'CANCELADO' })
export const SERVICE_ORDER_STATUS_LABELS = Object.freeze({ PENDIENTE: 'Pendiente', COMPLETADO: 'Completado', CANCELADO: 'Cancelado' })

export const MOVEMENT_TYPE = Object.freeze({ CARGO: 'CARGO', ABONO: 'ABONO', REEMBOLSO: 'REEMBOLSO' })
export const MOVEMENT_TYPE_LABELS = Object.freeze({ CARGO: 'Cargo', ABONO: 'Abono', REEMBOLSO: 'Reembolso' })

export const CHECK_IN_STATUS = Object.freeze({ COMPLETADO: 'COMPLETADO', CANCELADO: 'CANCELADO' })
export const CHECK_IN_STATUS_LABELS = Object.freeze({ COMPLETADO: 'Completado', CANCELADO: 'Cancelado' })

// Solicitud de cancelacion: el cliente la crea y recepcion de la sede la aprueba o rechaza.
export const CANCELLATION_STATUS = Object.freeze({ PENDIENTE: 'PENDIENTE', APROBADA: 'APROBADA', RECHAZADA: 'RECHAZADA' })
export const CANCELLATION_STATUS_LABELS = Object.freeze({ PENDIENTE: 'Pendiente', APROBADA: 'Aprobada', RECHAZADA: 'Rechazada' })

export const SERVICE_TYPE = Object.freeze({ ASEO: 'ASEO', RECREACION: 'RECREACION', ALIMENTACION: 'ALIMENTACION' })
export const SERVICE_TYPE_LABELS = Object.freeze({ ASEO: 'Aseo', RECREACION: 'Recreación', ALIMENTACION: 'Alimentación' })

export const TYPE_TRANSACTION = Object.freeze({ WRITE: 'WRT', READ: 'READ', UPDATE: 'UPD', ERASE: 'ERS' })
export const TYPE_TRANSACTION_LABELS = Object.freeze({ WRT: 'Escritura', READ: 'Lectura', UPD: 'Actualización', ERS: 'Eliminación' })

// Opciones { value, label } para selects.
export const PET_SPECIES_OPTIONS = toOptions(PET_SPECIES, PET_SPECIES_LABELS)
export const SEX_OPTIONS = toOptions(SEX, SEX_LABELS)
export const PET_SIZE_OPTIONS = toOptions(PET_SIZE, PET_SIZE_LABELS)
export const UNIT_MEASURE_WEIGHT_PET_OPTIONS = toOptions(UNIT_MEASURE_WEIGHT_PET, UNIT_MEASURE_WEIGHT_PET_LABELS)
export const VACCINE_USE_OPTIONS = toOptions(VACCINE_USE, VACCINE_USE_LABELS)
export const DIET_TYPE_OPTIONS = toOptions(DIET_TYPE, DIET_TYPE_LABELS)
export const UNIT_MEASURE_SERVING_PET_OPTIONS = toOptions(UNIT_MEASURE_SERVING_PET, UNIT_MEASURE_SERVING_PET_LABELS)
export const KINSHIP_OPTIONS = toOptions(KINSHIP, KINSHIP_LABELS)
export const ROOM_STATUS_OPTIONS = toOptions(ROOM_STATUS, ROOM_STATUS_LABELS)
export const BOOKING_STATUS_OPTIONS = toOptions(BOOKING_STATUS, BOOKING_STATUS_LABELS)
export const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD, PAYMENT_METHOD_LABELS)
// Pagos en mostrador (confirm-payment y check-out) aceptan cualquier metodo menos tarjeta.
export const COUNTER_PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_OPTIONS.filter((o) => o.value !== PAYMENT_METHOD.TARJETA)
export const MOVEMENT_TYPE_OPTIONS = toOptions(MOVEMENT_TYPE, MOVEMENT_TYPE_LABELS)
export const CHECK_IN_STATUS_OPTIONS = toOptions(CHECK_IN_STATUS, CHECK_IN_STATUS_LABELS)
export const SERVICE_TYPE_OPTIONS = toOptions(SERVICE_TYPE, SERVICE_TYPE_LABELS)
export const SERVICE_ORDER_STATUS_OPTIONS = toOptions(SERVICE_ORDER_STATUS, SERVICE_ORDER_STATUS_LABELS)
export const CANCELLATION_STATUS_OPTIONS = toOptions(CANCELLATION_STATUS, CANCELLATION_STATUS_LABELS)
export const TYPE_TRANSACTION_OPTIONS = toOptions(TYPE_TRANSACTION, TYPE_TRANSACTION_LABELS)
