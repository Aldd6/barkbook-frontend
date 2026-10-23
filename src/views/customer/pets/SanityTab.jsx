import { CBadge, CCol, CFormSwitch, CRow } from '@coreui/react'
import RecordCrud from './RecordCrud'
import FormField from '../../../components/FormField'
import { petSanityApi } from '../../../api/petRecords'
import { date, maxLength, minLength, notFuture, required } from '../../../utils/validators'
import { formatDate, todayISO, yesNo } from '../../../utils/format'

const FIELDS = ['illnessName', 'isCronic', 'isContagious', 'sufferedSince', 'enduredUntil']

const RULES = {
  illnessName: [
    required('Ingrese el nombre de la enfermedad.'),
    minLength(2, 'El nombre de la enfermedad debe tener al menos 2 caracteres.'),
    maxLength(150, 'El nombre de la enfermedad no puede exceder los 150 caracteres.'),
  ],
  sufferedSince: [required('Ingrese desde cuándo la padece.'), date, notFuture('La fecha de inicio no puede ser en el futuro.')],
  enduredUntil: [
    date,
    (value, all) =>
      value && all.sufferedSince && value < all.sufferedSince
        ? 'La fecha en que finalizo la enfermedad no puede ser anterior a la fecha en que inicio.'
        : null,
  ],
}

const COLUMNS = [
  { header: 'Enfermedad', render: (record) => record.illnessName },
  { header: 'Crónica', render: (record) => yesNo(record.isCronic) },
  { header: 'Contagiosa', render: (record) => yesNo(record.isContagious) },
  { header: 'Desde', render: (record) => formatDate(record.sufferedSince) },
  { header: 'Hasta', render: (record) => (record.enduredUntil ? formatDate(record.enduredUntil) : '—') },
  {
    header: 'Estado',
    render: (record) => <CBadge color={record.isIllnessActive ? 'danger' : 'success'}>{record.isIllnessActive ? 'Activa' : 'Superada'}</CBadge>,
  },
]

const toFormValues = (record) => ({
  illnessName: record?.illnessName ?? '',
  isCronic: record?.isCronic ?? false,
  isContagious: record?.isContagious ?? false,
  sufferedSince: record?.sufferedSince ?? '',
  enduredUntil: record?.enduredUntil ?? '',
})

const toPayload = (values, { editing }) => {
  const payload = {
    illnessName: values.illnessName.trim(),
    isCronic: values.isCronic,
    isContagious: values.isContagious,
    sufferedSince: values.sufferedSince,
  }
  if (values.enduredUntil) payload.enduredUntil = values.enduredUntil
  else if (editing) payload.enduredUntil = null
  return payload
}

export default function SanityTab({ petId, canManage }) {
  return (
    <RecordCrud
      petId={petId}
      api={petSanityApi}
      canManage={canManage}
      emptyText="No hay enfermedades registradas."
      addLabel="Agregar enfermedad"
      modalTitle="enfermedad"
      deleteText={(record) => `¿Desea archivar el registro de "${record.illnessName}"?`}
      columns={COLUMNS}
      rules={RULES}
      fields={FIELDS}
      toFormValues={toFormValues}
      toPayload={toPayload}
      renderForm={({ values, handleChange, setValue, fieldError }) => (
        <CRow>
          <CCol xs={12}>
            <FormField name="illnessName" label="Enfermedad" value={values.illnessName} onChange={handleChange} error={fieldError('illnessName')} />
          </CCol>
          <CCol md={6}>
            <FormField
              name="sufferedSince"
              type="date"
              max={todayISO()}
              label="La padece desde"
              value={values.sufferedSince}
              onChange={handleChange}
              error={fieldError('sufferedSince')}
            />
          </CCol>
          <CCol md={6}>
            <FormField
              name="enduredUntil"
              type="date"
              label="Superada el (opcional)"
              helpText="Déjelo vacío si la enfermedad sigue activa."
              value={values.enduredUntil}
              onChange={handleChange}
              error={fieldError('enduredUntil')}
            />
          </CCol>
          <CCol xs={12} className="d-flex flex-wrap gap-4">
            <CFormSwitch id="isCronic" label="Crónica" checked={values.isCronic} onChange={(event) => setValue('isCronic', event.target.checked)} />
            <CFormSwitch id="isContagious" label="Contagiosa" checked={values.isContagious} onChange={(event) => setValue('isContagious', event.target.checked)} />
          </CCol>
        </CRow>
      )}
    />
  )
}
