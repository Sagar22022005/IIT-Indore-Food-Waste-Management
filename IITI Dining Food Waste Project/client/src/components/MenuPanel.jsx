import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { uploadImageFile } from '../lib/uploadImage.js'
import SectionCard from './SectionCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

function emptyItem() {
  return { name: '', description: '', price: '', imageUrl: '' }
}

export function MenuViewer({ compact = false } = {}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [meal, setMeal] = useState('lunch')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = async () => {
    setErr('')
    setLoading(true)
    try {
      const { data } = await api.get('/menu', { params: { date, meal } })
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setRows([])
      setErr('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, meal])

  const items = useMemo(() => {
    const doc = rows?.[0]
    return Array.isArray(doc?.items) ? doc.items : []
  }, [rows])

  return (
    <SectionCard
      title="Menu"
      subtitle="View menu by date and meal"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      }
      className={compact ? 'p-5' : ''}
    >
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input
          type="date"
          className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none text-sm bg-white"
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
        >
          <option value="breakfast">breakfast</option>
          <option value="lunch">lunch</option>
          <option value="dinner">dinner</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md"
        >
          Refresh
        </button>
      </div>

      {err ? <div className="text-sm text-red-600 mb-3">{err}</div> : null}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                <th className="py-3 px-4 text-left font-semibold">Item</th>
                <th className="py-3 px-4 text-left font-semibold">Description</th>
                <th className="py-3 px-4 text-left font-semibold">Price</th>
                <th className="py-3 px-4 text-left font-semibold">Image</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((it, idx) => (
                  <tr key={`${it.name}-${idx}`} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 font-medium">{it.name}</td>
                    <td className="py-3 px-4 text-gray-700 whitespace-pre-wrap">{it.description || '-'}</td>
                    <td className="py-3 px-4">{typeof it.price === 'number' ? `₹${it.price}` : it.price ? `₹${it.price}` : '-'}</td>
                    <td className="py-3 px-4">
                      {it.imageUrl ? (
                        <a className="text-blue-600 hover:underline" href={it.imageUrl} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No menu items for this date/meal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  )
}

export function MenuManager() {
  const { user } = useAuth()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [meal, setMeal] = useState('lunch')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState([emptyItem()])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [uploadingIdx, setUploadingIdx] = useState(null)

  const canEdit = user?.role === 'staff' || user?.role === 'admin'

  const load = async () => {
    setMsg('')
    setErr('')
    setLoading(true)
    try {
      const { data } = await api.get('/menu', { params: { date, meal } })
      const doc = Array.isArray(data) ? data[0] : null
      const list = Array.isArray(doc?.items) && doc.items.length ? doc.items : [emptyItem()]
      setItems(
        list.map((it) => ({
          name: it.name ?? '',
          description: it.description ?? '',
          price: typeof it.price === 'number' ? String(it.price) : it.price ? String(it.price) : '',
          imageUrl: it.imageUrl ?? ''
        }))
      )
    } catch (e) {
      setItems([emptyItem()])
      setErr('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, meal])

  const addRow = () => setItems((p) => [...p, emptyItem()])
  const removeRow = (idx) => setItems((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)))
  const update = (idx, key, value) => setItems((p) => p.map((r, i) => (i === idx ? { ...r, [key]: value } : r)))

  const uploadRowPhoto = async (idx, file) => {
    if (!canEdit || !file) return
    setErr('')
    setUploadingIdx(idx)
    try {
      const url = await uploadImageFile(file)
      if (url) update(idx, 'imageUrl', url)
      else setErr('Upload returned no URL')
    } catch {
      setErr('Photo upload failed')
    } finally {
      setUploadingIdx(null)
    }
  }

  const save = async () => {
    if (!canEdit) return
    setMsg('')
    setErr('')
    const cleaned = items
      .map((it) => ({
        name: String(it.name || '').trim(),
        description: String(it.description || '').trim(),
        price: it.price === '' ? undefined : Number(it.price),
        imageUrl: String(it.imageUrl || '').trim()
      }))
      .filter((it) => it.name)

    if (!cleaned.length) {
      setErr('Add at least one item with a name')
      return
    }
    setSaving(true)
    try {
      await api.put('/menu', { date: new Date(date).toISOString(), meal, items: cleaned })
      setMsg('Menu saved')
      await load()
    } catch (e) {
      setErr('Failed to save menu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard
      title="Menu Manager"
      subtitle="Staff/Admin: create or update menu for a date + meal"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      }
      className="border-indigo-100"
    >
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input
          type="date"
          className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm bg-white"
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
        >
          <option value="breakfast">breakfast</option>
          <option value="lunch">lunch</option>
          <option value="dinner">dinner</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md"
        >
          Load
        </button>
      </div>

      {msg ? <div className="text-sm text-green-700 mb-3">{msg}</div> : null}
      {err ? <div className="text-sm text-red-600 mb-3">{err}</div> : null}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Description</th>
                <th className="py-3 px-4 text-left font-semibold">Price</th>
                <th className="py-3 px-4 text-left font-semibold">Photo</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 align-top">
                      <input
                        disabled={!canEdit}
                        className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                        value={it.name}
                        onChange={(e) => update(idx, 'name', e.target.value)}
                        placeholder="Item name"
                      />
                    </td>
                    <td className="py-2 px-3 align-top">
                      <textarea
                        disabled={!canEdit}
                        className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm resize-none"
                        rows={2}
                        value={it.description}
                        onChange={(e) => update(idx, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 px-3 align-top">
                      <input
                        disabled={!canEdit}
                        className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                        type="number"
                        step="0.01"
                        value={it.price}
                        onChange={(e) => update(idx, 'price', e.target.value)}
                        placeholder="e.g. 25"
                      />
                    </td>
                    <td className="py-2 px-3 align-top min-w-[200px]">
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!canEdit || uploadingIdx === idx}
                          className="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) uploadRowPhoto(idx, f)
                            e.target.value = ''
                          }}
                        />
                        {uploadingIdx === idx ? (
                          <div className="text-xs text-indigo-600">Uploading…</div>
                        ) : null}
                        <input
                          disabled={!canEdit}
                          className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-xs"
                          value={it.imageUrl}
                          onChange={(e) => update(idx, 'imageUrl', e.target.value)}
                          placeholder="Or paste image URL"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!canEdit || items.length <= 1}
                          onClick={() => removeRow(idx)}
                          className="text-xs bg-red-500 disabled:bg-red-200 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors font-medium"
                        >
                          Remove
                        </button>
                        {it.imageUrl ? (
                          <a className="text-xs text-blue-600 hover:underline" href={it.imageUrl} target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <button
          type="button"
          disabled={!canEdit}
          onClick={addRow}
          className="bg-white border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add item
        </button>
        <button
          type="button"
          disabled={!canEdit || saving}
          onClick={save}
          className="ml-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-indigo-300 disabled:to-blue-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md"
        >
          {saving ? 'Saving...' : 'Save menu'}
        </button>
      </div>
      {!canEdit ? <div className="text-xs text-gray-500 mt-2">You don’t have permission to edit menu.</div> : null}
    </SectionCard>
  )
}

