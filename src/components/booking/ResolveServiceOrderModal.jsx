import useForm from '../../hooks/useForm'
import useToast from '../toast/useToast'
import FormModal from '../FormModal'
import FormField from '../FormField'
import { cancelServiceOrder, completeServiceOrder } from '../../api/serviceOrders'
import { maxLength, minLength, required } from '../../utils/validators'
import { formatCurrency } from '../../utils/format'

const FIELDS = ['resolutionNotes']

const rulesFor = (completing) => ({
  resolutionNotes: completing
    ? [maxLength(255, 'Las notas no pueden exceder los 255 caracteres.')]
    : [
        required('Indique el motivo de la cancelación.'),
        minLength(5, 'Indique el motivo de la cancelacion (minimo 5 caracteres).'),
        maxLength(255, 'Las notas no pueden exceder los 255 caracteres.'),
      ],
})

// PATCH /service-orders/:id/complete (informe opcional) o /cancel (motivo obligatorio).
// `action`: { order, complete: boolean } o null (cerrado). Renderizar con key para reiniciar.
export default function ResolveServiceOrderModal({ action, onClose, onResolved }) {
  const toast = useToast()
  const completing = action?.complete ?? false
  const order = action?.order
  const { values, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm({ resolutionNotes: '' }, { rules: rulesFor(completing) })

  const onSubmit = handleSubmit(async (form) => {
    const notes = form.resolutionNotes.trim()
    const result = completing
      ? await completeServiceOrder(order.id, notes ? { resolutionNotes: notes } : {})
      : await cancelServiceOrder(order.id, { resolutionNotes: notes })
    toast.success(result.message)
    onResolved(result)
    onClose()
  })

  const petNames = order?.pets.map((pet) => pet.name).join(', ')

  return (
    <FormModal
      visible={Boolean(action)}
      title={`${completing ? 'Completar' : 'Cancelar'} servicio · Orden #${order?.id ?? ''}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel={completing ? 'Marcar como completado' : 'Cancelar servicio'}
    >
      <p>
        <strong>{order?.service?.name}</strong>
        {petNames && <> para {petNames}</>} · Reserva #{order?.bookingId} · {formatCurrency(order?.amount)}
      </p>
      {order?.description && (
        <p>
          Indicaciones del cliente: <em>{order.description}</em>
        </p>
      )}
      <p className="text-body-secondary">
        {completing
          ? `Se cargarán ${formatCurrency(order?.amount)} a la cuenta de la reserva.`
          : 'La orden aún no se ha cargado a la cuenta, así que no se genera ningún cobro.'}
      </p>
      <FormField
        name="resolutionNotes"
        label={completing ? 'Informe (opcional)' : 'Motivo de la cancelación'}
        multiline
        rows={3}
        maxLength={255}
        className="mb-0"
        value={values.resolutionNotes}
        onChange={handleChange}
        error={fieldError('resolutionNotes')}
      />
    </FormModal>
  )
}
