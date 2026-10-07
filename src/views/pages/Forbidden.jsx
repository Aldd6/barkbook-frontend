import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'

export default function Forbidden() {
  return (
    <div className="text-center py-5">
      <h1 className="display-5 fw-bold page-title">403</h1>
      <p className="lead">No tiene permisos para ver esta página.</p>
      <CButton color="primary" as={Link} to="/">
        Volver al inicio
      </CButton>
    </div>
  )
}
