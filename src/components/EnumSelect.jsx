import { CFormSelect } from '@coreui/react'

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
