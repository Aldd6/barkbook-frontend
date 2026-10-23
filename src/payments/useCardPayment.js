import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { ApiError, ERROR_FLAGS } from '../api/errors'
import { isStripeConfigured } from './stripe'

const paymentError = (message) => new ApiError({ status: 402, flag: ERROR_FLAGS.PAYMENT_FAILED, message })

export default function useCardPayment() {
  const stripe = useStripe()
  const elements = useElements()

  const createPaymentMethodId = async () => {
    if (!isStripeConfigured) throw paymentError('El pago con tarjeta no está disponible en este momento.')
    if (!stripe || !elements) throw paymentError('El formulario de pago aún se está cargando. Intente de nuevo.')

    const card = elements.getElement(CardElement)
    const { paymentMethod, error } = await stripe.createPaymentMethod({ type: 'card', card })
    if (error) throw paymentError(error.message)
    return paymentMethod.id
  }

  return { createPaymentMethodId }
}
