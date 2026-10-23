import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CFormSelect, CFormSwitch, CListGroup, CListGroupItem, CRow, CSpinner } from '@coreui/react'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import { getBranches } from '../../api/branches'
import { createServiceBranch, deleteServiceBranch, getServiceBranches, getServices } from '../../api/services'
import { toApiError } from '../../api/errors'
import { PET_SPECIES_LABELS, SERVICE_TYPE_LABELS } from '../../constants/enums'
import { formatCurrency } from '../../utils/format'

const loadData = async () => {
  const [branches, services, serviceBranches] = await Promise.all([getBranches(), getServices(), getServiceBranches()])
  return {
    branches: [...branches].sort((a, b) => a.branchName.localeCompare(b.branchName)),
    services: [...services].sort((a, b) => a.serviceType.localeCompare(b.serviceType) || a.name.localeCompare(b.name)),
    serviceBranches,
  }
}

export default function ServiceBranches() {
  const toast = useToast()
  const query = useApiQuery(loadData)
  const [branchFilter, setBranchFilter] = useState('')
  const [pending, setPending] = useState(() => new Set())
  const [overrides, setOverrides] = useState(() => new Map())

  const assignment = (branchId, serviceId) => {
    const key = `${branchId}-${serviceId}`
    if (overrides.has(key)) return overrides.get(key)
    return query.data?.serviceBranches.find((item) => item.branchId === branchId && item.serviceId === serviceId)
  }

  const toggle = async (branch, service) => {
    const key = `${branch.id}-${service.id}`
    const current = assignment(branch.id, service.id)
    setPending((set) => new Set(set).add(key))
    try {
      const result = current
        ? await deleteServiceBranch(current.id)
        : await createServiceBranch({ branchId: branch.id, serviceId: service.id })
      setOverrides((map) => new Map(map).set(key, current ? null : result.serviceBranch))
      toast.success(result.message)
      query.reload()
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setPending((set) => {
        const next = new Set(set)
        next.delete(key)
        return next
      })
    }
  }

  const branches = (query.data?.branches ?? []).filter((branch) => !branchFilter || branch.id === Number(branchFilter))
  const noCatalog = query.data && (query.data.branches.length === 0 || query.data.services.length === 0)

  return (
    <>
      <PageHeader
        title="Servicios por sede"
        subtitle="Active en cada sede los servicios que presta. Los clientes solo podrán solicitar los servicios de la sede de su reserva."
      />
      <QueryState query={query}>
        {noCatalog ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">
              Primero registre al menos una sede y un <Link to="/admin/servicios">servicio</Link>.
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
                    ...(query.data?.branches ?? []).map((branch) => ({ value: String(branch.id), label: branch.branchName })),
                  ]}
                />
              </CCol>
            </CRow>

            <CRow className="g-4">
              {branches.map((branch) => {
                const offered = query.data.services.filter((service) => assignment(branch.id, service.id)).length
                return (
                  <CCol key={branch.id} lg={branchFilter ? 12 : 6}>
                    <CCard className="h-100">
                      <CCardHeader className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{branch.branchName}</span>
                        <span className="small text-body-secondary">
                          {offered} de {query.data.services.length} servicios
                        </span>
                      </CCardHeader>
                      <CListGroup flush>
                        {query.data.services.map((service) => {
                          const key = `${branch.id}-${service.id}`
                          const busy = pending.has(key)
                          return (
                            <CListGroupItem key={service.id} className="d-flex justify-content-between align-items-center gap-3">
                              <div>
                                <div className="fw-semibold">{service.name}</div>
                                <div className="small text-body-secondary">
                                  <CBadge color="light" textColor="dark" className="me-1">
                                    {SERVICE_TYPE_LABELS[service.serviceType]}
                                  </CBadge>
                                  {service.speciesType ? PET_SPECIES_LABELS[service.speciesType] : 'Cualquier especie'} ·{' '}
                                  {formatCurrency(service.rate)} {service.isMultiGuest ? 'por servicio' : 'por mascota'}
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {busy && <CSpinner size="sm" />}
                                <CFormSwitch
                                  id={`service-branch-${key}`}
                                  size="lg"
                                  checked={Boolean(assignment(branch.id, service.id))}
                                  disabled={busy}
                                  onChange={() => toggle(branch, service)}
                                  aria-label={`${service.name} en ${branch.branchName}`}
                                />
                              </div>
                            </CListGroupItem>
                          )
                        })}
                      </CListGroup>
                    </CCard>
                  </CCol>
                )
              })}
            </CRow>
          </>
        )}
      </QueryState>
    </>
  )
}
