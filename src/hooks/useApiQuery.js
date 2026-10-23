import { useCallback, useEffect, useState } from 'react'
import { toApiError } from '../api/errors'

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

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true }))
    setVersion((current) => current + 1)
  }, [])

  return { ...state, reload }
}
