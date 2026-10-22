import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import RoomBranchModal from './RoomBranchModal'
import { deleteRoomBranch, getRoomInventory } from '../../api/rooms'
import { toApiError } from '../../api/errors'
import { PET_SPECIES_LABELS } from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { formatCurrency } from '../../utils/format'

// Que tipos de habitacion ofrece cada sede y cuantas unidades (P: Gestionar habitaciones por sede).
// Es lo que reserva el cliente (branchRoomId) y el cupo de la generacion de habitaciones fisicas.
export default function RoomBranches() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const catalog = useRoomCatalog()
  const rooms = useApiQuery(getRoomInventory)
  const [branchFilter, setBranchFilter] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = cerrado, null = nueva
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const canGenerate = hasPermission(PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS)

  // Habitaciones vigentes por configuracion (GET /room-inventory no trae las archivadas).
  const countByRoomBranch = (rooms.data ?? []).reduce((acc, room) => acc.set(room.roomBranchId, (acc.get(room.roomBranchId) ?? 0) + 1), new Map())
  const generatedCount = (roomBranchId) => countByRoomBranch.get(roomBranchId) ?? 0

  const reloadAll = () => {
    catalog.reload()
    rooms.reload()
  }

  const branches = (catalog.data?.branches ?? []).filter((branch) => !branchFilter || branch.id === Number(branchFilter))
  const groups = branches.map((branch) => ({
    branch,
    items: (catalog.data?.roomBranches ?? [])
      .filter((roomBranch) => roomBranch.branchId === branch.id)
      .map((roomBranch) => ({ roomBranch, roomType: catalog.data.roomTypeById.get(roomBranch.roomTypeId) }))
      .sort((a, b) => (a.roomType?.name ?? '').localeCompare(b.roomType?.name ?? '')),
  }))

  const closeDelete = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { message } = await deleteRoomBranch(toDelete.roomBranch.id)
      toast.success(message)
      closeDelete()
      reloadAll()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  const noCatalog = catalog.data && (catalog.data.branches.length === 0 || catalog.data.roomTypes.length === 0)

  return (
    <>
      <PageHeader
        title="Habitaciones por sede"
        subtitle="Asigne a cada sede los tipos de habitación que ofrece y cuántas unidades puede tener de cada uno."
        actions={
          <>
            {canGenerate && (
              <CButton color="primary" variant="outline" as={Link} to="/operacion/habitaciones">
                Generar habitaciones
              </CButton>
            )}
            <CButton color="primary" onClick={() => setEditing(null)} disabled={!catalog.data || noCatalog}>
              <CIcon icon={cilPlus} className="me-1" />
              Asignar tipo
            </CButton>
          </>
        }
      />
      {rooms.error && <ApiErrorAlert error={rooms.error} />}
      <QueryState query={catalog}>
        {noCatalog ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">
              Primero registre al menos una sede y un tipo de habitación.
            </CCardBody>
          </CCard>
        ) : (
          <>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormSelect
                  label="Sede"
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  options={[
                    { value: '', label: 'Todas las sedes' },
                    ...(catalog.data?.branches ?? []).map((branch) => ({ value: String(branch.id), label: branch.branchName })),
                  ]}
                />
              </CCol>
            </CRow>

            {groups.map(({ branch, items }) => (
              <CCard key={branch.id} className="mb-4">
                <CCardHeader className="fw-semibold">{branch.branchName}</CCardHeader>
                {items.length === 0 ? (
                  <CCardBody className="text-body-secondary small">Esta sede aún no ofrece ningún tipo de habitación.</CCardBody>
                ) : (
                  <CCardBody className="p-0">
                    <CTable hover responsive align="middle" className="mb-0">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Tipo</CTableHeaderCell>
                          <CTableHeaderCell>Especie</CTableHeaderCell>
                          <CTableHeaderCell>Tarifa por noche</CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '12rem' }}>Generadas / cupo</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {items.map(({ roomBranch, roomType }) => {
                          const generated = generatedCount(roomBranch.id)
                          const percent = Math.min(100, Math.round((generated / roomBranch.maximumQuantity) * 100))
                          return (
                            <CTableRow key={roomBranch.id}>
                              <CTableDataCell>
                                <span className="fw-semibold">{roomType?.name ?? `Tipo #${roomBranch.roomTypeId}`}</span>
                                {roomType && (
                                  <CBadge color="light" textColor="dark" className="ms-2">
                                    {roomType.prefix}
                                  </CBadge>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>{roomType ? PET_SPECIES_LABELS[roomType.speciesType] : '—'}</CTableDataCell>
                              <CTableDataCell className="text-nowrap">{roomType ? formatCurrency(roomType.nightlyRate) : '—'}</CTableDataCell>
                              <CTableDataCell>
                                <div className="small mb-1">
                                  {rooms.data ? generated : '…'} de {roomBranch.maximumQuantity}
                                </div>
                                <CProgress thin value={percent} color={percent >= 100 ? 'success' : 'primary'} />
                              </CTableDataCell>
                              <CTableDataCell className="text-end text-nowrap">
                                <CButton
                                  color="primary"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditing(roomBranch)}
                                  disabled={!rooms.data}
                                  aria-label={`Editar cupo de ${roomType?.name ?? 'tipo'}`}
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                                <CButton
                                  color="danger"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setToDelete({ roomBranch, roomType, branch })}
                                  aria-label={`Archivar ${roomType?.name ?? 'tipo'} en ${branch.branchName}`}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </CCardBody>
                )}
              </CCard>
            ))}
          </>
        )}
      </QueryState>

      <RoomBranchModal
        key={editing === null ? 'new' : (editing?.id ?? 'closed')}
        roomBranch={editing}
        catalog={catalog.data}
        defaultBranchId={branchFilter}
        generatedCount={generatedCount}
        onClose={() => setEditing(undefined)}
        onSaved={reloadAll}
      />

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar configuración"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        <p className="mb-0">
          ¿Desea que <strong>{toDelete?.branch.branchName}</strong> deje de ofrecer <strong>{toDelete?.roomType?.name ?? 'este tipo'}</strong>?
        </p>
        {toDelete && generatedCount(toDelete.roomBranch.id) > 0 && (
          <p className="small text-body-secondary mt-2 mb-0">
            Tiene {generatedCount(toDelete.roomBranch.id)} habitación(es) física(s) generada(s); no se archivan junto con la configuración.
          </p>
        )}
      </ConfirmModal>
    </>
  )
}
