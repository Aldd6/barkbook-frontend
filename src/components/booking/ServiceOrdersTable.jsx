import { CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import StatusBadge from '../StatusBadge'
import { SERVICE_ORDER_STATUS } from '../../constants/enums'
import { formatCurrency, formatDateTime } from '../../utils/format'

export default function ServiceOrdersTable({ orders = [], onCancel, onComplete, emptyText = 'La reserva no tiene servicios contratados.' }) {
  if (orders.length === 0) return <p className="text-body-secondary mb-0">{emptyText}</p>

  const hasActions = Boolean(onCancel || onComplete)

  return (
    <CTable responsive align="middle" small className="mb-0">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Servicio</CTableHeaderCell>
          <CTableHeaderCell>Mascotas</CTableHeaderCell>
          <CTableHeaderCell>Estado</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
          {hasActions && <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>}
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {orders.map((order) => {
          const pending = order.status === SERVICE_ORDER_STATUS.PENDIENTE
          return (
            <CTableRow key={order.id}>
              <CTableDataCell>
                {order.service?.name ?? `Servicio #${order.serviceId}`}
                <div className="small text-body-secondary text-nowrap">{formatDateTime(order.requestedAt)}</div>
                {order.description && <div className="small fst-italic">{order.description}</div>}
              </CTableDataCell>
              <CTableDataCell>{order.pets.map((pet) => pet.name).join(', ') || '—'}</CTableDataCell>
              <CTableDataCell>
                <StatusBadge status={order.status} />
                {order.resolutionNotes && <div className="small text-body-secondary">{order.resolutionNotes}</div>}
              </CTableDataCell>
              <CTableDataCell className={`text-end text-nowrap ${order.status === SERVICE_ORDER_STATUS.CANCELADO ? 'text-decoration-line-through text-body-secondary' : ''}`}>
                {formatCurrency(order.amount)}
              </CTableDataCell>
              {hasActions && (
                <CTableDataCell className="text-end text-nowrap">
                  {pending && onComplete && (
                    <CButton color="success" size="sm" className="me-2" onClick={() => onComplete(order)}>
                      Completar
                    </CButton>
                  )}
                  {pending && onCancel && (
                    <CButton color="danger" variant="outline" size="sm" onClick={() => onCancel(order)}>
                      Cancelar
                    </CButton>
                  )}
                </CTableDataCell>
              )}
            </CTableRow>
          )
        })}
      </CTableBody>
    </CTable>
  )
}
