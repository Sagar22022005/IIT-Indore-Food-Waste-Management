import { api } from './api.js'

function getFilenameFromDisposition(disposition) {
  // Content-Disposition: attachment; filename="waste.xlsx"
  if (!disposition) return null
  const m = /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(disposition)
  if (!m) return null
  try {
    return decodeURIComponent(m[1])
  } catch {
    return m[1]
  }
}

export async function downloadFromApi(path, { params, fallbackFilename } = {}) {
  const res = await api.get(path, { params, responseType: 'blob' })
  const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = getFilenameFromDisposition(res.headers['content-disposition']) || fallbackFilename || 'download'
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

