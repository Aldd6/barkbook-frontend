import { CBadge, CCard, CCardBody, CCardHeader, CListGroup, CListGroupItem } from '@coreui/react'
import StatusBadge from '../StatusBadge'
import { formatDate } from '../../utils/format'

export default function StayInfoCard({ checkIn, checkOut, petName }) {
  if (!checkIn) return null

  return (
    <CCard className="mb-4">
      <CCardHeader className="fw-semibold">Estancia</CCardHeader>
      <CCardBody>
        <dl className="row">
          <dt className="col-5">Check-in</dt>
          <dd className="col-7">
            {formatDate(checkIn.checkInDate)} <StatusBadge status={checkIn.status} />
          </dd>
          {checkIn.roomNumber && (
            <>
              <dt className="col-5">Habitación asignada</dt>
              <dd className="col-7">{checkIn.roomNumber}</dd>
            </>
          )}
          {checkIn.observations && (
            <>
              <dt className="col-5">Observaciones</dt>
              <dd className="col-7">{checkIn.observations}</dd>
            </>
          )}
          {checkOut && (
            <>
              <dt className="col-5">Check-out</dt>
              <dd className="col-7">{formatDate(checkOut.checkOutDate)}</dd>
              {checkOut.observations && (
                <>
                  <dt className="col-5">Observaciones de salida</dt>
                  <dd className="col-7">{checkOut.observations}</dd>
                </>
              )}
            </>
          )}
        </dl>
        <CListGroup flush>
          {checkIn.pets?.map((checkInPet) => (
            <CListGroupItem key={checkInPet.id} className="px-0 d-flex justify-content-between align-items-start gap-2">
              <span>
                {petName(checkInPet.petId)}
                {!checkInPet.admitted && checkInPet.nonadmissionReason && (
                  <span className="d-block small text-body-secondary">{checkInPet.nonadmissionReason}</span>
                )}
              </span>
              <CBadge color={checkInPet.admitted ? 'success' : 'secondary'}>{checkInPet.admitted ? 'Admitida' : 'No admitida'}</CBadge>
            </CListGroupItem>
          ))}
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}
