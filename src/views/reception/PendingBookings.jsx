import { useState } from 'react'
import { CBadge, CCard, CCardBody, CCardHeader, CNav, CNavItem, CNavLink } from '@coreui/react'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmPaymentModal from '../../components/booking/ConfirmPaymentModal'
import ReceptionBookingTable from './ReceptionBookingTable'
import { getAutoCancelledBookings, getPendingBookings } from '../../api/bookings'
import { getCustomers } from '../../api/customers'
import { formatDateTime } from '../../utils/format'

const loadPending = () =>
  Promise.all([getPendingBookings(), getAutoCancelledBookings(), getCustomers()]).then(([pending, autoCancelled, customers]) => ({
    pending,
    autoCancelled,
    customersById: new Map(customers.map((customer) => [customer.id, customer])),
  }))

export default function PendingBookings() {
  const data = useApiQuery(loadPending)
  const catalog = useRoomCatalog()
  const [activeTab, setActiveTab] = useState('pending')
  const [toPay, setToPay] = useState(null)

  const pending = [...(data.data?.pending ?? [])].sort((a, b) => a.hoursRemaining - b.hoursRemaining)
  const expiresByBookingId = new Map(pending.map((item) => [item.booking.id, item]))
  const autoCancelled = data.data?.autoCancelled ?? []

  const expiresColumn = {
    header: 'Vence',
    render: (booking) => {
      const item = expiresByBookingId.get(booking.id)
      if (!item) return '—'
      return (
        <>
          <span className="text-nowrap">{formatDateTime(item.expiresAt)}</span>
          <CBadge color={item.hoursRemaining <= 24 ? 'danger' : 'warning'} className="ms-2">
            {Math.max(0, Math.round(item.hoursRemaining))} h
          </CBadge>
        </>
      )
    },
  }

  return (
    <>
      <PageHeader title="Pagos pendientes" subtitle="Reservas por pagar en mostrador. Si no se pagan en 5 días, se cancelan automáticamente." />
      <QueryState query={data}>
        <CCard>
          <CCardHeader>
            <CNav variant="underline-border" className="card-header-tabs">
              <CNavItem>
                <CNavLink as="button" type="button" active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
                  Pendientes de pago
                  <CBadge color={pending.length ? 'warning' : 'secondary'} className="ms-2">
                    {pending.length}
                  </CBadge>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink as="button" type="button" active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')}>
                  Canceladas automáticamente
                </CNavLink>
              </CNavItem>
            </CNav>
          </CCardHeader>
          <CCardBody className="p-0">
            {activeTab === 'pending' ? (
              <ReceptionBookingTable
                bookings={pending.map((item) => item.booking)}
                customersById={data.data?.customersById}
                catalog={catalog.data}
                onPay={setToPay}
                emptyText="No hay reservas pendientes de pago."
                renderExtraColumn={expiresColumn}
              />
            ) : (
              <ReceptionBookingTable
                bookings={autoCancelled}
                customersById={data.data?.customersById}
                catalog={catalog.data}
                emptyText="No hay reservas canceladas automáticamente."
              />
            )}
          </CCardBody>
        </CCard>
      </QueryState>

      <ConfirmPaymentModal key={toPay?.id ?? 'none'} booking={toPay} onClose={() => setToPay(null)} onPaid={data.reload} />
    </>
  )
}
