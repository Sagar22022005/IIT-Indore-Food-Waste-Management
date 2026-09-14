import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../auth/AuthContext.jsx'
import UploadsPanel from '../components/UploadsPanel.jsx'
import ReportsPanel from '../components/ReportsPanel.jsx'
import ExportsPanel from '../components/ExportsPanel.jsx'
import { MenuManager } from '../components/MenuPanel.jsx'

function toDateInputValue(d) {
  return d.toISOString().slice(0, 10)
}

function computePresetRange(kind) {
  if (kind === 'all') return { from: '', to: '' }
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (kind === '30' ? 29 : 6))
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

function buildWasteParams(fromDate, toDate, filterMeal) {
  const params = {}
  if (fromDate) params.from = fromDate
  if (toDate) params.to = toDate
  if (filterMeal) params.meal = filterMeal
  return params
}

function filterSummary(preset, fromDate, toDate, filterMeal) {
  const mealPart = filterMeal ? ` · ${filterMeal}` : ''
  if (preset === 'all' && !fromDate && !toDate) return `Showing all dates${mealPart}`
  if (preset === '7') return `Showing last 7 days${mealPart}`
  if (preset === '30') return `Showing last 30 days${mealPart}`
  if (fromDate && toDate) return `Showing ${fromDate} → ${toDate}${mealPart}`
  if (fromDate) return `Showing from ${fromDate}${mealPart}`
  if (toDate) return `Showing until ${toDate}${mealPart}`
  return `Showing all dates${mealPart}`
}

