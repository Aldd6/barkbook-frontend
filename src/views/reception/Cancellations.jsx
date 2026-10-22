import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import useRoomCatalog, { describeRoomBranch } from '../../hooks/useRoomCatalog'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import StatusBadge from '../../components/StatusBadge'
import ResolveCancellationModal from './ResolveCancellationModal'
import { getBookingCancellations } from '../../api/bookingCancellations'
import { getCustomers } from '../../api/customers'
import { CANCELLATION_STATUS, MOVEMENT_TYPE } from '../../constants/enums'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'
import { customerName } from './frontDesk'

// La API ya filtra por la sede del empleado (todas para el Administrador).
const loadCancellations = () =>
  Promise.all([getBookingCancellations(), getCustomers()]).then(([cancellations, customers]) => ({
    cancellations,
    customersById: new Map(customers.map((customer) => [customer.id, customer])),
  }))

const TABS = [
  { key: 'pending', label: 'Pendientes', empty: 'No hay solicitudes de cancelación pendientes.' },
  { key: 'resolved', label: 'Resueltas', empty: 'Aún no se ha resuelto ninguna solicitud.' },
]

const paidAmount = (booking) =>
  (booking?.bill ?? []).filter((movement) => movement.movementType === MOVEMENT_TYPE.ABONO).reduce((sum, movement) => sum + Number(movement.amount), 0)

// Solicitudes de cancelacion de los clientes para la sede del recepcionista
// (P: Gestionar cancelaciones de reservacion). Confirmar cancela la reserva y reembolsa los pagos.
export default function Cancellations() {
  const data = useApiQuery(loadCancellations)
  const catalog = useRoomCatalog()
  const [activeTab, setActiveTab] = useState('pending')
  const [action, setAction] = useState(null) // { cancellation, approve }

  const all = data.data?.cancellations ?? []
  const byTab = {
    pending: all.filter((item) => item.status === CANCELLATION_STATUS.PENDIENTE),
    resolved: all.filter((item) => item.status !== CANCELLATION_STATUS.PENDIENTE),
  }
  const visible = byTab[activeTab]
  const isPendingTab = activeTab === 'pending'

  return (
    <>
      <PageHeader title="Cancelaciones" subtitle="Solicitudes de cancelación de reservas de su sede." />
      <QueryState query={data}>
        <CCard>
          <CCardHeader>
            <CNav variant="underline-border" className="card-header-tabs">
              {TABS.map((tab) => (
                <CNavItem key={tab.key}>
                  <CNavLink as="button" type="button" active={tab.key === activeTab} onClick={() => setActiveTab(tab.key)}>
                    {tab.label}
                    <CBadge color={tab.key === 'pending' && byTab.pending.length ? 'warning' : 'secondary'} className="ms-2">
                      {byTab[tab.key].length}
                    </CBadge>
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>
          </CCardHeader>
          <CCardBody className="p-0">
            {visible.length === 0 ? (
              <p className="text-center text-body-secondary py-4 mb-0">{TABS.find((tab) => tab.key === activeTab).empty}</p>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Reserva</CTableHeaderCell>
                    <CTableHeaderCell>Cliente</CTableHeaderCell>
                    <CTableHeaderCell>Habitación</CTableHeaderCell>
                    <CTableHeaderCell>Fechas</CTableHeaderCell>
                    <CTableHeaderCell>Motivo</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Pagado</CTableHeaderCell>
                    <CTableHeaderCell>{isPendingTab ? 'Solicitada' : 'Resolución'}</CTableHeaderCell>
                    {isPendingTab && <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {visible.map((cancellation) => {
                    const { booking } = cancellation
                    const { branch, roomType } = describeRoomBranch(catalog.data, booking?.branchRoomId)
                    return (
                      <CTableRow key={cancellation.id}>
                        <CTableDataCell>
                          <Link to={`/recepcion/reservas/${cancellation.bookingId}`}>#{cancellation.bookingId}</Link>
                          {booking && (
                            <div>
                              <StatusBadge status={booking.bookingStatus} />
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{customerName(data.data.customersById.get(booking?.customerId))}</CTableDataCell>
                        <CTableDataCell>
                          {roomType?.name ?? '—'}
                          {branch && <div className="small text-body-secondary">{branch.branchName}</div>}
                        </CTableDataCell>
                        <CTableDataCell className="text-nowrap">
                          {booking ? `${formatDate(booking.checkInDate)} – ${formatDate(booking.checkOutDate)}` : '—'}
                        </CTableDataCell>
                        <CTableDataCell style={{ minWidth: '12rem' }}>{cancellation.reason}</CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">{formatCurrency(paidAmount(booking))}</CTableDataCell>
                        <CTableDataCell>
                          {isPendingTab ? (
                            <span className="text-nowrap">{formatDateTime(cancellation.requestedAt)}</span>
                          ) : (
                            <>
                              <StatusBadge status={cancellation.status} />
                              <div className="small text-body-secondary text-nowrap">{formatDateTime(cancellation.resolvedAt)}</div>
                              {cancellation.resolutionNotes && <div className="small">{cancellation.resolutionNotes}</div>}
                            </>
                          )}
                        </CTableDataCell>
                        {isPendingTab && (
                          <CTableDataCell className="text-end text-nowrap">
                            <CButton color="danger" size="sm" className="me-2" onClick={() => setAction({ cancellation, approve: true })}>
                              Confirmar
                            </CButton>
                            <CButton color="secondary" variant="outline" size="sm" onClick={() => setAction({ cancellation, approve: false })}>
                              Rechazar
                            </CButton>
                          </CTableDataCell>
                        )}
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </QueryState>

      <ResolveCancellationModal
        key={action ? `${action.cancellation.id}-${action.approve}` : 'closed'}
        action={action}
        onClose={() => setAction(null)}
        onResolved={data.reload}
      />
    </>
  )
}
