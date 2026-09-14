import { useState } from 'react'
import SectionCard from './SectionCard.jsx'
import { downloadFromApi } from '../lib/download.js'

export default function ExportsPanel() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [meal, setMeal] = useState('')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  const params = () => {
    const p = {}
    if (from) p.from = from
    if (to) p.to = to
    if (meal) p.meal = meal
    return p
  }

  const download = async (kind) => {
    setErr('')
    setBusy(kind)
    try {
      const path = kind === 'waste' ? '/reports/export/waste.xlsx' : '/reports/export/feedback.xlsx'
      await downloadFromApi(path, {
        params: params(),
        fallbackFilename: kind === 'waste' ? 'waste.xlsx' : 'feedback.xlsx'
      })
    } catch (e) {
      setErr('Download failed (check permission: staff/admin only)')
    } finally {
      setBusy('')
    }
  }

  return (
    <SectionCard
      title="Excel Exports"
      subtitle="Download XLSX directly from backend"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H8l-4 4v10a2 2 0 002 2z" />
        </svg>
      }
      className="border-blue-100"
    >
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">From (optional)</div>
          <input
            type="date"
            className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">To (optional)</div>
          <input
            type="date"
            className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Meal (optional)</div>
          <select
            className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm bg-white"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          >
            <option value="">All meals</option>
            <option value="breakfast">breakfast</option>
            <option value="lunch">lunch</option>
            <option value="dinner">dinner</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => download('waste')}
          disabled={!!busy}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-300 disabled:to-purple-300 text-white font-semibold px-5 py-3 rounded-lg shadow-md"
        >
          {busy === 'waste' ? 'Downloading...' : 'Download Waste XLSX'}
        </button>
        <button
          type="button"
          onClick={() => download('feedback')}
          disabled={!!busy}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-pink-300 disabled:to-rose-300 text-white font-semibold px-5 py-3 rounded-lg shadow-md"
        >
          {busy === 'feedback' ? 'Downloading...' : 'Download Feedback XLSX'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFrom('')
            setTo('')
            setMeal('')
            setErr('')
          }}
          className="ml-auto bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-lg"
        >
          Clear filters
        </button>
      </div>

      {err ? <div className="text-sm text-red-600 mt-3">{err}</div> : null}
      <div className="text-xs text-gray-500 mt-2">Exports require staff/admin (per backend `requireRole`).</div>
    </SectionCard>
  )
}

