import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { CNavItem, CNavLink, CNavTitle, CSidebarNav } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import useAuth from '../auth/useAuth'

export default function AppSidebarNav({ sections }) {
  const { customer, hasPermission, hasAnyPermission } = useAuth()

  const canSee = (item) => {
    if (item.requiresCustomer && !customer) return false
    if (item.permission) return hasPermission(item.permission)
    if (item.anyOf) return hasAnyPermission(item.anyOf)
    if (item.allOf) return item.allOf.every(hasPermission)
    return true
  }

  return (
    <CSidebarNav>
      {sections.map((section, index) => {
        const items = section.items.filter(canSee)
        if (items.length === 0) return null
        return (
          <Fragment key={section.title ?? index}>
            {section.title && <CNavTitle>{section.title}</CNavTitle>}
            {items.map((item) => (
              <CNavItem as="div" key={item.to}>
                <CNavLink as={NavLink} to={item.to} end={item.end}>
                  {item.icon && <CIcon customClassName="nav-icon" icon={item.icon} />}
                  {item.name}
                </CNavLink>
              </CNavItem>
            ))}
          </Fragment>
        )
      })}
    </CSidebarNav>
  )
}
