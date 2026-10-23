import { CAlert } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import { createRoomBranch, updateRoomBranch } from '../../api/rooms'
import { PET_SPECIES_LABELS } from '../../constants/enums'
import { integerBetween, required } from '../../utils/validators'

const FIELDS = ['branchId', 'roomTypeId', 'maximumQuantity']

export default function RoomBranchModal({ roomBranch, catalog, defaultBranchId = '', generatedCount, onClose, onSaved }) {
  const toast = useToast()
  const isNew = roomBranch === null
  const generated = roomBranch ? generatedCount(roomBranch.id) : 0
  const minimum = Math.max(generated, 1)

  const { values, setValue, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(
    {
      branchId: roomBranch ? String(roomBranch.branchId) : defaultBranchId,
      roomTypeId: roomBranch ? String(roomBranch.roomTypeId) : '',
      maximumQuantity: roomBranch ? String(roomBranch.maximumQuantity) : '',
    },
    {
      rules: {
        branchId: isNew ? [required('Seleccione una sede.')] : [],
        roomTypeId: isNew ? [required('Seleccione un tipo de habitación.')] : [],
        maximumQuantity: [
          required('Indique cuántas habitaciones de este tipo tendrá la sede.'),
          integerBetween(
            minimum,
            undefined,
            generated > 0
              ? `Ya hay ${generated} habitaciones generadas: el cupo debe ser un número entero de al menos ${generated}.`
              : 'La cantidad maxima debe ser un numero entero mayor o igual a 1.',
          ),
        ],
      },
    },
  )

  const takenTypeIds = new Set(
    (catalog?.roomBranches ?? []).filter((item) => item.branchId === Number(values.branchId)).map((item) => item.roomTypeId),
  )
  const branchOptions = (catalog?.branches ?? []).map((branch) => ({ value: String(branch.id), label: branch.branchName }))
  const roomTypeOptions = (catalog?.roomTypes ?? [])
    .filter((roomType) => !takenTypeIds.has(roomType.id))
    .map((roomType) => ({ value: String(roomType.id), label: `${roomType.name} (${roomType.prefix}) · ${PET_SPECIES_LABELS[roomType.speciesType]}` }))
  const noTypesLeft = isNew && values.branchId && roomTypeOptions.length === 0

  const branch = roomBranch && catalog?.branchById.get(roomBranch.branchId)
  const roomType = roomBranch && catalog?.roomTypeById.get(roomBranch.roomTypeId)

  const onSubmit = handleSubmit(async (form) => {
    const maximumQuantity = Number(form.maximumQuantity)
    const result = isNew
      ? await createRoomBranch({ branchId: Number(form.branchId), roomTypeId: Number(form.roomTypeId), maximumQuantity })
      : await updateRoomBranch(roomBranch.id, { maximumQuantity })
    toast.success(result.message)
    onSaved()
    onClose()
  })

  return (
    <FormModal
      visible={roomBranch !== undefined}
      title={isNew ? 'Asignar tipo de habitación a una sede' : 'Editar cupo'}
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      apiError={apiError}
      fields={FIELDS}
    >
      {isNew ? (
        <>
          <EnumSelect
            name="branchId"
            label="Sede"
            placeholder="Seleccione una sede"
            options={branchOptions}
            value={values.branchId}
            onChange={(event) => {
              setValue('branchId', event.target.value)
              setValue('roomTypeId', '')
            }}
            error={fieldError('branchId')}
          />
          {noTypesLeft ? (
            <CAlert color="info" className="small">
              Esta sede ya tiene todos los tipos de habitación. Para cambiar un cupo, edite su configuración.
            </CAlert>
          ) : (
            <EnumSelect
              name="roomTypeId"
              label="Tipo de habitación"
              placeholder="Seleccione un tipo"
              options={roomTypeOptions}
              value={values.roomTypeId}
              onChange={handleChange}
              error={fieldError('roomTypeId')}
              disabled={!values.branchId}
            />
          )}
        </>
      ) : (
        <dl className="row mb-3">
          <dt className="col-5">Sede</dt>
          <dd className="col-7">{branch?.branchName ?? '—'}</dd>
          <dt className="col-5">Tipo</dt>
          <dd className="col-7">{roomType ? `${roomType.name} (${roomType.prefix})` : '—'}</dd>
          <dt className="col-5">Generadas</dt>
          <dd className="col-7 mb-0">{generated}</dd>
        </dl>
      )}
      <FormField
        name="maximumQuantity"
        type="number"
        step="1"
        min={minimum}
        label="Cupo máximo de habitaciones"
        helpText="Cuántas habitaciones físicas de este tipo puede tener la sede. Las archivadas no cuentan."
        value={values.maximumQuantity}
        onChange={handleChange}
        error={fieldError('maximumQuantity')}
      />
    </FormModal>
  )
}
