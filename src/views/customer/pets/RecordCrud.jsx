import { useCallback, useState } from 'react'
import { CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useApiQuery from '../../../hooks/useApiQuery'
import useForm from '../../../hooks/useForm'
import useToast from '../../../components/toast/useToast'
import QueryState from '../../../components/QueryState'
import FormModal from '../../../components/FormModal'
import ConfirmModal from '../../../components/ConfirmModal'
import ApiErrorAlert from '../../../components/ApiErrorAlert'
import { toApiError } from '../../../api/errors'

// Lista + alta/edicion en modal + archivado para un recurso del expediente de la mascota
// (dietas, enfermedades, vacunas). Cada recurso aporta sus columnas, formulario y conversiones.
export default function RecordCrud({
  petId,
  api,
  canManage,
  emptyText,
  addLabel,
  modalTitle,
  deleteText,
  columns,
  rules,
  fields,
  toFormValues,
  toPayload,
  renderForm,
  renderExtraActions,
}) {
  const toast = useToast()
  const records = useApiQuery(useCallback(() => api.listByPet(petId), [api, petId]))
  const [modal, setModal] = useState({ visible: false, record: null })
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const form = useForm(toFormValues(null), { rules })

  const openModal = (record) => {
    form.reset(toFormValues(record))
    setModal({ visible: true, record })
  }
  const closeModal = () => setModal({ visible: false, record: null })

  const onSubmit = form.handleSubmit(async (values) => {
    const editing = modal.record
    const result = editing
      ? await api.update(editing.id, toPayload(values, { editing: true }))
      : await api.create({ ...toPayload(values, { editing: false }), petId: Number(petId) })
    toast.success(result.message)
    closeModal()
    records.reload()
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { message } = await api.remove(toDelete.id)
      toast.success(message)
      setToDelete(null)
      records.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  // Acciones extra (p. ej. activar dieta): ejecutan la llamada y recargan la lista.
  const runAction = async (action) => {
    try {
      const { message } = await action()
      toast.success(message)
      records.reload()
    } catch (error) {
      toast.error(toApiError(error).message)
    }
  }

  return (
    <>
      {canManage && (
        <div className="d-flex justify-content-end mb-3">
          <CButton color="primary" size="sm" onClick={() => openModal(null)}>
            <CIcon icon={cilPlus} className="me-1" />
            {addLabel}
          </CButton>
        </div>
      )}
      <QueryState query={records}>
        {records.data?.length === 0 ? (
          <p className="text-center text-body-secondary py-4 mb-0">{emptyText}</p>
        ) : (
          <CTable hover responsive align="middle" className="mb-0">
            <CTableHead>
              <CTableRow>
                {columns.map((column) => (
                  <CTableHeaderCell key={column.header}>{column.header}</CTableHeaderCell>
                ))}
                {canManage && <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {records.data?.map((record) => (
                <CTableRow key={record.id}>
                  {columns.map((column) => (
                    <CTableDataCell key={column.header}>{column.render(record)}</CTableDataCell>
                  ))}
                  {canManage && (
                    <CTableDataCell className="text-end text-nowrap">
                      {renderExtraActions?.(record, runAction)}
                      <CButton color="primary" variant="ghost" size="sm" onClick={() => openModal(record)} aria-label="Editar">
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteError(null)
                          setToDelete(record)
                        }}
                        aria-label="Archivar"
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  )}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </QueryState>

      <FormModal
        visible={modal.visible}
        title={modal.record ? `Editar ${modalTitle}` : `Agregar ${modalTitle}`}
        onClose={closeModal}
        onSubmit={onSubmit}
        submitting={form.submitting}
        apiError={form.apiError}
        fields={fields}
      >
        {renderForm(form, { editing: Boolean(modal.record) })}
      </FormModal>

      <ConfirmModal
        visible={Boolean(toDelete)}
        title={`Archivar ${modalTitle}`}
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      >
        <ApiErrorAlert error={deleteError} />
        {toDelete && deleteText(toDelete)}
      </ConfirmModal>
    </>
  )
}
