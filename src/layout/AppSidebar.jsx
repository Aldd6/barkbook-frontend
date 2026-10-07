import { NavLink } from 'react-router-dom'
import { CCloseButton, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarHeader, CSidebarToggler } from '@coreui/react'
import AppSidebarNav from './AppSidebarNav'
import navigation from '../nav/_nav'
import logoHorizontal from '../assets/brand/logo-horizontal.png'
import logoIcon from '../assets/brand/logo-icon.png'

export default function AppSidebar({ visible, onVisibleChange, unfoldable, onUnfoldableChange }) {
  return (
    <CSidebar
      className="border-end app-sidebar"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={visible}
      onVisibleChange={onVisibleChange}
    >
      <CSidebarHeader className="app-sidebar-brand">
        <CSidebarBrand as={NavLink} to="/">
          <img src={logoHorizontal} alt="Guau & Miau Club" className="sidebar-brand-full" height={44} />
          <img src={logoIcon} alt="Guau & Miau Club" className="sidebar-brand-narrow" height={32} />
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" onClick={() => onVisibleChange(false)} />
      </CSidebarHeader>
      <AppSidebarNav sections={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => onUnfoldableChange(!unfoldable)} />
      </CSidebarFooter>
    </CSidebar>
  )
}
