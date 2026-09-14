import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Welcome from './pages/Welcome.jsx'
import DashboardStudent from './pages/DashboardStudent.jsx'
import DashboardStaff from './pages/DashboardStaff.jsx'
import DashboardAdmin from './pages/DashboardAdmin.jsx'
import { Protected, useAuth, AuthProvider } from './auth/AuthContext.jsx'

function Nav() {
  const { user, logout, deleteAccount } = useAuth()
  const location = useLocation()
  const isWelcomePage = location.pathname === '/'
  const isLoginPage = location.pathname === '/login'
  const isSignupPage = location.pathname === '/signup'
  const isForgotPage = location.pathname === '/forgot-password'
  const isResetPage = location.pathname === '/reset-password'
  
  if (isWelcomePage || isLoginPage || isSignupPage || isForgotPage || isResetPage) return null
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border-b">
      <Link to="/" className="font-semibold">Smart Food Waste</Link>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{user.role}</span>
            <button className="text-sm text-red-600" onClick={() => {
              if (confirm('Delete your account? This cannot be undone.')) deleteAccount()
            }}>Delete account</button>
            <button className="text-sm text-blue-600" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="text-sm" to="/login">Login</Link>
            <Link className="text-sm" to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  )
}

function RoutesInner() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/student" element={<Protected roles={["student","staff","admin"]}><div className="p-4 max-w-6xl w-full mx-auto"><DashboardStudent /></div></Protected>} />
      <Route path="/staff" element={<Protected roles={["staff","admin"]}><div className="p-4 max-w-6xl w-full mx-auto"><DashboardStaff /></div></Protected>} />
      <Route path="/admin" element={<Protected roles={["admin"]}><div className="p-4 max-w-6xl w-full mx-auto"><DashboardAdmin /></div></Protected>} />
      <Route path="/" element={user ? (<Navigate to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/student'} replace />) : (<Welcome />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <RoutesInner />
      </div>
    </AuthProvider>
  )
}


