import { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLink, cilLinkBroken, cilLockLocked, cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import useAuth from '../../auth/useAuth'
import useApiQuery from '../../hooks/useApiQuery'
import useToast from '../../components/toast/useToast'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmModal from '../../components/ConfirmModal'
import ApiErrorAlert from '../../components/ApiErrorAlert'
import Avatar from '../../components/Avatar'
import EmployeeModal from './EmployeeModal'
import EmployeeUserModal from './EmployeeUserModal'
import EmployeePasswordModal from './EmployeePasswordModal'
import { deleteEmployee, getEmployees, revokeEmployeeUser } from '../../api/employees'
import { getBranches } from '../../api/branches'
import { toApiError } from '../../api/errors'
import { ADMIN_ROLE_NAME } from '../../constants/permissions'

export default function Employees() {
  const { user } = useAuth()
  const toast = useToast()
  const employees = useApiQuery(getEmployees)
  const branches = useApiQuery(getBranches)
  const [filters, setFilters] = useState({ branchId: '', search: '' })
  const [editingId, setEditingId] = useState(undefined)
  const [userFor, setUserFor] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [passwordFor, setPasswordFor] = useState(null)
  const [toRevoke, setToRevoke] = useState(null)
  const [revoking, setRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState(null)

  const canCreateUsers = user.roleName === ADMIN_ROLE_NAME
  const branchList = branches.data ?? []
  const branchName = (id) => branchList.find((branch) => branch.id === id)?.branchName ?? '—'
  const editing = editingId === null ? null : editingId === undefined ? undefined : employees.data?.find((employee) => employee.id === editingId)

  const search = filters.search.trim().toLowerCase()
  const visible = (employees.data ?? []).filter((employee) => {
    if (filters.branchId && employee.branchId !== Number(filters.branchId)) return false
    return !search || `${employee.name} ${employee.lastname} ${employee.dpiNumber}`.toLowerCase().includes(search)
  })

  const closeDelete = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { message } = await deleteEmployee(toDelete.id)
      toast.success(message)
      closeDelete()
      employees.reload()
    } catch (error) {
      setDeleteError(toApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  const closeRevoke = () => {
    setToRevoke(null)
    setRevokeError(null)
  }

  const handleRevoke = async () => {
    setRevoking(true)
    try {
      const { message } = await revokeEmployeeUser(toRevoke.id)
      toast.success(message)
      closeRevoke()
      employees.reload()
    } catch (error) {
      setRevokeError(toApiError(error))
    } finally {
      setRevoking(false)
    }
  }

  const fromEditor = (open) => (employee) => {
    setEditingId(undefined)
    open(employee)
  }

  return (
    <>
      <PageHeader
        title="Empleados"
        subtitle="Registre al personal de cada sede y deles un usuario para entrar al sistema."
        actions={
          <CButton color="primary" onClick={() => setEditingId(null)} disabled={!branches.data}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo empleado
          </CButton>
        }
      />
      {branches.error && <ApiErrorAlert error={branches.error} />}
      <QueryState query={employees}>
        <CCard className="mb-3">
          <CCardBody>
            <CRow className="g-3">
              <CCol md={4}>
                <CFormSelect
                  label="Sede"
                  value={filters.branchId}
                  onChange={(event) => setFilters((current) => ({ ...current, branchId: event.target.value }))}
                  options={[{ value: '', label: 'Todas las sedes' }, ...branchList.map((branch) => ({ value: String(branch.id), label: branch.branchName }))]}
                />
              </CCol>
              <CCol md={8}>
                <CFormInput
                  label="Buscar"
                  placeholder="Nombre, apellido o DPI"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {visible.length === 0 ? (
          <CCard>
            <CCardBody className="text-center py-5 text-body-secondary">
              {employees.data?.length === 0 ? 'Aún no hay empleados registrados.' : 'Ningún empleado coincide con los filtros.'}
            </CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>DPI</CTableHeaderCell>
                    <CTableHeaderCell>Sede</CTableHeaderCell>
                    <CTableHeaderCell>Teléfono</CTableHeaderCell>
                    <CTableHeaderCell>Usuario</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {visible.map((employee) => {
                    const fullName = `${employee.name} ${employee.lastname}`
                    return (
                      <CTableRow key={employee.id}>
                        <CTableDataCell>
                          <span className="d-inline-flex align-items-center gap-2 fw-semibold">
                            <Avatar src={employee.profilePicture} />
                            {fullName}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>{employee.dpiNumber}</CTableDataCell>
                        <CTableDataCell>{branchName(employee.branchId)}</CTableDataCell>
                        <CTableDataCell>{employee.phoneNumber}</CTableDataCell>
                        <CTableDataCell>
                          {employee.userId ? (
                            <CBadge color="success">Con acceso</CBadge>
                          ) : canCreateUsers ? (
                            <CButton color="primary" variant="outline" size="sm" onClick={() => setUserFor(employee)}>
                              <CIcon icon={cilLink} className="me-1" />
                              Dar acceso
                            </CButton>
                          ) : (
                            <CBadge color="secondary">Sin usuario</CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">
                          {employee.userId && (
                            <>
                              <CButton
                                color="secondary"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPasswordFor(employee)}
                                aria-label={`Cambiar contraseña de ${fullName}`}
                                title="Cambiar contraseña"
                              >
                                <CIcon icon={cilLockLocked} />
                              </CButton>
                              <CButton
                                color="warning"
                                variant="ghost"
                                size="sm"
                                onClick={() => setToRevoke(employee)}
                                aria-label={`Revocar acceso de ${fullName}`}
                                title="Revocar acceso"
                              >
                                <CIcon icon={cilLinkBroken} />
                              </CButton>
                            </>
                          )}
                          <CButton color="primary" variant="ghost" size="sm" onClick={() => setEditingId(employee.id)} aria-label={`Editar ${fullName}`}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" onClick={() => setToDelete(employee)} aria-label={`Archivar ${fullName}`}>
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

      <EmployeeModal
        key={editingId === null ? 'new' : (editingId ?? 'closed')}
        employee={editing}
        branches={branchList}
        onClose={() => setEditingId(undefined)}
        onSaved={employees.reload}
        onGrantAccess={canCreateUsers ? fromEditor(setUserFor) : undefined}
        onChangePassword={fromEditor(setPasswordFor)}
        onRevoke={fromEditor(setToRevoke)}
      />

      <EmployeePasswordModal key={passwordFor?.id ?? 'closed'} employee={passwordFor} onClose={() => setPasswordFor(null)} />

      <ConfirmModal
        visible={Boolean(toRevoke)}
        title="Revocar acceso"
        confirmLabel="Revocar acceso"
        color="danger"
        loading={revoking}
        onConfirm={handleRevoke}
        onClose={closeRevoke}
      >
        <ApiErrorAlert error={revokeError} />
        <p>
          ¿Desea desvincular el usuario de <strong>{toRevoke && `${toRevoke.name} ${toRevoke.lastname}`}</strong>? Perderá el acceso al sistema:
          sus sesiones se cierran y en menos de 15 minutos deberá iniciar sesión de nuevo, lo que ya no podrá hacer.
        </p>
        <p className="mb-0 text-body-secondary">La cuenta no se elimina: puede volver a vincularse a este u otro empleado con “Dar acceso”.</p>
      </ConfirmModal>

      <EmployeeUserModal key={userFor?.id ?? 'closed'} employee={userFor} onClose={() => setUserFor(null)} onSaved={employees.reload} />

      <ConfirmModal
        visible={Boolean(toDelete)}
        title="Archivar empleado"
        confirmLabel="Archivar"
        color="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      >
        <ApiErrorAlert error={deleteError} />
        ¿Desea archivar a <strong>{toDelete && `${toDelete.name} ${toDelete.lastname}`}</strong>? Dejará de aparecer en la lista de personal.
      </ConfirmModal>
    </>
  )
}
