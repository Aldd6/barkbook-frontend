import { useCallback, useState } from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow, CSpinner } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import StatusBadge from '../../components/StatusBadge'
import { statusColor } from '../../components/statusColors'
import RoomModal from './RoomModal'
import GenerateRoomsModal from './GenerateRoomsModal'
import ArchivedRoomsModal from './ArchivedRoomsModal'
import { archiveRoomInventory, getArchivedRoomInventory, getRoomInventory, updateRoomInventory } from '../../api/rooms'
import { toApiError } from '../../api/errors'
import { ROOM_STATUS, ROOM_STATUS_LABELS } from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { ROOM_STATUS_ORDER, groupRooms } from './roomInventory'

const EMPTY_FILTERS = { branchId: '', roomTypeId: '', status: '', search: '' }

// Tablero de habitaciones fisicas por sede y tipo. Quien tiene "Actualizar estado de habitaciones"
// cambia estados (p. ej. LIMPIEZA -> DISPONIBLE tras el check-out); "Gestionar habitaciones fisicas"
// genera, archiva y restaura habitaciones.
export default function Rooms() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const rooms = useApiQuery(getRoomInventory)
  const catalog = useRoomCatalog()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [toArchive, setToArchive] = useState(null)
  const [archiving, setArchiving] = useState(false)
  const [releasingId, setReleasingId] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const canUpdate = hasPermission(PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES)
  const canManage = hasPermission(PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS)

  // El listado de archivadas exige "Gestionar habitaciones fisicas"; sin el no se pide.
  const archived = useApiQuery(useCallback(() => (canManage ? getArchivedRoomInventory() : Promise.resolve([])), [canManage]))
  const reloadAll = () => {
    rooms.reload()
    archived.reload()
  }

  const allRooms = rooms.data ?? []
  const roomBranchOf = (room) => catalog.data?.roomBranchById.get(room.roomBranchId)

  // Sede, tipo y busqueda definen el alcance; las tarjetas de resumen cuentan sobre el.
  const inScope = allRooms.filter((room) => {
    const roomBranch = roomBranchOf(room)
    if (filters.branchId && roomBranch?.branchId !== Number(filters.branchId)) return false
    if (filters.roomTypeId && roomBranch?.roomTypeId !== Number(filters.roomTypeId)) return false
    const search = filters.search.trim().toLowerCase()
    return !search || room.roomNumber.toLowerCase().includes(search)
  })
  const countByStatus = Object.fromEntries(ROOM_STATUS_ORDER.map((status) => [status, inScope.filter((room) => room.status === status).length]))
  const visible = filters.status ? inScope.filter((room) => room.status === filters.status) : inScope
  const groups = groupRooms(visible, catalog.data)

  const setFilter = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }))
  const toggleStatus = (status) => setFilters((current) => ({ ...current, status: current.status === status ? '' : status }))

  // Accion rapida del Operador: la habitacion ya se limpio y vuelve a estar disponible.
  const markAvailable = async (room) => {
    setReleasingId(room.id)
    try {
      const result = await updateRoomInventory(room.id, { status: ROOM_STATUS.DISPONIBLE })
      toast.success(result.message)
      rooms.reload()
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setReleasingId(null)
    }
  }

  const archive = async () => {
    setArchiving(true)
    try {
      const result = await archiveRoomInventory(toArchive.id)
      toast.success(result.message)
      setToArchive(null)
      reloadAll()
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Habitaciones"
        subtitle="Estado de las habitaciones físicas de cada sede."
        actions={
          canManage && (
            <>
              <CButton color="primary" variant="outline" onClick={() => setShowArchived(true)}>
                Archivadas
                {archived.data?.length > 0 && (
                  <CBadge color="secondary" className="ms-2">
                    {archived.data.length}
                  </CBadge>
                )}
              </CButton>
              <CButton color="primary" onClick={() => setGenerating(true)} disabled={!catalog.data}>
                Generar habitaciones
              </CButton>
            </>
          )
        }
      />

      <QueryState query={rooms}>
        <CRow className="g-3 mb-4">
          {ROOM_STATUS_ORDER.map((status) => (
            <CCol key={status} xs={6} md={4} xl>
              <button
                type="button"
                className={`room-summary w-100 text-start ${filters.status === status ? 'room-summary-active' : ''}`}
                style={{ '--room-color': `var(--cui-${statusColor(status)})` }}
                onClick={() => toggleStatus(status)}
                aria-pressed={filters.status === status}
              >
                <div className="fs-4 fw-semibold">{countByStatus[status]}</div>
                <div className="small text-body-secondary">{ROOM_STATUS_LABELS[status]}</div>
              </button>
            </CCol>
          ))}
        </CRow>

        <CCard className="mb-4">
          <CCardBody>
            <CRow className="g-2 align-items-end">
              <CCol md={3}>
                <CFormSelect
                  label="Sede"
                  value={filters.branchId}
                  onChange={setFilter('branchId')}
                  options={[
                    { value: '', label: 'Todas' },
                    ...(catalog.data?.branches ?? []).map((branch) => ({ value: String(branch.id), label: branch.branchName })),
                  ]}
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  label="Tipo"
                  value={filters.roomTypeId}
                  onChange={setFilter('roomTypeId')}
                  options={[
                    { value: '', label: 'Todos' },
                    ...(catalog.data?.roomTypes ?? []).map((type) => ({ value: String(type.id), label: type.name })),
                  ]}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput label="Número de habitación" value={filters.search} onChange={setFilter('search')} placeholder="Buscar..." />
              </CCol>
              <CCol md={3} className="text-md-end">
                <CButton color="secondary" variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Limpiar filtros
                </CButton>
                <CButton color="primary" variant="ghost" onClick={rooms.reload} disabled={rooms.loading}>
                  {rooms.loading && <CSpinner size="sm" className="me-2" />}
                  Actualizar
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {groups.length === 0 && (
          <p className="text-center text-body-secondary py-4">
            {allRooms.length === 0 ? 'Todavía no hay habitaciones generadas.' : 'No hay habitaciones que coincidan con los filtros.'}
          </p>
        )}

        {groups.map((branch) => (
          <CCard key={branch.key} className="mb-4">
            <CCardHeader className="fw-semibold">{branch.name}</CCardHeader>
            <CCardBody>
              {branch.types.map((type) => (
                <section key={type.key} className="room-group">
                  <h2 className="h6 mb-2">
                    {type.name}
                    <span className="text-body-secondary fw-normal ms-2">({type.rooms.length})</span>
                  </h2>
                  <CRow className="g-2">
                    {type.rooms.map((room) => (
                      <CCol key={room.id} xs={6} sm={4} lg={3} xxl={2}>
                        <div className={`room-tile h-100 ${room.active ? '' : 'room-tile-disabled'}`} style={{ '--room-color': `var(--cui-${statusColor(room.status)})` }}>
                          <button type="button" className="room-tile-main" onClick={() => setSelected(room)}>
                            <div className="fw-semibold">{room.roomNumber}</div>
                            <StatusBadge status={room.status} />
                            {!room.active && (
                              <CBadge color="dark" className="ms-1">
                                Deshabilitada
                              </CBadge>
                            )}
                          </button>
                          {canUpdate && room.status === ROOM_STATUS.LIMPIEZA && (
                            <CButton
                              color="success"
                              variant="outline"
                              size="sm"
                              className="w-100 mt-2"
                              onClick={() => markAvailable(room)}
                              disabled={releasingId === room.id}
                            >
                              {releasingId === room.id && <CSpinner size="sm" className="me-1" />}
                              Marcar disponible
                            </CButton>
                          )}
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                </section>
              ))}
            </CCardBody>
          </CCard>
        ))}
      </QueryState>

      <RoomModal
        key={selected?.id ?? 'none'}
        room={selected}
        catalog={catalog.data}
        canUpdate={canUpdate}
        canArchive={canManage}
        onClose={() => setSelected(null)}
        onSaved={rooms.reload}
        onArchive={(room) => {
          setSelected(null)
          setToArchive(room)
        }}
      />

      {generating && (
        <GenerateRoomsModal
          visible
          catalog={catalog.data}
          rooms={allRooms}
          archivedRooms={archived.data}
          onClose={() => setGenerating(false)}
          onGenerated={rooms.reload}
        />
      )}

      {canManage && (
        <ArchivedRoomsModal
          visible={showArchived}
          archived={archived}
          catalog={catalog.data}
          onClose={() => setShowArchived(false)}
          onRestored={reloadAll}
        />
      )}

      <ConfirmModal
        visible={Boolean(toArchive)}
        title="Archivar habitación"
        color="danger"
        confirmLabel="Archivar"
        loading={archiving}
        onConfirm={archive}
        onClose={() => setToArchive(null)}
      >
        ¿Archivar la habitación <strong>{toArchive?.roomNumber}</strong>? Dejará de aparecer en el tablero y en el check-in, y podrá restaurarla desde "Archivadas".
      </ConfirmModal>
    </>
  )
}
