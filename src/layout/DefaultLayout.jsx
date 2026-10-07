import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'

const isDesktop = () => window.matchMedia('(min-width: 992px)').matches

export default function DefaultLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(isDesktop)
  const [sidebarUnfoldable, setSidebarUnfoldable] = useState(false)

  return (
    <div>
      <AppSidebar
        visible={sidebarVisible}
        onVisibleChange={setSidebarVisible}
        unfoldable={sidebarUnfoldable}
        onUnfoldableChange={setSidebarUnfoldable}
      />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader onToggleSidebar={() => setSidebarVisible((visible) => !visible)} />
        <div className="body flex-grow-1">
          <CContainer className="px-4" lg>
            <Outlet />
          </CContainer>
        </div>
        <footer className="footer px-4 app-footer">
          <span>Guau & Miau Club · Hotel de mascotas</span>
        </footer>
      </div>
    </div>
  )
}
