import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { MESS_OPTIONS } from '../lib/constants.js'

export default function Signup() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [mess, setMess] = useState(MESS_OPTIONS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signup({ name, email, password, role, mess: role === 'staff' ? mess : undefined })
      nav('/')
    } catch (err) {
      setError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Signup</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full border p-2 rounded" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {role === 'staff' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mess assignment</label>
            <select className="w-full border p-2 rounded" value={mess} onChange={e=>setMess(e.target.value)}>
              {MESS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
        <button disabled={loading || (role === 'staff' && !mess)} className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50">{loading?'Creating...':'Create account'}</button>
      </form>
    </div>
  )
}






