import { CardElement } from '@stripe/react-stripe-js'
import { CAlert } from '@coreui/react'
import { isStripeConfigured } from './stripe'

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: { fontSize: '16px', color: '#2b1608', '::placeholder': { color: '#8a7565' } },
    invalid: { color: '#e55353' },
  },
}

// Campo de tarjeta de Stripe. Los datos de la tarjeta nunca pasan por nuestro back end:
// Stripe devuelve un PaymentMethod id que se envia como stripePaymentMethodId.
export default function CardField({ error }) {
  if (!isStripeConfigured) {
    return (
      <CAlert color="warning" className="mb-3">
        El pago con tarjeta no está disponible: falta configurar VITE_STRIPE_PUBLISHABLE_KEY.
      </CAlert>
    )
  }

  return (
    <div className="mb-3">
      <label className="form-label">Datos de la tarjeta</label>
      <div className={`form-control stripe-card-field ${error ? 'is-invalid' : ''}`}>
        <CardElement options={CARD_OPTIONS} />
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  )
}
