import { CCol, CRow } from '@coreui/react'
import EnumSelect from '../EnumSelect'
import FormField from '../FormField'
import { COUNTER_PAYMENT_METHOD_OPTIONS } from '../../constants/enums'

// Campos de pago en mostrador (metodo, referencia, descripcion). Reglas y payload en counterPayment.js.
export default function CounterPaymentFields({ values, handleChange, fieldError }) {
  return (
    <CRow>
      <CCol md={6}>
        <EnumSelect
          name="methodPayment"
          label="Método de pago"
          options={COUNTER_PAYMENT_METHOD_OPTIONS}
          value={values.methodPayment}
          onChange={handleChange}
          error={fieldError('methodPayment')}
        />
      </CCol>
      <CCol md={6}>
        <FormField
          name="reference"
          label="Referencia (opcional)"
          helpText="Número de autorización POS o de transferencia."
          value={values.reference}
          onChange={handleChange}
          error={fieldError('reference')}
        />
      </CCol>
      <CCol xs={12}>
        <FormField name="description" label="Descripción (opcional)" value={values.description} onChange={handleChange} error={fieldError('description')} />
      </CCol>
    </CRow>
  )
}
