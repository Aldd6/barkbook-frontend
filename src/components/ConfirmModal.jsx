import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'

export default function ConfirmModal({
  visible,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  color = 'primary',
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <CModal visible={visible} onClose={onClose} alignment="center" backdrop={loading ? 'static' : true}>
      <CModalHeader closeButton={!loading}>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{children}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </CButton>
        <CButton color={color} onClick={onConfirm} disabled={loading}>
          {loading && <CSpinner size="sm" className="me-2" />}
          {confirmLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
