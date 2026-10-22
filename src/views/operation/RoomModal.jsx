import { CAlert, CButton, CForm, CFormSwitch, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import EnumSelect from '../../components/EnumSelect'
import StatusBadge from '../../components/StatusBadge'
import { describeRoomBranch } from '../../hooks/useRoomCatalog'
import { updateRoomInventory } from '../../api/rooms'
import { ROOM_STATUS, ROOM_STATUS_OPTIONS } from '../../constants/enums'
import { required } from '../../utils/validators'
import { MANUAL_ROOM_STATUS_OPTIONS } from './roomInventory'

const FIELDS = ['status', 'active']

// Detalle de una habitacion fisica: cambiar estado y habilitarla (PUT /room-inventory/:id)
// o archivarla (DELETE, lo confirma el padre con onArchive).
// Renderizar con key={room?.id} para que el formulario se reinicie con cada habitacion.
export default function RoomModal({ room, catalog, canUpdate, canArchive, onClose, onSaved, onArchive }) {
  const toast = useToast()
  const { values, handleChange, setValue, handleSubmit, submitting, apiError, fieldError } = useForm(
    { status: room?.status ?? '', active: room?.active ?? true },
    { rules: { status: [required('Seleccione un estado.')] } },
  )

  const occupied = room?.status === ROOM_STATUS.OCUPADA
  const { branch, roomType } = describeRoomBranch(catalog, room?.roomBranchId)

  const onSubmit = handleSubmit(async (form) => {
    const changes = {}
    if (form.status !== room.status) changes.status = form.status
    if (form.active !== room.active) changes.active = form.active
    if (Object.keys(changes).length === 0) return onClose()

    const result = await updateRoomInventory(room.id, changes)
    toast.success(result.message)
    onSaved?.(result.roomInventory)
    onClose()
  })

  return (
    <CModal visible={Boolean(room)} onClose={onClose} alignment="center" backdrop={submitting ? 'static' : true}>
      <CForm onSubmit={onSubmit} noValidate>
        <CModalHeader closeButton={!submitting}>
          <CModalTitle>Habitación {room?.roomNumber}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ApiErrorAlert error={apiError} fields={FIELDS} />
          <dl className="row mb-3">
            <dt className="col-5">Sede</dt>
            <dd className="col-7">{branch?.branchName ?? '—'}</dd>
            <dt className="col-5">Tipo</dt>
            <dd className="col-7">{roomType?.name ?? '—'}</dd>
            <dt className="col-5">Estado actual</dt>
            <dd className="col-7 mb-0">{room && <StatusBadge status={room.status} />}</dd>
          </dl>

          {canUpdate ? (
            <>
              {occupied && (
                <CAlert color="info" className="small">
                  La habitación está ocupada. Su estado cambia automáticamente con el check-out de la estancia.
                </CAlert>
              )}
              <EnumSelect
                name="status"
                label="Nuevo estado"
                options={occupied ? ROOM_STATUS_OPTIONS : MANUAL_ROOM_STATUS_OPTIONS}
                value={values.status}
                onChange={handleChange}
                error={fieldError('status')}
                disabled={occupied || submitting}
              />
              <CFormSwitch
                id="active"
                label="Habilitada para check-in"
                checked={values.active}
                onChange={(event) => setValue('active', event.target.checked)}
                disabled={submitting}
              />
              <div className="form-text">Una habitación deshabilitada no se ofrece en el check-in aunque esté disponible.</div>
            </>
          ) : (
            <p className="text-body-secondary small mb-0">Su rol no puede cambiar el estado de las habitaciones.</p>
          )}
        </CModalBody>
        <CModalFooter>
          {canArchive && !occupied && (
            <CButton color="danger" variant="ghost" className="me-auto" onClick={() => onArchive(room)} disabled={submitting}>
              Archivar
            </CButton>
          )}
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={submitting}>
            {canUpdate ? 'Cancelar' : 'Cerrar'}
          </CButton>
          {canUpdate && (
            <CButton type="submit" color="primary" disabled={submitting}>
              {submitting && <CSpinner size="sm" className="me-2" />}
              Guardar
            </CButton>
          )}
        </CModalFooter>
      </CForm>
    </CModal>
  )
}
