import { CBadge, CTable, CTableBody, CTableDataCell, CTableFoot, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { MOVEMENT_TYPE, MOVEMENT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../constants/enums'
import { formatCurrency } from '../utils/format'

const MOVEMENT_COLORS = {
  [MOVEMENT_TYPE.CARGO]: 'warning',
  [MOVEMENT_TYPE.ABONO]: 'success',
  [MOVEMENT_TYPE.REEMBOLSO]: 'info',
}

// Un CARGO sin metodo de pago es un servicio cargado a la cuenta, pendiente de cobro en mostrador.
const methodLabel = (movement) => {
  if (movement.methodPayment) return PAYMENT_METHOD_LABELS[movement.methodPayment]
  return movement.movementType === MOVEMENT_TYPE.CARGO ? 'Cargo a cuenta' : '—'
}

// Estado de cuenta de una reserva: movimientos (bill) y saldo pendiente (balance) de la API.
export default function BillTable({ bill = [], balance }) {
  if (bill.length === 0) return <p className="text-body-secondary mb-0">La reserva no tiene movimientos.</p>

  return (
    <CTable responsive align="middle" className="mb-0">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Movimiento</CTableHeaderCell>
          <CTableHeaderCell>Descripción</CTableHeaderCell>
          <CTableHeaderCell>Método</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {bill.map((movement) => (
          <CTableRow key={movement.id}>
            <CTableDataCell>
              <CBadge color={MOVEMENT_COLORS[movement.movementType]}>{MOVEMENT_TYPE_LABELS[movement.movementType]}</CBadge>
            </CTableDataCell>
            <CTableDataCell>
              {movement.description || '—'}
              {movement.quantity ? <span className="text-body-secondary"> · {movement.quantity} mascota(s)</span> : null}
            </CTableDataCell>
            <CTableDataCell>{methodLabel(movement)}</CTableDataCell>
            <CTableDataCell className="text-end text-nowrap">
              {movement.movementType === MOVEMENT_TYPE.ABONO ? '− ' : ''}
              {formatCurrency(movement.amount)}
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
      {balance !== undefined && (
        <CTableFoot>
          <CTableRow>
            <CTableHeaderCell colSpan={3} className="text-end">
              Saldo pendiente
            </CTableHeaderCell>
            <CTableHeaderCell className={`text-end text-nowrap ${balance > 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(balance)}
            </CTableHeaderCell>
          </CTableRow>
        </CTableFoot>
      )}
    </CTable>
  )
}
