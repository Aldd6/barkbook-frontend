import { useState } from 'react'
import {
  CContainer,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout, cilMenu, cilUser } from '@coreui/icons'
import useAuth from '../auth/useAuth'

export default function AppHeader({ onToggleSidebar }) {
  const { user, customer, employee, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  // El nombre viene del perfil (cliente o empleado); si aun no hay perfil, el username.
  const displayName = customer?.name ?? employee?.name ?? user.username

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0 app-header">
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler onClick={onToggleSidebar} style={{ marginInlineStart: '-14px' }} aria-label="Mostrar u ocultar menú">
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="ms-auto align-items-center">
          <span className="fw-semibold me-3 app-greeting">Hola {displayName}!</span>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="py-0" aria-label="Opciones de usuario">
              <span className="app-avatar">
                <CIcon icon={cilUser} />
              </span>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0">
              <CDropdownHeader className="bg-body-secondary fw-semibold">
                {user.username} · {user.roleName}
              </CDropdownHeader>
              <CDropdownItem as="button" type="button" onClick={handleLogout} disabled={loggingOut}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Cerrar sesión
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}
