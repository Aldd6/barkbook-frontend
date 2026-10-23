
export const ERROR_FLAGS = Object.freeze({
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
})

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifique su conexion e intente de nuevo.'
const GENERIC_ERROR_MESSAGE = 'Ocurrio un error inesperado. Intente de nuevo.'

export class ApiError extends Error {
  constructor({ status = 0, flag = null, message, details = [] }) {
    super(message || GENERIC_ERROR_MESSAGE)
    this.name = 'ApiError'
    this.status = status
    this.flag = flag
    this.details = details
    this.fieldErrors = details.reduce((acc, { field, message: fieldMessage }) => {
      if (field && !acc[field]) acc[field] = fieldMessage
      return acc
    }, {})
  }

  get isValidation() {
    return this.details.length > 0
  }
}

export const toApiError = (error) => {
  if (error instanceof ApiError) return error

  const response = error?.response
  if (!response) {
    return new ApiError({ message: error?.request ? NETWORK_ERROR_MESSAGE : error?.message })
  }

  const data = response.data ?? {}
  return new ApiError({
    status: data.status ?? response.status,
    flag: data.flag ?? null,
    message: data.message,
    details: Array.isArray(data.details) ? data.details : [],
  })
}

export const getFieldError = (error, field) => error?.fieldErrors?.[field]
