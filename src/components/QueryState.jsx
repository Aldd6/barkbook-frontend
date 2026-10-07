import { CButton } from '@coreui/react'
import ApiErrorAlert from './ApiErrorAlert'
import LoadingScreen from './LoadingScreen'

// Estado de carga/error de useApiQuery. Muestra children solo cuando hay datos.
export default function QueryState({ query, children }) {
  if (query.data === undefined && query.loading) return <LoadingScreen fullScreen={false} />
  if (query.data === undefined && query.error) {
    return (
      <>
        <ApiErrorAlert error={query.error} />
        <CButton color="primary" variant="outline" onClick={query.reload}>
          Reintentar
        </CButton>
      </>
    )
  }
  return children
}
