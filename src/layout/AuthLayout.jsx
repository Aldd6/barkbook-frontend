import { Outlet } from 'react-router-dom'
import { CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import logoOriginal from '../assets/brand/logo-original.png'

// Layout de login, registro y completar perfil: tarjeta centrada con el logo.
export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="auth-layout min-vh-100 d-flex flex-row align-items-center py-4">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={wide ? 10 : 7} lg={wide ? 8 : 5}>
            <CCard className="border-0 shadow-sm">
              <CCardBody className="p-4">
                <div className="text-center mb-4">
                  <img src={logoOriginal} alt="Guau & Miau Club" className="auth-logo" />
                </div>
                {children ?? <Outlet />}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
