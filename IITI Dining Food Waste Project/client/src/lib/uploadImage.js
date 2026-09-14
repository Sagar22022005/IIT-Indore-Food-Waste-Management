import { api } from './api.js'

/** Upload a single image via POST /uploads; returns secure URL or empty string. */
export async function uploadImageFile(file) {
  if (!file) return ''
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data?.url || ''
}
