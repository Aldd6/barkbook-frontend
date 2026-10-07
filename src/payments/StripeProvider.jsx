import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from './stripe'

// Envuelve un formulario que puede cobrar con tarjeta. Sin publishable key, stripePromise es null:
// Elements lo acepta y useCardPayment informa que la tarjeta no esta disponible.
export default function StripeProvider({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>
}
