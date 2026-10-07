import { CCol, CRow } from '@coreui/react'
import RecordCrud from './RecordCrud'
import FormField from '../../../components/FormField'
import EnumSelect from '../../../components/EnumSelect'
import { petVaccinesApi } from '../../../api/petRecords'
import { VACCINE_USE_LABELS, VACCINE_USE_OPTIONS } from '../../../constants/enums'
import { date, maxLength, minLength, notFuture, required } from '../../../utils/validators'
import { formatDate, todayISO } from '../../../utils/format'

const FIELDS = ['vaccineName', 'vaccineUse', 'dateOfPlacement']

const RULES = {
  vaccineName: [
    required('Ingrese el nombre de la vacuna.'),
    minLength(2, 'El nombre de la vacuna debe tener al menos 2 caracteres.'),
    maxLength(150, 'El nombre de la vacuna no puede exceder los 150 caracteres.'),
  ],
  vaccineUse: [required('Seleccione el uso de la vacuna.')],
  dateOfPlacement: [required('Ingrese la fecha de colocación.'), date, notFuture('La fecha de colocacion no puede ser en el futuro.')],
}

const COLUMNS = [
  { header: 'Vacuna', render: (record) => record.vaccineName },
  { header: 'Uso', render: (record) => VACCINE_USE_LABELS[record.vaccineUse] },
  { header: 'Fecha de colocación', render: (record) => formatDate(record.dateOfPlacement) },
]

const toFormValues = (record) => ({
  vaccineName: record?.vaccineName ?? '',
  vaccineUse: record?.vaccineUse ?? '',
  dateOfPlacement: record?.dateOfPlacement ?? '',
})

const toPayload = (values) => ({
  vaccineName: values.vaccineName.trim(),
  vaccineUse: values.vaccineUse,
  dateOfPlacement: values.dateOfPlacement,
})

export default function VaccinesTab({ petId, canManage }) {
  return (
    <RecordCrud
      petId={petId}
      api={petVaccinesApi}
      canManage={canManage}
      emptyText="No hay vacunas registradas."
      addLabel="Agregar vacuna"
      modalTitle="vacuna"
      deleteText={(record) => `¿Desea archivar el registro de la vacuna "${record.vaccineName}"?`}
      columns={COLUMNS}
      rules={RULES}
      fields={FIELDS}
      toFormValues={toFormValues}
      toPayload={toPayload}
      renderForm={({ values, handleChange, fieldError }) => (
        <CRow>
          <CCol xs={12}>
            <FormField name="vaccineName" label="Vacuna" value={values.vaccineName} onChange={handleChange} error={fieldError('vaccineName')} />
          </CCol>
          <CCol md={6}>
            <EnumSelect name="vaccineUse" label="Uso" options={VACCINE_USE_OPTIONS} value={values.vaccineUse} onChange={handleChange} error={fieldError('vaccineUse')} />
          </CCol>
          <CCol md={6}>
            <FormField
              name="dateOfPlacement"
              type="date"
              max={todayISO()}
              label="Fecha de colocación"
              value={values.dateOfPlacement}
              onChange={handleChange}
              error={fieldError('dateOfPlacement')}
            />
          </CCol>
        </CRow>
      )}
    />
  )
}
