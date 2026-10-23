import { useRef, useState } from 'react'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilDescription, cilExternalLink, cilImage, cilTrash } from '@coreui/icons'
import useToast from './toast/useToast'
import ApiErrorAlert from './ApiErrorAlert'
import { ApiError, toApiError } from '../api/errors'
import { IMAGE_TYPES, MAX_FILE_SIZE, isPdfUrl } from '../api/files'

const formatsLabel = (types) => types.map((type) => type.split('/')[1]).join(', ')

export default function FileUpload({
  url,
  types = IMAGE_TYPES,
  canEdit = true,
  emptyLabel = 'Sin archivo',
  icon = cilImage,
  onUpload,
  onRemove,
  onChanged,
}) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [failedUrl, setFailedUrl] = useState(null)

  const run = async (action, request) => {
    setBusy(action)
    setError(null)
    try {
      const result = await request()
      toast.success(result.message)
      onChanged?.(result)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setBusy(null)
    }
  }

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!types.includes(file.type)) {
      setError(new ApiError({ message: `Tipo de archivo no permitido. Formatos aceptados: ${formatsLabel(types)}.` }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(new ApiError({ message: `El archivo no puede exceder los ${MAX_FILE_SIZE / (1024 * 1024)} MB.` }))
      return
    }
    run('upload', () => onUpload(file))
  }

  const isPdf = url && isPdfUrl(url)
  const expired = url && failedUrl === url

  return (
    <div>
      <div className="file-preview mb-2">
        {!url && (
          <div className="text-body-secondary text-center">
            <CIcon icon={icon} size="xl" className="mb-1" />
            <div className="small">{emptyLabel}</div>
          </div>
        )}
        {url && isPdf && (
          <a href={url} target="_blank" rel="noreferrer" className="text-center">
            <CIcon icon={cilDescription} size="xl" className="mb-1" />
            <div className="small">
              Ver PDF <CIcon icon={cilExternalLink} size="sm" />
            </div>
          </a>
        )}
        {url && !isPdf && !expired && (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt="" onError={() => setFailedUrl(url)} />
          </a>
        )}
        {expired && <div className="small text-body-secondary text-center px-2">No se pudo cargar la imagen. Recargue la página.</div>}
      </div>

      <ApiErrorAlert error={error} className="py-2 small" />

      {canEdit && (
        <div className="d-flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept={types.join(',')} className="d-none" onChange={handleFile} />
          <CButton color="primary" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={Boolean(busy)}>
            {busy === 'upload' ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilCloudUpload} className="me-1" />}
            {url ? 'Cambiar' : 'Subir'}
          </CButton>
          {url && (
            <CButton color="danger" variant="ghost" size="sm" onClick={() => run('remove', onRemove)} disabled={Boolean(busy)}>
              {busy === 'remove' ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilTrash} className="me-1" />}
              Quitar
            </CButton>
          )}
        </div>
      )}
      {canEdit && <div className="form-text">Formatos: {formatsLabel(types)}. Máximo 5 MB.</div>}
    </div>
  )
}
