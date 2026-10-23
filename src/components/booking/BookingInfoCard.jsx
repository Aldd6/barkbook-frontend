import { Fragment } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { describeRoomBranch } from '../../hooks/useRoomCatalog'
import { formatCurrency, formatDate, nightsBetween } from '../../utils/format'

export default function BookingInfoCard({ booking, catalog, petName, extraRows = [] }) {
  const { branch, roomType } = describeRoomBranch(catalog, booking.branchRoomId)
  const rows = [
    ...extraRows,
    ['Sede', branch?.branchName ?? '—'],
    ['Habitación', roomType?.name ?? '—'],
    ['Entrada', formatDate(booking.checkInDate)],
    ['Salida', formatDate(booking.checkOutDate)],
    ['Noches', nightsBetween(booking.checkInDate, booking.checkOutDate)],
    ['Tarifa por noche', formatCurrency(booking.nightlyRate)],
    ['Mascotas', booking.pets?.map((bookingPet) => petName(bookingPet.petId)).join(', ') || '—'],
  ]

  return (
    <CCard className="mb-4">
      <CCardHeader className="fw-semibold">Reserva</CCardHeader>
      <CCardBody>
        <dl className="row mb-0">
          {rows.map(([label, value], index) => (
            <Fragment key={label}>
              <dt className="col-5">{label}</dt>
              <dd className={`col-7 ${index === rows.length - 1 ? 'mb-0' : ''}`}>{value}</dd>
            </Fragment>
          ))}
        </dl>
      </CCardBody>
    </CCard>
  )
}
