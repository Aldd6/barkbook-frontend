import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const isStripeConfigured = Boolean(publishableKey)

export const stripePromise = isStripeConfigured ? loadStripe(publishableKey, { locale: 'es' }) : null
