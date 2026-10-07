import { useCallback, useMemo, useRef, useState } from 'react'
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react'
import ToastContext from './ToastContext'

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const nextId = useRef(0)

  const show = useCallback((color, message) => {
    nextId.current += 1
    const id = nextId.current
    setToast(
      <CToast key={id} autohide delay={5000} color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{message}</CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>,
    )
  }, [])

  const value = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('danger', message),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <CToaster push={toast} placement="top-end" className="p-3" />
    </ToastContext.Provider>
  )
}
