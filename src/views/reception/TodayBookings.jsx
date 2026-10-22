import { useState } from 'react'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CNav, CNavItem, CNavLink, CRow } from '@coreui/react'
import useApiQuery from '../../hooks/useApiQuery'
import useRoomCatalog from '../../hooks/useRoomCatalog'
import PageHeader from '../../components/PageHeader'
import QueryState from '../../components/QueryState'
import ConfirmPaymentModal from '../../components/booking/ConfirmPaymentModal'
import ReceptionBookingTable from './ReceptionBookingTable'
import { getBookings } from '../../api/bookings'
import { getCustomers } from '../../api/customers'
import { BOOKING_STATUS, BOOKING_STATUS_OPTIONS } from '../../constants/enums'
import { formatDate, todayISO } from '../../utils/format'
import { customerName, isActiveOn, isArrivalDue, isDepartureDue, isUpcoming } from './frontDesk'

// GET /bookings no filtra por fecha: se cargan todas y se filtran aqui.
const loadFrontDesk = () =>
  Promise.all([getBookings(), getCustomers()]).then(([bookings, customers]) => ({
    bookings,
    customersById: new Map(customers.map((customer) => [customer.id, customer])),
  }))

const TABS = [
  { key: 'arrivals', label: 'Llegadas', empty: 'No hay llegadas pendientes para hoy.' },
  { key: 'upcoming', label: 'Próximas', empty: 'No hay reservas por llegar en los próximos días.' },
  { key: 'departures', label: 'Salidas', empty: 'No hay salidas pendientes para hoy.' },
  { key: 'inStay', label: 'En estancia', empty: 'No hay mascotas hospedadas.' },
  { key: 'all', label: 'Buscar', empty: 'No hay reservas que coincidan con la búsqueda.' },
]

export default function TodayBookings() {
  const data = useApiQuery(loadFrontDesk)
  const catalog = useRoomCatalog()
  const [activeTab, setActiveTab] = useState('arrivals')
  // Sin fecha por defecto: la busqueda debe encontrar tambien reservas futuras o pasadas.
  const [filters, setFilters] = useState({ day: '', status: '', search: '' })
  const [toPay, setToPay] = useState(null)
  const today = todayISO()

  const bookings = data.data?.bookings ?? []
  const customersById = data.data?.customersById

  const byTab = {
    arrivals: bookings.filter((booking) => isArrivalDue(booking, today)),
    upcoming: bookings.filter((booking) => isUpcoming(booking, today)),
    departures: bookings.filter((booking) => isDepartureDue(booking, today)),
    inStay: bookings.filter((booking) => booking.bookingStatus === BOOKING_STATUS.EN_ESTANCIA),
    all: bookings.filter((booking) => {
      if (filters.day && !isActiveOn(booking, filters.day)) return false
      if (filters.status && booking.bookingStatus !== filters.status) return false
      const search = filters.search.trim().toLowerCase()
      if (!search) return true
      return String(booking.id) === search || customerName(customersById?.get(booking.customerId)).toLowerCase().includes(search)
    }),
  }

  const visible = [...byTab[activeTab]].sort((a, b) => a.checkInDate.localeCompare(b.checkInDate) || a.id - b.id)
  const setFilter = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }))

  return (
    <>
      <PageHeader title="Reservas del día" subtitle={`Hoy, ${formatDate(today)}`} />
      <QueryState query={data}>
        <CCard>
          <CCardHeader>
            <CNav variant="underline-border" className="card-header-tabs">
              {TABS.map((tab) => (
                <CNavItem key={tab.key}>
                  <CNavLink as="button" type="button" active={tab.key === activeTab} onClick={() => setActiveTab(tab.key)}>
                    {tab.label}
                    {tab.key !== 'all' && (
                      <CBadge color={byTab[tab.key].length ? 'primary' : 'secondary'} className="ms-2">
                        {byTab[tab.key].length}
                      </CBadge>
                    )}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>
          </CCardHeader>
          <CCardBody className="p-0">
            {activeTab === 'all' && (
              <CRow className="g-2 p-3 border-bottom">
                <CCol md={4}>
                  <CFormInput label="Activas en la fecha" type="date" value={filters.day} onChange={setFilter('day')} />
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Estado"
                    value={filters.status}
                    onChange={setFilter('status')}
                    options={[{ value: '', label: 'Todos' }, ...BOOKING_STATUS_OPTIONS]}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput label="Cliente o # de reserva" value={filters.search} onChange={setFilter('search')} placeholder="Buscar..." />
                </CCol>
              </CRow>
            )}
            <ReceptionBookingTable
              bookings={visible}
              customersById={customersById}
              catalog={catalog.data}
              onPay={setToPay}
              emptyText={TABS.find((tab) => tab.key === activeTab).empty}
            />
          </CCardBody>
        </CCard>
      </QueryState>

      <ConfirmPaymentModal key={toPay?.id ?? 'none'} booking={toPay} onClose={() => setToPay(null)} onPaid={data.reload} />
    </>
  )
}
