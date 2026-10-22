import { useState } from 'react'
import { CBadge, CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import RoomTypeModal from './RoomTypeModal'
import { deleteRoomType, getRoomTypes } from '../../api/rooms'
import { toApiError } from '../../api/errors'
import { PET_SPECIES_LABELS } from '../../constants/enums'
import { ROOM_AMENITIES } from '../../constants/roomTypes'
import { formatCurrency } from '../../utils/format'

// Catalogo de tipos de habitacion (P: Gestionar tipos de habitacion). Que tipos ofrece cada sede
// y cuantas unidades se configura despues en las habitaciones por sede.
export default function RoomTypes() {
  const toast = useToast()
  const roomTypes = useApiQuery(getRoomTypes)
  const [editing, setEditing] = useState(undefined) // undefined = cerrado, null = nuevo
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const closeDelete = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { message } = await deleteRoomType(toDelete.id)
      toast.success(message)
      closeDelete()
      roomTypes.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Tipos de habitación"
        subtitle="Defina las habitaciones que ofrece el hotel: especie, tamaño, capacidad, tarifa y comodidades."
        actions={
          <CButton color="primary" onClick={() => setEditing(null)}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo tipo
          </CButton>
        }
      />
      <QueryState query={roomTypes}>
        {roomTypes.data?.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">Aún no hay tipos de habitación registrados.</CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Especie</CTableHeaderCell>
                    <CTableHeaderCell>Medidas (L × A × H)</CTableHeaderCell>
                    <CTableHeaderCell>Huéspedes</CTableHeaderCell>
                    <CTableHeaderCell>Tarifa por noche</CTableHeaderCell>
                    <CTableHeaderCell>Comodidades</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {roomTypes.data?.map((roomType) => (
                    <CTableRow key={roomType.id}>
                      <CTableDataCell>
                        <div className="fw-semibold">
                          {roomType.name}{' '}
                          <CBadge color="light" textColor="dark" className="ms-1">
                            {roomType.prefix}
                          </CBadge>
                        </div>
                        <div className="small text-body-secondary">{roomType.isCage ? 'Jaula' : 'Habitación'}</div>
                      </CTableDataCell>
                      <CTableDataCell>{PET_SPECIES_LABELS[roomType.speciesType]}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">
                        {roomType.lengthDimension} × {roomType.widthDimensions} × {roomType.heightDimensions}
                      </CTableDataCell>
                      <CTableDataCell>{roomType.maximumNumberOfGuests}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">{formatCurrency(roomType.nightlyRate)}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex flex-wrap gap-1">
                          {ROOM_AMENITIES.filter(([key]) => roomType[key]).map(([key, label]) => (
                            <CBadge key={key} color="secondary" className="fw-normal">
                              {label}
                            </CBadge>
                          ))}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-nowrap">
                        <CButton color="primary" variant="ghost" size="sm" onClick={() => setEditing(roomType)} aria-label={`Editar ${roomType.name}`}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => setToDelete(roomType)} aria-label={`Archivar ${roomType.name}`}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </QueryState>

      <RoomTypeModal
        key={editing === null ? 'new' : (editing?.id ?? 'closed')}
        roomType={editing}
        onClose={() => setEditing(undefined)}
        onSaved={roomTypes.reload}
      />

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar tipo de habitación"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar el tipo <strong>{toDelete?.name}</strong>? Dejará de aparecer en el catálogo de tipos de habitación.
      </ConfirmModal>
    </>
  )
}
