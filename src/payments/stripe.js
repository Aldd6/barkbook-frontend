import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Sin publishable key, el pago con tarjeta se deshabilita en la UI (no se simula).
export const isStripeConfigured = Boolean(publishableKey)

// loadStripe se llama una sola vez fuera de los componentes, como recomienda Stripe.
export const stripePromise = isStripeConfigured ? loadStripe(publishableKey, { locale: 'es' }) : null
