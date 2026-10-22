import { useState } from 'react'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import BranchModal from './BranchModal'
import { deleteBranch, getBranches } from '../../api/branches'
import { toApiError } from '../../api/errors'

// Sedes del hotel (P: Gestionar sedes). Las habitaciones y servicios de cada sede se configuran aparte.
export default function Branches() {
  const toast = useToast()
  const branches = useApiQuery(getBranches)
  const [editing, setEditing] = useState(undefined) // undefined = cerrado, null = nueva
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
      const { message } = await deleteBranch(toDelete.id)
      toast.success(message)
      closeDelete()
      branches.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Sedes"
        subtitle="Registre las sedes del hotel y mantenga al día su dirección."
        actions={
          <CButton color="primary" onClick={() => setEditing(null)}>
            <CIcon icon={cilPlus} className="me-1" />
            Nueva sede
          </CButton>
        }
      />
      <QueryState query={branches}>
        {branches.data?.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">Aún no hay sedes registradas.</CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Dirección</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {branches.data?.map((branch) => (
                    <CTableRow key={branch.id}>
                      <CTableDataCell className="fw-semibold">{branch.branchName}</CTableDataCell>
                      <CTableDataCell>
                        {branch.addressLineOne}
                        {branch.addressLineTwo && <div className="small text-body-secondary">{branch.addressLineTwo}</div>}
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-nowrap">
                        <CButton color="primary" variant="ghost" size="sm" onClick={() => setEditing(branch)} aria-label={`Editar ${branch.branchName}`}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => setToDelete(branch)} aria-label={`Archivar ${branch.branchName}`}>
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

      <BranchModal
        key={editing === null ? 'new' : (editing?.id ?? 'closed')}
        branch={editing}
        onClose={() => setEditing(undefined)}
        onSaved={branches.reload}
      />

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar sede"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar la sede <strong>{toDelete?.branchName}</strong>? Dejará de aparecer en la lista de sedes.
      </ConfirmModal>
    </>
  )
}
