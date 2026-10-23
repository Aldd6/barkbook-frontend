import { useCallback, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import StatusBadge from '../../components/StatusBadge'
import ResolveServiceOrderModal from '../../components/booking/ResolveServiceOrderModal'
import { getServiceOrders } from '../../api/serviceOrders'
import { SERVICE_ORDER_STATUS } from '../../constants/enums'
import { formatCurrency, formatDateTime } from '../../utils/format'

const TABS = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'resolved', label: 'Historial' },
]

export default function PendingServices() {
  const pending = useApiQuery(useCallback(() => getServiceOrders(SERVICE_ORDER_STATUS.PENDIENTE), []))
  const catalog = useRoomCatalog()
  const [activeTab, setActiveTab] = useState('pending')
  const [action, setAction] = useState(null)
  const [historyVersion, setHistoryVersion] = useState(0)

  const branchName = (branchId) => catalog.data?.branchById.get(branchId)?.branchName

  const onResolved = () => {
    pending.reload()
    setHistoryVersion((current) => current + 1)
  }

  return (
    <>
      <PageHeader title="Servicios pendientes" subtitle="Servicios que los clientes contrataron para sus mascotas hospedadas en su sede." />
      <CCard>
        <CCardHeader>
          <CNav variant="underline-border" className="card-header-tabs">
            {TABS.map((tab) => (
              <CNavItem key={tab.key}>
                <CNavLink as="button" type="button" active={tab.key === activeTab} onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                  {tab.key === 'pending' && pending.data && (
                    <CBadge color={pending.data.length ? 'warning' : 'secondary'} className="ms-2">
                      {pending.data.length}
                    </CBadge>
                  )}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </CCardHeader>
        <CCardBody className={activeTab === 'pending' && pending.data?.length ? 'p-0' : undefined}>
          {activeTab === 'pending' ? (
            <QueryState query={pending}>
              <OrdersTable
                orders={pending.data}
                branchName={branchName}
                emptyText="No hay servicios pendientes. ¡Todo al día!"
                onAction={setAction}
              />
            </QueryState>
          ) : (
            <History key={historyVersion} branchName={branchName} />
          )}
        </CCardBody>
      </CCard>

      <ResolveServiceOrderModal
        key={action ? `${action.order.id}-${action.complete}` : 'closed'}
        action={action}
        onClose={() => setAction(null)}
        onResolved={onResolved}
      />
    </>
  )
}

function History({ branchName }) {
  const all = useApiQuery(useCallback(() => getServiceOrders(), []))
  const resolved = (all.data ?? [])
    .filter((order) => order.status !== SERVICE_ORDER_STATUS.PENDIENTE)
    .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))

  return (
    <QueryState query={all}>
      <OrdersTable orders={resolved} branchName={branchName} emptyText="Aún no se ha resuelto ningún servicio." />
    </QueryState>
  )
}

function OrdersTable({ orders = [], branchName, emptyText, onAction }) {
  if (orders.length === 0) return <p className="text-center text-body-secondary py-4 mb-0">{emptyText}</p>

  return (
    <CTable hover responsive align="middle" className="mb-0">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Orden</CTableHeaderCell>
          <CTableHeaderCell>Servicio</CTableHeaderCell>
          <CTableHeaderCell>Mascotas</CTableHeaderCell>
          <CTableHeaderCell>Indicaciones</CTableHeaderCell>
          <CTableHeaderCell>{onAction ? 'Solicitada' : 'Resolución'}</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
          {onAction && <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>}
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {orders.map((order) => (
          <CTableRow key={order.id}>
            <CTableDataCell className="text-nowrap">
              #{order.id}
              <div className="small text-body-secondary">
                Reserva #{order.bookingId}
                {branchName(order.branchId) && <> · {branchName(order.branchId)}</>}
              </div>
            </CTableDataCell>
            <CTableDataCell>{order.service?.name ?? `Servicio #${order.serviceId}`}</CTableDataCell>
            <CTableDataCell>{order.pets.map((pet) => pet.name).join(', ') || '—'}</CTableDataCell>
            <CTableDataCell style={{ minWidth: '12rem' }}>{order.description || <span className="text-body-secondary">—</span>}</CTableDataCell>
            <CTableDataCell>
              {onAction ? (
                <span className="text-nowrap">{formatDateTime(order.requestedAt)}</span>
              ) : (
                <>
                  <StatusBadge status={order.status} />
                  <div className="small text-body-secondary text-nowrap">{formatDateTime(order.resolvedAt)}</div>
                  {order.resolutionNotes && <div className="small">{order.resolutionNotes}</div>}
                </>
              )}
            </CTableDataCell>
            <CTableDataCell className="text-end text-nowrap">{formatCurrency(order.amount)}</CTableDataCell>
            {onAction && (
              <CTableDataCell className="text-end text-nowrap">
                <CButton color="success" size="sm" className="me-2" onClick={() => onAction({ order, complete: true })}>
                  Completar
                </CButton>
                <CButton color="danger" variant="outline" size="sm" onClick={() => onAction({ order, complete: false })}>
                  Cancelar
                </CButton>
              </CTableDataCell>
            )}
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )
}
