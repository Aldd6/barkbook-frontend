import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import { approveBookingCancellation, rejectBookingCancellation } from '../../api/bookingCancellations'
import { MOVEMENT_TYPE, PAYMENT_METHOD, PAYMENT_METHOD_LABELS } from '../../constants/enums'
import { maxLength, minLength, required } from '../../utils/validators'
import { formatCurrency } from '../../utils/format'

const FIELDS = ['resolutionNotes']

const rulesFor = (approving) => ({
  resolutionNotes: approving
    ? [maxLength(255, 'Las notas no pueden exceder los 255 caracteres.')]
    : [
        required('Indique el motivo del rechazo.'),
        minLength(5, 'Indique el motivo del rechazo (minimo 5 caracteres).'),
        maxLength(255, 'Las notas no pueden exceder los 255 caracteres.'),
      ],
})

export default function ResolveCancellationModal({ action, onClose, onResolved }) {
  const toast = useToast()
  const approving = action?.approve ?? false
  const cancellation = action?.cancellation
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm({ resolutionNotes: '' }, { rules: rulesFor(approving) })

  const payments = (cancellation?.booking?.bill ?? []).filter((movement) => movement.movementType === MOVEMENT_TYPE.ABONO)
  const cardTotal = payments.filter((m) => m.methodPayment === PAYMENT_METHOD.TARJETA).reduce((sum, m) => sum + Number(m.amount), 0)
  const counterPayments = payments.filter((m) => m.methodPayment !== PAYMENT_METHOD.TARJETA)

  const onSubmit = handleSubmit(async (form) => {
    const notes = form.resolutionNotes.trim()
    const result = approving
      ? await approveBookingCancellation(cancellation.id, notes ? { resolutionNotes: notes } : {})
      : await rejectBookingCancellation(cancellation.id, { resolutionNotes: notes })
    toast.success(result.message)
    onResolved()
    onClose()
  })

  return (
    <FormModal
      visible={Boolean(action)}
      title={`${approving ? 'Confirmar' : 'Rechazar'} cancelación · Reserva #${cancellation?.bookingId ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel={approving ? 'Confirmar cancelación' : 'Rechazar solicitud'}
    >
      <p>
        Motivo del cliente: <em>{cancellation?.reason}</em>
      </p>
      {approving &&
        (payments.length === 0 ? (
          <p className="text-body-secondary">La reserva no tiene pagos registrados; no hay nada que reembolsar.</p>
        ) : (
          <ul className="text-body-secondary">
            {cardTotal > 0 && <li>{formatCurrency(cardTotal)} se reembolsarán automáticamente a la tarjeta del cliente.</li>}
            {counterPayments.map((payment) => (
              <li key={payment.id}>
                Devuelva {formatCurrency(payment.amount)} al cliente en mostrador ({PAYMENT_METHOD_LABELS[payment.methodPayment]}).
              </li>
            ))}
          </ul>
        ))}
      <FormField
        name="resolutionNotes"
        label={approving ? 'Notas (opcional)' : 'Motivo del rechazo'}
        helpText={approving ? undefined : 'El cliente verá este motivo en el detalle de su reserva.'}
        multiline
        rows={2}
        maxLength={255}
        className="mb-0"
        value={values.resolutionNotes}
        onChange={handleChange}
        error={fieldError('resolutionNotes')}
      />
    </FormModal>
  )
}
