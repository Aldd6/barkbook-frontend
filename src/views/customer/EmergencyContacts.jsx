import { useCallback, useState } from 'react'
import { CButton, CCard, CCardBody, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useForm from '../../hooks/useForm'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import FormModal from '../../components/FormModal'
import FormField from '../../components/FormField'
import EnumSelect from '../../components/EnumSelect'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContactsByCustomer,
  updateEmergencyContact,
} from '../../api/emergencyContacts'
import { toApiError } from '../../api/errors'
import { PERMISSIONS } from '../../constants/permissions'
import { KINSHIP_LABELS, KINSHIP_OPTIONS } from '../../constants/enums'
import { maxLength, minLength, phone, required } from '../../utils/validators'

const FIELDS = ['name', 'lastname', 'kinship', 'phoneNumber']

const RULES = {
  name: [required('Ingrese el nombre.'), minLength(2, 'El nombre debe tener al menos 2 caracteres.'), maxLength(100, 'El nombre no puede exceder los 100 caracteres.')],
  lastname: [required('Ingrese el apellido.'), minLength(2, 'El apellido debe tener al menos 2 caracteres.'), maxLength(100, 'El apellido no puede exceder los 100 caracteres.')],
  kinship: [required('Seleccione el parentesco.')],
  phoneNumber: [required('Ingrese el teléfono.'), phone],
}

const toFormValues = (contact) => ({
  name: contact?.name ?? '',
  lastname: contact?.lastname ?? '',
  kinship: contact?.kinship ?? '',
  phoneNumber: contact?.phoneNumber ?? '+502',
})

const toPayload = (values) => ({
  name: values.name.trim(),
  lastname: values.lastname.trim(),
  kinship: values.kinship,
  phoneNumber: values.phoneNumber.trim(),
})

export default function EmergencyContacts() {
  const { customer, hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA)
  const contacts = useApiQuery(useCallback(() => getEmergencyContactsByCustomer(customer.id), [customer.id]))
  const [modal, setModal] = useState({ visible: false, contact: null })
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const { values, reset, handleChange, handleSubmit, submitting, apiError, fieldError } = useForm(toFormValues(null), { rules: RULES })

  const openModal = (contact) => {
    reset(toFormValues(contact))
    setModal({ visible: true, contact })
  }
  const closeModal = () => setModal({ visible: false, contact: null })

  const onSubmit = handleSubmit(async (form) => {
    const result = modal.contact
      ? await updateEmergencyContact(modal.contact.id, toPayload(form))
      : await createEmergencyContact({ ...toPayload(form), customerId: customer.id })
    toast.success(result.message)
    closeModal()
    contacts.reload()
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { message } = await deleteEmergencyContact(toDelete.id)
      toast.success(message)
      setToDelete(null)
      contacts.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Contactos de emergencia"
        subtitle="Personas a las que podemos llamar si no logramos comunicarnos con usted durante la estancia."
        actions={
          canManage && (
            <CButton color="primary" onClick={() => openModal(null)}>
              <CIcon icon={cilPlus} className="me-1" />
              Agregar contacto
            </CButton>
          )
        }
      />
      <QueryState query={contacts}>
        <CCard>
          <CCardBody className={contacts.data?.length ? 'p-0' : undefined}>
            {contacts.data?.length === 0 ? (
              <p className="text-center text-body-secondary py-4 mb-0">Aún no tiene contactos de emergencia.</p>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Parentesco</CTableHeaderCell>
                    <CTableHeaderCell>Teléfono</CTableHeaderCell>
                    {canManage && <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {contacts.data?.map((contact) => (
                    <CTableRow key={contact.id}>
                      <CTableDataCell>
                        {contact.name} {contact.lastname}
                      </CTableDataCell>
                      <CTableDataCell>{KINSHIP_LABELS[contact.kinship]}</CTableDataCell>
                      <CTableDataCell>{contact.phoneNumber}</CTableDataCell>
                      {canManage && (
                        <CTableDataCell className="text-end text-nowrap">
                          <CButton color="primary" variant="ghost" size="sm" onClick={() => openModal(contact)} aria-label="Editar">
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteError(null)
                              setToDelete(contact)
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
          </CCardBody>
        </CCard>
      </QueryState>

      <FormModal
        visible={modal.visible}
        title={modal.contact ? 'Editar contacto' : 'Agregar contacto'}
        onClose={closeModal}
        onSubmit={onSubmit}
        submitting={submitting}
        apiError={apiError}
        fields={FIELDS}
      >
        <CRow>
          <CCol md={6}>
            <FormField name="name" label="Nombre" value={values.name} onChange={handleChange} error={fieldError('name')} />
          </CCol>
          <CCol md={6}>
            <FormField name="lastname" label="Apellido" value={values.lastname} onChange={handleChange} error={fieldError('lastname')} />
          </CCol>
          <CCol md={6}>
            <EnumSelect name="kinship" label="Parentesco" options={KINSHIP_OPTIONS} value={values.kinship} onChange={handleChange} error={fieldError('kinship')} />
          </CCol>
          <CCol md={6}>
            <FormField
              name="phoneNumber"
              type="tel"
              maxLength={12}
              label="Teléfono"
              helpText="Formato +502 seguido de 8 dígitos."
              value={values.phoneNumber}
              onChange={handleChange}
              error={fieldError('phoneNumber')}
            />
          </CCol>
        </CRow>
      </FormModal>

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar contacto"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar a{' '}
        <strong>
          {toDelete?.name} {toDelete?.lastname}
        </strong>
        ?
      </ConfirmModal>
    </>
  )
}
