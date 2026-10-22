import { useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'

// Foto redonda a partir de una URL firmada de S3. Si no hay foto, o la URL ya caduco
// (duran 1 hora), muestra el icono en su lugar.
export default function Avatar({ src, alt = '', icon = cilUser, size = '2.25rem', className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = src && failedSrc !== src

  return (
    <span className={`app-avatar ${className}`} style={{ width: size, height: size }}>
      {showImage ? <img src={src} alt={alt} onError={() => setFailedSrc(src)} /> : <CIcon icon={icon} />}
    </span>
  )
}
