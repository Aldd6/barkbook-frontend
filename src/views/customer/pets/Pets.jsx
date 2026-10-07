import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useAuth from '../../../auth/useAuth'
import useApiQuery from '../../../hooks/useApiQuery'
import useToast from '../../../components/toast/useToast'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import ConfirmModal from '../../../components/ConfirmModal'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import { deletePet, getPetsByCustomer } from '../../../api/pets'
import { toApiError } from '../../../api/errors'
import { PERMISSIONS } from '../../../constants/permissions'
import { PET_SIZE_LABELS, PET_SPECIES_LABELS, SEX_LABELS, UNIT_MEASURE_WEIGHT_PET_LABELS } from '../../../constants/enums'
import { formatAge } from '../../../utils/format'

export default function Pets() {
  const { customer, hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.GESTIONAR_MASCOTAS)
  const pets = useApiQuery(useCallback(() => getPetsByCustomer(customer.id), [customer.id]))
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
      const { message } = await deletePet(toDelete.id)
      toast.success(message)
      closeDelete()
      pets.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Mis mascotas"
        subtitle="Registre a sus mascotas y mantenga al día su expediente de dieta, salud y vacunas."
        actions={
          canManage && (
            <CButton color="primary" as={Link} to="/mascotas/nueva">
              <CIcon icon={cilPlus} className="me-1" />
              Registrar mascota
            </CButton>
          )
        }
      />
      <QueryState query={pets}>
        {pets.data?.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">Aún no tiene mascotas registradas.</CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Especie</CTableHeaderCell>
                    <CTableHeaderCell>Sexo</CTableHeaderCell>
                    <CTableHeaderCell>Tamaño</CTableHeaderCell>
                    <CTableHeaderCell>Edad</CTableHeaderCell>
                    <CTableHeaderCell>Peso</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pets.data?.map((pet) => (
                    <CTableRow key={pet.id}>
                      <CTableDataCell>
                        <Link to={`/mascotas/${pet.id}`} className="fw-semibold">
                          {pet.name}
                        </Link>
                      </CTableDataCell>
                      <CTableDataCell>{PET_SPECIES_LABELS[pet.species]}</CTableDataCell>
                      <CTableDataCell>{SEX_LABELS[pet.sex]}</CTableDataCell>
                      <CTableDataCell>{PET_SIZE_LABELS[pet.size]}</CTableDataCell>
                      <CTableDataCell>{formatAge(pet.birthday)}</CTableDataCell>
                      <CTableDataCell>
                        {pet.actualWeight} {UNIT_MEASURE_WEIGHT_PET_LABELS[pet.unitOfMeasureWeight]?.toLowerCase()}
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-nowrap">
                        <CButton color="primary" variant="ghost" size="sm" as={Link} to={`/mascotas/${pet.id}`}>
                          Ver expediente
                        </CButton>
                        {canManage && (
                          <>
                            <CButton color="primary" variant="ghost" size="sm" as={Link} to={`/mascotas/${pet.id}/editar`} aria-label={`Editar ${pet.name}`}>
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" variant="ghost" size="sm" onClick={() => setToDelete(pet)} aria-label={`Archivar ${pet.name}`}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </QueryState>

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar mascota"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar a <strong>{toDelete?.name}</strong>? Dejará de aparecer en su lista de mascotas.
      </ConfirmModal>
    </>
  )
}
