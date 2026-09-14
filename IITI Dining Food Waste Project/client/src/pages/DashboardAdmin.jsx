import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { MESS_OPTIONS } from '../lib/constants.js'
import ReportsPanel from '../components/ReportsPanel.jsx'
import ExportsPanel from '../components/ExportsPanel.jsx'
import { MenuManager } from '../components/MenuPanel.jsx'
import UploadsPanel from '../components/UploadsPanel.jsx'

export default function DashboardAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateUser = async (id, payload) => {
    await api.patch(`/admin/users/${id}/role`, payload)
    await load()
  }

  if (loading) return <div>Loading...</div>
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-black rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-200">Manage users and view system analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <MenuManager />
        <UploadsPanel />
      </div>
      <ReportsPanel />
      <ExportsPanel />

      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Users</h2>
            <p className="text-sm text-gray-600">Manage roles and staff mess assignment</p>
          </div>
        </div>

        <div className="overflow-auto bg-white rounded-lg border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-left font-semibold">Mess</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u._id} className={`border-b last:border-b-0 ${idx % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-700">{u.email}</td>
                  <td className="py-3 px-4">
                    <select className="border-2 border-gray-200 p-2 rounded-lg bg-white" value={u.role} onChange={e=>updateUser(u._id, { role: e.target.value })}>
                      <option value="student">student</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {u.role === 'staff' ? (
                      <select className="border-2 border-gray-200 p-2 rounded-lg bg-white" value={u.mess || ''} onChange={e=>updateUser(u._id, { mess: e.target.value })}>
                        <option value="" disabled>Select mess</option>
                        {MESS_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No users</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}






