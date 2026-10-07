import { CBadge, CButton, CCol, CFormSwitch, CRow } from '@coreui/react'
import RecordCrud from './RecordCrud'
import FormField from '../../../components/FormField'
import EnumSelect from '../../../components/EnumSelect'
import { petDietsApi } from '../../../api/petRecords'
import { DIET_TYPE_LABELS, DIET_TYPE_OPTIONS, UNIT_MEASURE_SERVING_PET_LABELS, UNIT_MEASURE_SERVING_PET_OPTIONS } from '../../../constants/enums'
import { integerBetween, maxLength, positiveNumber, required } from '../../../utils/validators'

const FIELDS = ['dietType', 'timesToEatAday', 'servings', 'unitOfMeasureServing', 'observations', 'activeDiet']

const RULES = {
  dietType: [required('Seleccione el tipo de dieta.')],
  timesToEatAday: [required('Ingrese cuántas veces come al día.'), integerBetween(1, undefined, 'Las veces al dia que come la mascota deben ser al menos 1.')],
  servings: [required('Ingrese la porción.'), positiveNumber('La porcion debe ser mayor a 0.')],
  unitOfMeasureServing: [required('Seleccione la unidad de la porción.')],
  observations: [maxLength(500, 'Las observaciones no pueden exceder los 500 caracteres.')],
}

const COLUMNS = [
  { header: 'Tipo', render: (diet) => DIET_TYPE_LABELS[diet.dietType] },
  { header: 'Veces al día', render: (diet) => diet.timesToEatAday },
  { header: 'Porción', render: (diet) => `${diet.servings} ${UNIT_MEASURE_SERVING_PET_LABELS[diet.unitOfMeasureServing]?.toLowerCase()}` },
  { header: 'Observaciones', render: (diet) => diet.observations || '—' },
  {
    header: 'Estado',
    render: (diet) => <CBadge color={diet.activeDiet ? 'success' : 'secondary'}>{diet.activeDiet ? 'Activa' : 'Inactiva'}</CBadge>,
  },
]

const toFormValues = (diet) => ({
  dietType: diet?.dietType ?? '',
  timesToEatAday: diet ? String(diet.timesToEatAday) : '',
  servings: diet ? String(diet.servings) : '',
  unitOfMeasureServing: diet?.unitOfMeasureServing ?? '',
  observations: diet?.observations ?? '',
  activeDiet: true,
})

// activeDiet solo se envia al crear; despues se cambia con activar/desactivar.
const toPayload = (values, { editing }) => {
  const payload = {
    dietType: values.dietType,
    timesToEatAday: Number(values.timesToEatAday),
    servings: Number(values.servings),
    unitOfMeasureServing: values.unitOfMeasureServing,
  }
  if (values.observations.trim()) payload.observations = values.observations.trim()
  if (!editing) payload.activeDiet = values.activeDiet
  return payload
}

export default function DietsTab({ petId, canManage }) {
  return (
    <RecordCrud
      petId={petId}
      api={petDietsApi}
      canManage={canManage}
      emptyText="No hay dietas registradas."
      addLabel="Agregar dieta"
      modalTitle="dieta"
      deleteText={(diet) => `¿Desea archivar la dieta "${DIET_TYPE_LABELS[diet.dietType]}"?`}
      columns={COLUMNS}
      rules={RULES}
      fields={FIELDS}
      toFormValues={toFormValues}
      toPayload={toPayload}
      renderExtraActions={(diet, runAction) => (
        <CButton
          color={diet.activeDiet ? 'secondary' : 'success'}
          variant="ghost"
          size="sm"
          onClick={() => runAction(() => (diet.activeDiet ? petDietsApi.deactivate(diet.id) : petDietsApi.activate(diet.id)))}
        >
          {diet.activeDiet ? 'Desactivar' : 'Activar'}
        </CButton>
      )}
      renderForm={({ values, handleChange, setValue, fieldError }, { editing }) => (
        <CRow>
          <CCol xs={12}>
            <EnumSelect name="dietType" label="Tipo de dieta" options={DIET_TYPE_OPTIONS} value={values.dietType} onChange={handleChange} error={fieldError('dietType')} />
          </CCol>
          <CCol md={4}>
            <FormField
              name="timesToEatAday"
              type="number"
              min="1"
              step="1"
              label="Veces al día"
              value={values.timesToEatAday}
              onChange={handleChange}
              error={fieldError('timesToEatAday')}
            />
          </CCol>
          <CCol md={4}>
            <FormField name="servings" type="number" min="0" step="0.01" label="Porción" value={values.servings} onChange={handleChange} error={fieldError('servings')} />
          </CCol>
          <CCol md={4}>
            <EnumSelect
              name="unitOfMeasureServing"
              label="Unidad"
              options={UNIT_MEASURE_SERVING_PET_OPTIONS}
              value={values.unitOfMeasureServing}
              onChange={handleChange}
              error={fieldError('unitOfMeasureServing')}
            />
          </CCol>
          <CCol xs={12}>
            <FormField
              name="observations"
              label="Observaciones (opcional)"
              multiline
              rows={3}
              value={values.observations}
              onChange={handleChange}
              error={fieldError('observations')}
            />
          </CCol>
          {!editing && (
            <CCol xs={12}>
              <CFormSwitch id="activeDiet" label="Dieta activa" checked={values.activeDiet} onChange={(event) => setValue('activeDiet', event.target.checked)} />
            </CCol>
          )}
        </CRow>
      )}
    />
  )
}
