import { CFormSelect } from '@coreui/react'

// Select para enums de la API: options = [{ value, label }] (ver constants/enums.js).
export default function EnumSelect({ name, label, options, error, placeholder = 'Seleccione una opción', className = 'mb-3', ...rest }) {
  return (
    <div className={className}>
      <CFormSelect
        id={name}
        name={name}
        label={label}
        invalid={Boolean(error)}
        feedbackInvalid={error}
        options={[{ value: '', label: placeholder, disabled: true }, ...options]}
        {...rest}
      />
    </div>
  )
}
