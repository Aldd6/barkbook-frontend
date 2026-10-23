import { useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import useToast from '../../components/toast/useToast'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import QueryState from '../../components/QueryState'
import { describeRoomBranch } from '../../hooks/useRoomCatalog'
import { restoreRoomInventory } from '../../api/rooms'
import { toApiError } from '../../api/errors'
import { formatDateTime } from '../../utils/format'

export default function ArchivedRoomsModal({ visible, archived, catalog, onClose, onRestored }) {
  const toast = useToast()
  const [restoringId, setRestoringId] = useState(null)
  const [error, setError] = useState(null)

  const restore = async (room) => {
    setRestoringId(room.id)
    setError(null)
    try {
      const result = await restoreRoomInventory(room.id)
      toast.success(result.message)
      onRestored?.(result.roomInventory)
    } catch (restoreError) {
      setError(toApiError(restoreError))
    } finally {
      setRestoringId(null)
    }
  }

  const rooms = archived.data ?? []

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size="lg" scrollable>
      <CModalHeader>
        <CModalTitle>Habitaciones archivadas</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <ApiErrorAlert error={error} />
        <QueryState query={archived}>
          {rooms.length === 0 ? (
            <p className="text-center text-body-secondary py-3 mb-0">No hay habitaciones archivadas.</p>
          ) : (
            <CTable hover responsive align="middle" className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Habitación</CTableHeaderCell>
                  <CTableHeaderCell>Sede</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Archivada</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rooms.map((room) => {
                  const { branch, roomType } = describeRoomBranch(catalog, room.roomBranchId)
                  return (
                    <CTableRow key={room.id}>
                      <CTableDataCell className="fw-semibold">{room.roomNumber}</CTableDataCell>
                      <CTableDataCell>{branch?.branchName ?? '—'}</CTableDataCell>
                      <CTableDataCell>{roomType?.name ?? '—'}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">{formatDateTime(room.archivedAt)}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          onClick={() => restore(room)}
                          disabled={restoringId !== null}
                        >
                          {restoringId === room.id && <CSpinner size="sm" className="me-1" />}
                          Restaurar
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </QueryState>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
