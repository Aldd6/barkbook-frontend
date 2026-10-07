import { maxLength, required } from '../../utils/validators'

// Pago en mostrador (confirm-payment y payment del check-out): cualquier metodo menos tarjeta.
export const COUNTER_PAYMENT_FIELDS = ['methodPayment', 'reference', 'description']

export const counterPaymentRules = {
  methodPayment: [required('Seleccione el método de pago.')],
  reference: [maxLength(150, 'La referencia no puede exceder los 150 caracteres.')],
  description: [maxLength(255, 'La descripcion no puede exceder los 255 caracteres.')],
}

export const emptyCounterPayment = { methodPayment: '', reference: '', description: '' }

// Los opcionales vacios no se envian.
export const toCounterPayment = (values) => {
  const payment = { methodPayment: values.methodPayment }
  if (values.reference.trim()) payment.reference = values.reference.trim()
  if (values.description.trim()) payment.description = values.description.trim()
  return payment
}
