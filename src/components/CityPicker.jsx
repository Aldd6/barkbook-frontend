import { useEffect, useState } from 'react'
import { CCol, CFormSelect } from '@coreui/react'
import { getCities, getStates } from '../api/address'
import { toApiError } from '../api/errors'
import ApiErrorAlert from './ApiErrorAlert'

export default function CityPicker({ stateId, cityId, onStateChange, onCityChange, stateError, cityError, statePlaceholder = 'Seleccione un departamento' }) {
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getStates()
      .then(setStates)
      .catch((err) => setError(toApiError(err)))
  }, [])

  const handleStateChange = async (event) => {
    const value = event.target.value
    onStateChange(value)
    onCityChange('')
    setCities([])
    if (!value) return
    setLoadingCities(true)
    try {
      setCities(await getCities(value))
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setLoadingCities(false)
    }
  }

  return (
    <>
      {error && (
        <CCol xs={12}>
          <ApiErrorAlert error={error} />
        </CCol>
      )}
      <CCol md={6} className="mb-3">
        <CFormSelect
          id="stateId"
          name="stateId"
          label="Departamento"
          value={stateId}
          onChange={handleStateChange}
          invalid={Boolean(stateError)}
          feedbackInvalid={stateError}
          options={[{ value: '', label: statePlaceholder }, ...states.map((s) => ({ value: String(s.id), label: s.stateName }))]}
        />
      </CCol>
      <CCol md={6} className="mb-3">
        <CFormSelect
          id="cityId"
          name="cityId"
          label="Municipio"
          value={cityId}
          onChange={(event) => onCityChange(event.target.value)}
          disabled={!stateId || loadingCities}
          invalid={Boolean(cityError)}
          feedbackInvalid={cityError}
          options={[
            { value: '', label: loadingCities ? 'Cargando municipios...' : 'Seleccione un municipio', disabled: true },
            ...cities.map((c) => ({ value: String(c.id), label: c.cityName })),
          ]}
        />
      </CCol>
    </>
  )
}
