import { Link } from 'react-router-dom'
import { CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import useAuth from '../../auth/useAuth'
import StatusBadge from '../../components/StatusBadge'
import { describeRoomBranch } from '../../hooks/useRoomCatalog'
import { BOOKING_STATUS } from '../../constants/enums'
import { PERMISSIONS } from '../../constants/permissions'
import { formatCurrency, formatDate, todayISO } from '../../utils/format'
import { customerName, isArrivalDue } from './frontDesk'

export default function ReceptionBookingTable({ bookings, customersById, catalog, onPay, emptyText = 'No hay reservas.', renderExtraColumn }) {
  const { hasPermission } = useAuth()
  const today = todayISO()
  const canViewAccount = hasPermission(PERMISSIONS.CONSULTAR_CUENTA_RESERVACION)

  if (bookings.length === 0) return <p className="text-center text-body-secondary py-4 mb-0">{emptyText}</p>

  return (
    <CTable hover responsive align="middle" className="mb-0">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Cliente</CTableHeaderCell>
          <CTableHeaderCell>Habitación</CTableHeaderCell>
          <CTableHeaderCell>Entrada</CTableHeaderCell>
          <CTableHeaderCell>Salida</CTableHeaderCell>
          <CTableHeaderCell>Mascotas</CTableHeaderCell>
          <CTableHeaderCell>Estado</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Saldo</CTableHeaderCell>
          {renderExtraColumn && <CTableHeaderCell>{renderExtraColumn.header}</CTableHeaderCell>}
          <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {bookings.map((booking) => {
          const { branch, roomType } = describeRoomBranch(catalog, booking.branchRoomId)
          const canCheckIn = isArrivalDue(booking, today) && hasPermission(PERMISSIONS.HACER_CHECK_IN)
          const canCheckOut = booking.bookingStatus === BOOKING_STATUS.EN_ESTANCIA && hasPermission(PERMISSIONS.HACER_CHECK_OUT)
          const canPay = booking.bookingStatus === BOOKING_STATUS.PENDIENTE && booking.balance > 0 && hasPermission(PERMISSIONS.APLICAR_PAGOS_MOSTRADOR)

          return (
            <CTableRow key={booking.id}>
              <CTableDataCell>{booking.id}</CTableDataCell>
              <CTableDataCell>{customerName(customersById?.get(booking.customerId))}</CTableDataCell>
              <CTableDataCell>
                {roomType?.name ?? '—'}
                {branch && <div className="small text-body-secondary">{branch.branchName}</div>}
              </CTableDataCell>
              <CTableDataCell>{formatDate(booking.checkInDate)}</CTableDataCell>
              <CTableDataCell>{formatDate(booking.checkOutDate)}</CTableDataCell>
              <CTableDataCell>{booking.pets?.length ?? 0}</CTableDataCell>
              <CTableDataCell>
                <StatusBadge status={booking.bookingStatus} />
              </CTableDataCell>
              <CTableDataCell className={`text-end text-nowrap ${booking.balance > 0 ? 'text-danger fw-semibold' : ''}`}>
                {formatCurrency(booking.balance)}
              </CTableDataCell>
              {renderExtraColumn && <CTableDataCell>{renderExtraColumn.render(booking)}</CTableDataCell>}
              <CTableDataCell className="text-end text-nowrap">
                {canPay && onPay && (
                  <CButton color="warning" size="sm" className="me-1" onClick={() => onPay(booking)}>
                    Registrar pago
                  </CButton>
                )}
                {canCheckIn && (
                  <CButton color="primary" size="sm" className="me-1" as={Link} to={`/recepcion/reservas/${booking.id}/check-in`}>
                    Check-in
                  </CButton>
                )}
                {canCheckOut && (
                  <CButton color="primary" size="sm" className="me-1" as={Link} to={`/recepcion/reservas/${booking.id}/check-out`}>
                    Check-out
                  </CButton>
                )}
                {canViewAccount && (
                  <CButton color="primary" variant="ghost" size="sm" as={Link} to={`/recepcion/reservas/${booking.id}`}>
                    Ver
                  </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          )
        })}
      </CTableBody>
    </CTable>
  )
}
