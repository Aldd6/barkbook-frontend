import { useContext } from 'react'
import ToastContext from './ToastContext'

// toast.success(message) / toast.error(message): para los mensajes de la API tras una accion.
export default function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>.')
  return context
}
