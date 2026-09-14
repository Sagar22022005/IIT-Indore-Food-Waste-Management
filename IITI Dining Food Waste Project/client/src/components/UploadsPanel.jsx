import { useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import SectionCard from './SectionCard.jsx'

export default function UploadsPanel() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')
  const [err, setErr] = useState('')

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const upload = async () => {
    setErr('')
    setUrl('')
    if (!file) {
      setErr('Select an image first')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const { data } = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUrl(data?.url || '')
    } catch (e) {
      setErr('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
  }

  return (
    <SectionCard
      title="Image Upload"
      subtitle="Upload a photo and get a URL (Cloudinary)"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      className="border-emerald-100"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
          />
          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-300 disabled:to-teal-300 text-white font-semibold px-4 py-3 rounded-lg shadow-md"
          >
            {uploading ? 'Uploading...' : 'Upload image'}
          </button>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          {url ? (
            <div className="bg-white border rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Uploaded URL</div>
              <div className="flex items-center gap-2">
                <input className="w-full border p-2 rounded text-sm" value={url} readOnly />
                <button className="text-sm bg-slate-900 text-white px-3 py-2 rounded" type="button" onClick={copy}>
                  Copy
                </button>
              </div>
              <div className="mt-2">
                <a className="text-sm text-blue-600 hover:underline" href={url} target="_blank" rel="noreferrer">
                  Open in new tab
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white border rounded-lg p-3 min-h-[180px] flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img alt="preview" src={previewUrl} className="max-h-56 object-contain rounded" />
          ) : (
            <div className="text-sm text-gray-500">Select an image to preview.</div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

