import { CBadge, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import logoIcon from '../../assets/brand/logo-icon.png'
import { ADMIN_ROLE_NAME } from '../../constants/permissions'

export default function Home() {
  const { user, customer, employee, permissions } = useAuth()
  const name = customer ? `${customer.name} ${customer.lastname}` : employee ? `${employee.name} ${employee.lastname}` : user.username

  return (
    <>
      <CCard className="home-hero mb-4">
        <CCardBody className="d-flex flex-wrap align-items-center gap-4 p-4">
          <img src={logoIcon} alt="" className="home-hero-logo" />
          <div>
            <h1 className="h2 mb-1">¡Bienvenido, {name}!</h1>
            <p className="mb-0 opacity-75">Use el menú lateral para navegar por las opciones disponibles para su cuenta.</p>
          </div>
        </CCardBody>
      </CCard>
      <CRow className="g-4">
        <CCol md={5}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Mi sesión</CCardHeader>
            <CCardBody>
              <dl className="mb-0">
                <dt>Usuario</dt>
                <dd>{user.username}</dd>
                <dt>Correo</dt>
                <dd>{user.email}</dd>
                <dt>Rol</dt>
                <dd className="mb-0">{user.roleName}</dd>
              </dl>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={7}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Permisos</CCardHeader>
            <CCardBody>
              {user.roleName === ADMIN_ROLE_NAME && (
                <p className="text-body-secondary">El Administrador tiene acceso a todas las opciones.</p>
              )}
              {permissions.length === 0 ? (
                <p className="text-body-secondary mb-0">Su rol no tiene permisos asignados.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <CBadge key={permission} color="light" textColor="dark" className="permission-badge">
                      {permission}
                    </CBadge>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
