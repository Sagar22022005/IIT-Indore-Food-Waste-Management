import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import SectionCard from './SectionCard.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsPanel() {
  const [weekly, setWeekly] = useState([])
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setErr('')
    setLoading(true)
    try {
      const [w, t] = await Promise.all([api.get('/reports/weekly'), api.get('/reports/monthly-top-wasted')])
      setWeekly(Array.isArray(w.data) ? w.data : [])
      setTop(Array.isArray(t.data) ? t.data : [])
    } catch (e) {
      setWeekly([])
      setTop([])
      setErr('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const weeklyChart = useMemo(
    () => weekly.map((r) => ({ date: r._id, totalWasteKg: r.totalWasteKg })),
    [weekly]
  )
  const topChart = useMemo(
    () => top.map((r) => ({ item: r._id, totalWasteKg: r.totalWasteKg })),
    [top]
  )

  return (
    <SectionCard
      title="Reports"
      subtitle="Staff/Admin analytics from backend aggregations"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4m3 4v-8m3 8V7m3 10V5M4 19h16" />
        </svg>
      }
      className="border-purple-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={load}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold text-gray-800 mb-2">Weekly waste (last 7 days)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="totalWasteKg" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold text-gray-800 mb-2">Top wasted items (this month)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topChart} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey="item" width={120} stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="totalWasteKg" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

