
export const PHONE_REGEX = /^\+502\d{8}$/
export const DPI_REGEX = /^\d{13}$/
export const NIT_REGEX = /^[0-9]{1,10}-?[0-9Kk]$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const USERNAME_REGEX = /^[A-Za-z0-9]+$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === ''

export const required = (message = 'Este campo es obligatorio.') => (value) => (isEmpty(value) ? message : null)

export const phone = (value) =>
  isEmpty(value) || PHONE_REGEX.test(String(value).trim())
    ? null
    : 'El numero de telefono debe tener el formato +502 seguido de 8 digitos.'

export const dpi = (value) =>
  isEmpty(value) || DPI_REGEX.test(String(value).trim()) ? null : 'El DPI debe contener exactamente 13 digitos numericos.'

export const nit = (value) =>
  isEmpty(value) || NIT_REGEX.test(String(value).trim()) ? null : 'El formato del NIT no es valido.'

export const username = (value) => {
  if (isEmpty(value)) return null
  const text = String(value).trim()
  if (text.length < 3 || text.length > 50) return 'El nombre de usuario debe tener entre 3 y 50 caracteres.'
  return USERNAME_REGEX.test(text) ? null : 'El nombre de usuario debe contener unicamente numeros y letras.'
}

export const email = (value) => {
  if (isEmpty(value)) return null
  const text = String(value).trim()
  if (text.length < 5 || text.length > 254) return 'El correo electronico debe tener entre 5 y 254 caracteres.'
  return EMAIL_REGEX.test(text) ? null : 'El correo electronico no es valido.'
}

export const isValidDate = (value) => {
  if (!DATE_REGEX.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export const date = (value) => (isEmpty(value) || isValidDate(String(value)) ? null : 'La fecha debe tener el formato YYYY-MM-DD.')

export const notFuture = (message) => (value) => {
  if (isEmpty(value) || !isValidDate(String(value))) return null
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return String(value) > today ? message : null
}

export const positiveNumber = (message = 'Debe ser un numero mayor a 0.') => (value) =>
  isEmpty(value) || (Number.isFinite(Number(value)) && Number(value) > 0) ? null : message

export const integerBetween = (min, max, message) => (value) => {
  if (isEmpty(value)) return null
  const number = Number(value)
  return Number.isInteger(number) && number >= min && (max === undefined || number <= max)
    ? null
    : message ?? `Debe ser un numero entero entre ${min} y ${max}.`
}

export const maxLength =(max, message) => (value) =>
  isEmpty(value) || String(value).trim().length <= max ? null : message ?? `No puede exceder los ${max} caracteres.`

export const minLength = (min, message) => (value) =>
  isEmpty(value) || String(value).trim().length >= min ? null : message ?? `Debe tener al menos ${min} caracteres.`

export const validate = (values, rules) =>
  Object.entries(rules).reduce((errors, [field, validators]) => {
    for (const validator of validators) {
      const message = validator(values[field], values)
      if (message) {
        errors[field] = message
        break
      }
    }
    return errors
  }, {})
