import { CFormInput, CFormTextarea } from '@coreui/react'

// Input con etiqueta y mensaje de error debajo del campo (error local o details[] de la API).
export default function FormField({ name, label, error, helpText, multiline = false, className = 'mb-3', ...rest }) {
  const Input = multiline ? CFormTextarea : CFormInput
  return (
    <div className={className}>
      <Input
        id={name}
        name={name}
        label={label}
        invalid={Boolean(error)}
        feedbackInvalid={error}
        text={helpText}
        {...rest}
      />
    </div>
  )
}
