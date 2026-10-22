import useForm from '../../hooks/useForm'
import useToast from '../toast/useToast'
import FormModal from '../FormModal'
import FormField from '../FormField'
import { requestBookingCancellation } from '../../api/bookingCancellations'
import { MOVEMENT_TYPE, PAYMENT_METHOD } from '../../constants/enums'
import { maxLength, minLength, required } from '../../utils/validators'
import { formatCurrency } from '../../utils/format'

const FIELDS = ['reason']

const RULES = {
  reason: [
    required('Indique el motivo de la cancelación.'),
    minLength(5, 'Indique el motivo de la cancelacion (minimo 5 caracteres).'),
    maxLength(255, 'El motivo no puede exceder los 255 caracteres.'),
  ],
}

// POST /booking-cancellations. Renderizar con key para reiniciar el formulario.
export default function CancellationRequestModal({ booking, visible, onClose, onRequested }) {
  const toast = useToast()
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm({ reason: '' }, { rules: RULES })

  const payments = (booking?.bill ?? []).filter((movement) => movement.movementType === MOVEMENT_TYPE.ABONO)
  const paid = payments.reduce((sum, movement) => sum + Number(movement.amount), 0)
  const paidByCard = payments.some((movement) => movement.methodPayment === PAYMENT_METHOD.TARJETA)

  const onSubmit = handleSubmit(async (form) => {
    const result = await requestBookingCancellation({ bookingId: booking.id, reason: form.reason.trim() })
    toast.success(result.message)
    onRequested()
    onClose()
  })

  return (
    <FormModal
      visible={visible}
      title={`Solicitar cancelación · Reserva #${booking?.id ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel="Enviar solicitud"
    >
      <p>Recepción de la sede revisará su solicitud. La reserva sigue vigente hasta que la confirmen.</p>
      {paid > 0 && (
        <p className="text-body-secondary">
          Al confirmarse se le reembolsará {formatCurrency(paid)}
          {paidByCard ? ': los pagos con tarjeta se devuelven a la misma tarjeta.' : ' en recepción.'}
        </p>
      )}
      <FormField
        name="reason"
        label="Motivo"
        multiline
        rows={3}
        maxLength={255}
        className="mb-0"
        value={values.reason}
        onChange={handleChange}
        error={fieldError('reason')}
      />
    </FormModal>
  )
}
