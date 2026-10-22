import { CAlert, CFormSelect } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import { generateRoomInventory } from '../../api/rooms'
import { integerBetween, required } from '../../utils/validators'
import { lastConsecutive, roomNumberFor } from './roomInventory'

const FIELDS = ['branchId', 'roomTypeId', 'quantity']
const MAX_PER_REQUEST = 500

// POST /room-inventory/generate: crea en lote las habitaciones de un tipo en una sede,
// hasta el maximumQuantity de su RoomBranch. El back end numera con el prefijo del tipo.
// `archivedRooms` solo sirve para anticipar los numeros: no ocupan cupo pero si numero.
export default function GenerateRoomsModal({ visible, catalog, rooms, archivedRooms = [], onClose, onGenerated }) {
  const toast = useToast()

  // Cupo de la configuracion elegida; igual que el back end, solo cuentan las vigentes.
  const capacityFor = (values) => {
    const roomBranch = catalog?.roomBranches.find(
      (item) => item.branchId === Number(values.branchId) && item.roomTypeId === Number(values.roomTypeId),
    )
    if (!roomBranch) return null
    const existing = rooms.filter((room) => room.roomBranchId === roomBranch.id).length
    return { roomBranch, existing, available: Math.max(roomBranch.maximumQuantity - existing, 0) }
  }

  const { values, handleChange, setValue, handleSubmit, submitting, apiError, fieldError } = useForm(
    { branchId: '', roomTypeId: '', quantity: '1' },
    {
      rules: (current) => {
        const limit = Math.min(MAX_PER_REQUEST, capacityFor(current)?.available ?? MAX_PER_REQUEST)
        return {
          branchId: [required('Seleccione una sede.')],
          roomTypeId: [required('Seleccione un tipo de habitación.')],
          quantity: [
            required('Indique cuántas habitaciones generar.'),
            integerBetween(1, limit, `La cantidad debe ser un número entero entre 1 y ${limit}.`),
          ],
        }
      },
    },
  )

  const branchRoomTypes = (catalog?.roomBranches ?? [])
    .filter((roomBranch) => roomBranch.branchId === Number(values.branchId))
    .map((roomBranch) => catalog.roomTypeById.get(roomBranch.roomTypeId))
    .filter(Boolean)
  const capacity = capacityFor(values)
  const roomType = catalog?.roomTypeById.get(Number(values.roomTypeId))
  const full = capacity?.available === 0

  const quantity = Number(values.quantity)
  const last =
    capacity && roomType
      ? lastConsecutive(
          [...rooms, ...archivedRooms].filter((room) => room.roomBranchId === capacity.roomBranch.id),
          roomType.prefix,
        )
      : 0
  const preview =
    capacity && roomType && Number.isInteger(quantity) && quantity >= 1 && quantity <= capacity.available
      ? [last + 1, last + quantity].map((n) => roomNumberFor(roomType.prefix, n, capacity.roomBranch.maximumQuantity))
      : null

  const onSubmit = handleSubmit(async (form) => {
    if (full) return
    const result = await generateRoomInventory({
      branchId: Number(form.branchId),
      roomTypeId: Number(form.roomTypeId),
      quantity: Number(form.quantity),
    })
    toast.success(result.message)
    onGenerated?.(result.roomInventory)
    onClose()
  })

  return (
    <FormModal
      visible={visible}
      title="Generar habitaciones"
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
      submitLabel="Generar"
    >
      <div className="mb-3">
        <CFormSelect
          id="branchId"
          name="branchId"
          label="Sede"
          value={values.branchId}
          onChange={(event) => {
            handleChange(event)
            setValue('roomTypeId', '')
          }}
          invalid={Boolean(fieldError('branchId'))}
          feedbackInvalid={fieldError('branchId')}
          options={[
            { value: '', label: 'Seleccione una sede', disabled: true },
            ...(catalog?.branches ?? []).map((branch) => ({ value: String(branch.id), label: branch.branchName })),
          ]}
        />
      </div>
      <div className="mb-3">
        <CFormSelect
          id="roomTypeId"
          name="roomTypeId"
          label="Tipo de habitación"
          value={values.roomTypeId}
          onChange={handleChange}
          disabled={!values.branchId}
          invalid={Boolean(fieldError('roomTypeId'))}
          feedbackInvalid={fieldError('roomTypeId')}
          text={values.branchId && branchRoomTypes.length === 0 ? 'Esta sede no tiene tipos de habitación configurados.' : undefined}
          options={[
            { value: '', label: 'Seleccione un tipo', disabled: true },
            ...branchRoomTypes.map((type) => ({ value: String(type.id), label: `${type.name} (${type.prefix})` })),
          ]}
        />
      </div>

      {capacity && (
        <CAlert color={full ? 'warning' : 'light'} className="small">
          {capacity.existing} de {capacity.roomBranch.maximumQuantity} habitaciones generadas para esta sede y tipo.
          {full ? ' No quedan espacios disponibles.' : ` Quedan ${capacity.available} espacio(s).`}
        </CAlert>
      )}

      <FormField
        name="quantity"
        label="Cantidad"
        type="number"
        min={1}
        max={Math.min(MAX_PER_REQUEST, capacity?.available ?? MAX_PER_REQUEST)}
        value={values.quantity}
        onChange={handleChange}
        error={fieldError('quantity')}
        disabled={full}
        helpText={preview && (preview[0] === preview[1] ? `Se creará la habitación ${preview[0]}.` : `Se crearán de ${preview[0]} a ${preview[1]}.`)}
      />
    </FormModal>
  )
}