export default function DashboardStaff() {
  const { user } = useAuth()
  const [itemName, setItemName] = useState('')
  const [meal, setMeal] = useState('lunch')
  const [quantityPreparedKg, setQty] = useState('')
  const [wasteKg, setWaste] = useState('')
  const [dryWasteKg, setDryWaste] = useState('')
  const [wetWasteKg, setWetWaste] = useState('')
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0,10))

  const [preset, setPreset] = useState('7')
  const [fromDate, setFromDate] = useState(() => computePresetRange('7').from)
  const [toDate, setToDate] = useState(() => computePresetRange('7').to)
  const [filterMeal, setFilterMeal] = useState('')
  const [weekly, setWeekly] = useState([])
  const [logs, setLogs] = useState([])
  const [tickets, setTickets] = useState([])
  const [feedback, setFeedback] = useState([])

  const submitWaste = async (e) => {
    e.preventDefault()
    await api.post('/waste', { 
      date: new Date(entryDate).toISOString(), 
      meal, 
      itemName, 
      quantityPreparedKg: Number(quantityPreparedKg), 
      wasteKg: Number(wasteKg),
      dryWasteKg: dryWasteKg ? Number(dryWasteKg) : 0,
      wetWasteKg: wetWasteKg ? Number(wetWasteKg) : 0
    })
    setItemName(''); setQty(''); setWaste(''); setDryWaste(''); setWetWaste('')
    loadData()
  }

  const applyPreset = (kind) => {
    setPreset(kind)
    const { from, to } = computePresetRange(kind)
    setFromDate(from)
    setToDate(to)
  }

  const loadData = async () => {
    try {
      const logsRes = await api.get('/waste', { params: buildWasteParams(fromDate, toDate, filterMeal) })
      setLogs(logsRes.data)
      // aggregate per day from fetched logs
      const map = new Map()
      logsRes.data.forEach(l => {
        const key = new Date(l.date).toISOString().slice(0,10)
        map.set(key, (map.get(key) || 0) + (l.wasteKg || 0))
      })
      const days = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([date, total])=>({ date, totalWasteKg: total }))
      setWeekly(days)
      // tickets (all) and feedback (all recent, like tickets)
      const [ticketsRes, feedbackRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/feedback')
      ])
      setTickets(ticketsRes.data)
      setFeedback(feedbackRes.data)
    } catch (e) {
      setLogs([]); setWeekly([]); setTickets([]); setFeedback([])
    }
  }

  useEffect(() => { loadData() }, [fromDate, toDate, filterMeal])

  // Poll for tickets and feedback updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [ticketsRes, feedbackRes] = await Promise.all([
          api.get('/tickets'),
          api.get('/feedback')
        ])
        setTickets(ticketsRes.data)
        setFeedback(feedbackRes.data)
      } catch (e) {
        // Silently fail on polling errors
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const markResolved = async (id) => {
    await api.patch(`/tickets/${id}/status`, { status: 'resolved' })
    await loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-blue-100">Manage waste logs, tickets, and feedback</p>
        {user?.role === 'staff' && user?.mess && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-blue-100 font-medium">Assigned Mess:</span>
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-6 py-3 shadow-lg">
              <span className="text-2xl font-bold text-white tracking-wide">{user.mess}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Waste Log Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add Waste Log</h2>
          </div>
          <form onSubmit={submitWaste} className="space-y-3">
            <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} />
            <select className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white" value={meal} onChange={e=>setMeal(e.target.value)}>
              <option>breakfast</option><option>lunch</option><option>dinner</option>
            </select>
            <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Item name" value={itemName} onChange={e=>setItemName(e.target.value)} />
            <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Prepared (kg)" type="number" step="0.01" value={quantityPreparedKg} onChange={e=>setQty(e.target.value)} />
            <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Total Waste (kg)" type="number" step="0.01" value={wasteKg} onChange={e=>setWaste(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none" placeholder="Dry Waste (kg)" type="number" step="0.01" value={dryWasteKg} onChange={e=>setDryWaste(e.target.value)} />
              <input className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none" placeholder="Wet Waste (kg)" type="number" step="0.01" value={wetWasteKg} onChange={e=>setWetWaste(e.target.value)} />
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              Save Waste Log
            </button>
          </form>
        </div>

        {/* Waste Trend Card */}
        <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Waste Trend</h2>
                <p className="text-sm text-gray-500 mt-0.5">{filterSummary(preset, fromDate, toDate, filterMeal)}</p>
              </div>
            </div>
          </div>
          <div className="h-64 bg-white rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="date" stroke="#6366f1" />
                <YAxis stroke="#6366f1" />
                <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '2px solid #6366f1', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="totalWasteKg" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Waste Logs Card */}
      <div className="md:col-span-2 bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Waste Logs</h2>
        </div>
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-1">Range:</span>
            {[
              { id: '7', label: '7 days' },
              { id: '30', label: '30 days' },
              { id: 'all', label: 'All' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  preset === id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPreset('custom') }}
            />
            <label className="text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPreset('custom') }}
            />
            <label className="text-sm font-medium text-gray-700 ml-1">Meal</label>
            <select
              className="border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm bg-white"
              value={filterMeal}
              onChange={(e) => setFilterMeal(e.target.value)}
            >
              <option value="">All meals</option>
              <option value="breakfast">breakfast</option>
              <option value="lunch">lunch</option>
              <option value="dinner">dinner</option>
            </select>
            <button
              className="ml-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              onClick={loadData}
              type="button"
            >
              Refresh
            </button>
          </div>
          <p className="text-sm text-gray-500">{filterSummary(preset, fromDate, toDate, filterMeal)} · {logs.length} log{logs.length === 1 ? '' : 's'}</p>
        </div>
        <div className="overflow-auto bg-white rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Meal</th>
                <th className="py-3 px-4 text-left font-semibold">Item</th>
                <th className="py-3 px-4 text-left font-semibold">Prepared (kg)</th>
                <th className="py-3 px-4 text-left font-semibold">Total Waste (kg)</th>
                <th className="py-3 px-4 text-left font-semibold">Dry Waste (kg)</th>
                <th className="py-3 px-4 text-left font-semibold">Wet Waste (kg)</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, idx) => (
                <tr key={l._id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="py-3 px-4 font-medium">{new Date(l.date).toISOString().slice(0,10)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">{l.meal}</span>
                  </td>
                  <td className="py-3 px-4 font-medium">{l.itemName}</td>
                  <td className="py-3 px-4">{l.quantityPreparedKg}</td>
                  <td className="py-3 px-4 font-semibold text-red-600">{l.wasteKg}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">{l.dryWasteKg || 0}</td>
                  <td className="py-3 px-4 font-semibold text-orange-600">{l.wetWasteKg || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors font-medium" onClick={async ()=>{
                        const nDate = prompt('Date (YYYY-MM-DD):', new Date(l.date).toISOString().slice(0,10))
                        if (!nDate) return
                        const nMeal = prompt('Meal (breakfast/lunch/dinner):', l.meal)
                        if (!nMeal) return
                        const nItem = prompt('Item name:', l.itemName)
                        if (!nItem) return
                        const nPrep = prompt('Prepared (kg):', String(l.quantityPreparedKg))
                        const nWaste = prompt('Total Waste (kg):', String(l.wasteKg))
                        const nDryWaste = prompt('Dry Waste (kg):', String(l.dryWasteKg || 0))
                        const nWetWaste = prompt('Wet Waste (kg):', String(l.wetWasteKg || 0))
                        await api.patch(`/waste/${l._id}`, { 
                          date: new Date(nDate).toISOString(), 
                          meal: nMeal, 
                          itemName: nItem, 
                          quantityPreparedKg: Number(nPrep), 
                          wasteKg: Number(nWaste),
                          dryWasteKg: Number(nDryWaste),
                          wetWasteKg: Number(nWetWaste)
                        })
                        await loadData()
                      }}>Edit</button>
                      <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors font-medium" onClick={async ()=>{
                        if (!confirm('Delete this waste log?')) return
                        await api.delete(`/waste/${l._id}`)
                        await loadData()
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Tickets and Feedback Section */}
      <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
        {/* Student Tickets Card */}
        <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Student Tickets</h2>
          </div>
          <div className="overflow-auto max-h-80 bg-white rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <th className="py-3 px-4 text-left font-semibold">Created</th>
                  <th className="py-3 px-4 text-left font-semibold">Category</th>
                  <th className="py-3 px-4 text-left font-semibold">Description</th>
                  <th className="py-3 px-4 text-left font-semibold">Photo</th>
                  <th className="py-3 px-4 text-left font-semibold">Mess</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, idx) => (
                  <tr key={t._id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                    <td className="py-3 px-4 text-xs text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">{t.category}</span>
                    </td>
                    <td className="py-3 px-4 truncate max-w-[220px]" title={t.description}>{t.description}</td>
                    <td className="py-3 px-4">
                      {t.imageUrl ? (
                        <a href={t.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{t.mess || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        t.status === 'resolved' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>{t.status}</span>
                      {t.status !== 'resolved' && (
                        <button className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors font-medium" onClick={()=>markResolved(t._id)}>✓ Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td className="py-8 text-center text-gray-500" colSpan={6}>No tickets available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Feedback Card */}
        <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl shadow-lg border border-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Student Feedback</h2>
          </div>
          <div className="overflow-auto max-h-80 bg-white rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-left font-semibold">Meal</th>
                  <th className="py-3 px-4 text-left font-semibold">Rating</th>
                  <th className="py-3 px-4 text-left font-semibold">Anonymous</th>
                  <th className="py-3 px-4 text-left font-semibold">Comments</th>
                  <th className="py-3 px-4 text-left font-semibold">Mess</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f, idx) => (
                  <tr key={f._id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-pink-50 transition-colors`}>
                    <td className="py-3 px-4 font-medium">{new Date(f.date).toISOString().slice(0,10)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">{f.meal}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 font-bold">{f.rating}</span>
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        f.isAnonymous 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>{f.isAnonymous ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-pre-wrap text-xs text-gray-600 max-w-[160px] truncate" title={f.comments || ''}>{f.comments || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{f.mess || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors font-medium" 
                        onClick={async () => {
                          if (!confirm('Delete this feedback?')) return
                          await api.delete(`/feedback/${f._id}`)
                          await loadData()
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {feedback.length === 0 && (
                  <tr><td className="py-8 text-center text-gray-500" colSpan={6}>No feedback available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Menu / Uploads / Reports / Exports */}
      <div className="grid md:grid-cols-2 gap-6">
        <MenuManager />
        <UploadsPanel />
      </div>
      <ReportsPanel />
      <ExportsPanel />
    </div>
  )
}


