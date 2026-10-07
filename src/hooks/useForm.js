import { useState } from 'react'
import { toApiError } from '../api/errors'
import { validate } from '../utils/validators'

// Estado de un formulario con validacion local y errores de la API.
// - rules: { campo: [validadores] } o una funcion (values) => rules para reglas condicionales.
// - fieldMap: traduce el campo que reporta la API (details[].field) al campo del formulario.
// Los errores de un campo se limpian cuando el usuario lo edita.
export default function useForm(initialValues, { rules = {}, fieldMap = {} } = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    // Limpia el error del campo y los anidados (editar `pets` limpia `pets.0.nonadmissionReason`).
    setErrors((current) => {
      const keys = Object.keys(current).filter((key) => current[key] && (key === name || key.startsWith(`${name}.`)))
      if (keys.length === 0) return current
      const next = { ...current }
      keys.forEach((key) => delete next[key])
      return next
    })
  }

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target
    setValue(name, type === 'checkbox' ? checked : value)
  }

  const handleSubmit = (onSubmit) => async (event) => {
    event?.preventDefault()
    const localErrors = validate(values, typeof rules === 'function' ? rules(values) : rules)
    setErrors(localErrors)
    setApiError(null)
    if (Object.keys(localErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      const normalized = toApiError(error)
      const remoteErrors = Object.entries(normalized.fieldErrors).reduce((acc, [field, message]) => {
        const target = fieldMap[field] ?? field
        if (!acc[target]) acc[target] = message
        return acc
      }, {})
      setErrors(remoteErrors)
      setApiError(normalized)
    } finally {
      setSubmitting(false)
    }
  }

  // Carga otros valores (p. ej. el registro a editar) y limpia los errores.
  const reset = (nextValues = initialValues) => {
    setValues(nextValues)
    setErrors({})
    setApiError(null)
  }

  return {
    values,
    setValue,
    reset,
    handleChange,
    handleSubmit,
    submitting,
    apiError,
    fieldError: (name) => errors[name],
  }
}
