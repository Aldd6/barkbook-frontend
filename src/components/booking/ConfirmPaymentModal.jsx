import useForm from '../../hooks/useForm'
import useToast from '../toast/useToast'
import FormModal from '../FormModal'
import CounterPaymentFields from './CounterPaymentFields'
import { COUNTER_PAYMENT_FIELDS, counterPaymentRules, emptyCounterPayment, toCounterPayment } from './counterPayment'
import { confirmBookingPayment } from '../../api/bookings'
import { formatCurrency } from '../../utils/format'

export default function ConfirmPaymentModal({ booking, onClose, onPaid }) {
  const toast = useToast()
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(emptyCounterPayment, {
    rules: counterPaymentRules,
  })

  const onSubmit = handleSubmit(async (form) => {
    const result = await confirmBookingPayment(booking.id, toCounterPayment(form))
    toast.success(result.message)
    onPaid?.(result.booking)
    onClose()
  })

  return (
    <FormModal
      visible={Boolean(booking)}
      title={`Registrar pago · Reserva #${booking?.id ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={COUNTER_PAYMENT_FIELDS}
      submitLabel="Registrar pago"
    >
      <p>
        Saldo a cobrar: <strong>{formatCurrency(booking?.balance)}</strong>
      </p>
      <CounterPaymentFields values={values} handleChange={handleChange} fieldError={fieldError} />
    </FormModal>
  )
}
