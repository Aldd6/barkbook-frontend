import client from './client'

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf']

export const putFile = (url, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}

export const deleteFile = (url) => client.delete(url).then((r) => r.data)

export const isPdfUrl = (url) => {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}
