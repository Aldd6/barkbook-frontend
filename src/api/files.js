import client from './client'

// Archivos (fotos y documentos) en S3: multipart/form-data con un solo archivo en el campo "file".
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf']

// El client manda JSON por defecto y axios convertiria el FormData a JSON. Con multipart/form-data
// axios deja el FormData intacto y el navegador pone el Content-Type con su boundary.
export const putFile = (url, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}

export const deleteFile = (url) => client.delete(url).then((r) => r.data)

// Las URLs firmadas conservan la extension de la key (<carpeta>/<uuid>.pdf).
export const isPdfUrl = (url) => {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}
