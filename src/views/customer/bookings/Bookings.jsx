import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import useAuth from '../../../auth/useAuth'
import useApiQuery from '../../../hooks/useApiQuery'
import useRoomCatalog, { describeRoomBranch } from '../../../hooks/useRoomCatalog'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import StatusBadge from '../../../components/StatusBadge'
import { getBookingsByCustomer } from '../../../api/bookings'
import { PERMISSIONS } from '../../../constants/permissions'
import { formatCurrency, formatDate } from '../../../utils/format'

export default function Bookings() {
  const { customer, hasPermission } = useAuth()
  const canBook = hasPermission(PERMISSIONS.GESTIONAR_RESERVACIONES)
  const bookings = useApiQuery(useCallback(() => getBookingsByCustomer(customer.id), [customer.id]))
  const catalog = useRoomCatalog()

  const sorted = [...(bookings.data ?? [])].sort((a, b) => b.checkInDate.localeCompare(a.checkInDate) || b.id - a.id)

  return (
    <>
      <PageHeader
        title="Mis reservas"
        subtitle="Consulte el estado y la cuenta de cada estancia."
        actions={
          canBook && (
            <CButton color="primary" as={Link} to="/reservas/nueva">
              <CIcon icon={cilPlus} className="me-1" />
              Nueva reserva
            </CButton>
          )
        }
      />
      <QueryState query={bookings}>
        <CCard>
          <CCardBody className={sorted.length ? 'p-0' : undefined}>
            {sorted.length === 0 ? (
              <p className="text-center text-body-secondary py-4 mb-0">Aún no tiene reservas.</p>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Sede</CTableHeaderCell>
                    <CTableHeaderCell>Habitación</CTableHeaderCell>
                    <CTableHeaderCell>Entrada</CTableHeaderCell>
                    <CTableHeaderCell>Salida</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Saldo</CTableHeaderCell>
                    <CTableHeaderCell />
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sorted.map((booking) => {
                    const { branch, roomType } = describeRoomBranch(catalog.data, booking.branchRoomId)
                    return (
                      <CTableRow key={booking.id}>
                        <CTableDataCell>{booking.id}</CTableDataCell>
                        <CTableDataCell>{branch?.branchName ?? '—'}</CTableDataCell>
                        <CTableDataCell>{roomType?.name ?? '—'}</CTableDataCell>
                        <CTableDataCell>{formatDate(booking.checkInDate)}</CTableDataCell>
                        <CTableDataCell>{formatDate(booking.checkOutDate)}</CTableDataCell>
                        <CTableDataCell>
                          <StatusBadge status={booking.bookingStatus} />
                        </CTableDataCell>
                        <CTableDataCell className={`text-end ${booking.balance > 0 ? 'text-danger fw-semibold' : ''}`}>
                          {formatCurrency(booking.balance)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton color="primary" variant="ghost" size="sm" as={Link} to={`/reservas/${booking.id}`}>
                            Ver detalle
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </QueryState>
    </>
  )
}
