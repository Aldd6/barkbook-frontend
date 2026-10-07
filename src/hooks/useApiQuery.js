import { useCallback, useEffect, useState } from 'react'
import { toApiError } from '../api/errors'

// Carga datos de la API al montar y cada vez que cambia `fetcher`.
// El llamador debe memorizar fetcher con useCallback y sus dependencias:
//   const pets = useApiQuery(useCallback(() => getPetsByCustomer(customer.id), [customer.id]))
export default function useApiQuery(fetcher) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    fetcher().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState((current) => ({ data: current.data, error: toApiError(error), loading: false })),
    )
    return () => {
      active = false
    }
  }, [fetcher, version])

  // Vuelve a pedir los datos (p. ej. despues de crear o editar); conserva los actuales mientras tanto.
  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true }))
    setVersion((current) => current + 1)
  }, [])

  return { ...state, reload }
}
