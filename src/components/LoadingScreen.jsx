import { CSpinner } from '@coreui/react'

export default function LoadingScreen({ fullScreen = true, label = 'Cargando...' }) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center gap-2 ${fullScreen ? 'min-vh-100' : 'py-5'}`}>
      <CSpinner color="primary" />
      <span className="text-body-secondary small">{label}</span>
    </div>
  )
}
