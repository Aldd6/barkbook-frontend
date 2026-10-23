import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import ServiceModal from './ServiceModal'
import { deleteService, getServiceBranches, getServices } from '../../api/services'
import { toApiError } from '../../api/errors'
import { PET_SPECIES_LABELS, SERVICE_TYPE_LABELS } from '../../constants/enums'
import { formatCurrency } from '../../utils/format'

const loadCatalog = async () => {
  const [services, serviceBranches] = await Promise.all([getServices(), getServiceBranches()])
  const branchCount = serviceBranches.reduce((acc, item) => acc.set(item.serviceId, (acc.get(item.serviceId) ?? 0) + 1), new Map())
  return { services: [...services].sort((a, b) => a.name.localeCompare(b.name)), branchCount }
}

export default function Services() {
  const toast = useToast()
  const catalog = useApiQuery(loadCatalog)
  const [editing, setEditing] = useState(undefined)
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
      const { message } = await deleteService(toDelete.id)
      toast.success(message)
      closeDelete()
      catalog.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Servicios"
        subtitle="Defina los servicios que pueden solicitar los clientes durante la estancia de sus mascotas."
        actions={
          <>
            <CButton color="primary" variant="outline" as={Link} to="/admin/servicios-sede">
              Asignar a sedes
            </CButton>
            <CButton color="primary" onClick={() => setEditing(null)}>
              <CIcon icon={cilPlus} className="me-1" />
              Nuevo servicio
            </CButton>
          </>
        }
      />
      <QueryState query={catalog}>
        {catalog.data?.services.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">Aún no hay servicios registrados.</CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Tipo</CTableHeaderCell>
                    <CTableHeaderCell>Especie</CTableHeaderCell>
                    <CTableHeaderCell>Tarifa</CTableHeaderCell>
                    <CTableHeaderCell>Sedes</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {catalog.data?.services.map((service) => {
                    const branches = catalog.data.branchCount.get(service.id) ?? 0
                    return (
                      <CTableRow key={service.id}>
                        <CTableDataCell>
                          <div className="fw-semibold">{service.name}</div>
                          {service.description && <div className="small text-body-secondary">{service.description}</div>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="light" textColor="dark">
                            {SERVICE_TYPE_LABELS[service.serviceType]}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{service.speciesType ? PET_SPECIES_LABELS[service.speciesType] : 'Cualquiera'}</CTableDataCell>
                        <CTableDataCell className="text-nowrap">
                          {formatCurrency(service.rate)}
                          <div className="small text-body-secondary">{service.isMultiGuest ? 'por servicio' : 'por mascota'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {branches === 0 ? (
                            <span className="small text-warning-emphasis">Sin sedes</span>
                          ) : (
                            <span className="small">{branches === 1 ? '1 sede' : `${branches} sedes`}</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">
                          <CButton color="primary" variant="ghost" size="sm" onClick={() => setEditing(service)} aria-label={`Editar ${service.name}`}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" onClick={() => setToDelete(service)} aria-label={`Archivar ${service.name}`}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </QueryState>

      <ServiceModal
        key={editing === null ? 'new' : (editing?.id ?? 'closed')}
        service={editing}
        onClose={() => setEditing(undefined)}
        onSaved={catalog.reload}
      />

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar servicio"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar el servicio <strong>{toDelete?.name}</strong>? Dejará de ofrecerse a los clientes en todas las sedes. Los cargos ya
        registrados en las reservas se conservan.
      </ConfirmModal>
    </>
  )
}
