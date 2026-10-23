import { CButton, CForm, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'
import ApiErrorAlert from './ApiErrorAlert'

export default function FormModal({ visible, title, onClose, onSubmit, submitting, apiError, fields, submitLabel = 'Guardar', size, children }) {
  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size={size} backdrop={submitting ? 'static' : true}>
      <CForm onSubmit={onSubmit} noValidate>
        <CModalHeader closeButton={!submitting}>
          <CModalTitle>{title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ApiErrorAlert error={apiError} fields={fields} />
          {children}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </CButton>
          <CButton type="submit" color="primary" disabled={submitting}>
            {submitting && <CSpinner size="sm" className="me-2" />}
            {submitLabel}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}
