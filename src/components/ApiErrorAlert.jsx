import { CAlert } from '@coreui/react'
import { ERROR_FLAGS } from '../api/errors'

// Muestra el message de la API tal como viene.
// Si se pasan `fields` (los campos que el formulario muestra), lista aparte los details[]
// que no tienen un campo visible donde mostrarse.
export default function ApiErrorAlert({ error, fields, className = '' }) {
  if (!error) return null

  const color = error.flag === ERROR_FLAGS.RESOURCE_CONFLICT || error.flag === ERROR_FLAGS.PAYMENT_FAILED ? 'warning' : 'danger'
  const unmapped = fields ? (error.details ?? []).filter((detail) => !fields.includes(detail.field)) : []

  return (
    <CAlert color={color} className={className}>
      <div>{error.message}</div>
      {unmapped.length > 0 && (
        <ul className="mb-0 mt-2">
          {unmapped.map((detail) => (
            <li key={`${detail.field}-${detail.message}`}>{detail.message}</li>
          ))}
        </ul>
      )}
    </CAlert>
  )
}
