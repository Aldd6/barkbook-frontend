import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-5 fw-bold page-title">404</h1>
      <p className="lead">La página que busca no existe.</p>
      <CButton color="primary" as={Link} to="/">
        Volver al inicio
      </CButton>
    </div>
  )
}
