import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({ 
    email: 'admin@barberbook.com', 
    password: 'admin123' 
  })
  const [backendStatus, setBackendStatus] = React.useState('checking')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin', { replace: true })
    }
  }, [user, navigate])

  React.useEffect(() => {
    let cancelled = false
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) 
        })
        if (!cancelled) setBackendStatus(response.ok ? 'connected' : 'error')
      } catch (error) {
        if (!cancelled) setBackendStatus('disconnected')
      }
    }
    checkBackend()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || `Server returned ${res.status}`)
      }
      if (data.role !== 'admin') {
        throw new Error('Access denied. Admin only.')
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      window.location.href = '/dashboard/admin'
    } catch (error) {
      toast.error(error.message || 'Login failed')
      setIsSubmitting(false)
    }
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200'
      case 'disconnected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-secondary">Admin Login</h2>
          <p className="text-gray-600 mt-2">Platform administration access</p>
        </div>

        <div className={`border rounded-lg p-3 mb-6 flex items-start text-sm gap-2 ${getStatusColor()}`}>
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="leading-snug">
            {backendStatus === 'connected' && 'Backend connected'}
            {backendStatus === 'disconnected' && 'Backend not reachable. Open a new terminal, run: cd backend && npm run dev'}
            {backendStatus === 'checking' && 'Checking backend connection...'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin@barberbook.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Default: admin@barberbook.com / admin123</p>
          </div>
          <button type="submit" disabled={isSubmitting || backendStatus !== 'connected'} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Signing in...' : backendStatus === 'connected' ? 'Admin Sign In' : 'Waiting for backend...'}
          </button>
          {backendStatus !== 'connected' && (
            <p className="text-xs text-gray-500 mt-2">Run this in a new terminal:</p>
          )}
          {backendStatus !== 'connected' && (
            <code className="block bg-gray-100 p-2 rounded text-xs">cd backend && npm run dev</code>
          )}
        </form>

        <p className="text-center mt-6 text-gray-600">
          <Link to="/login" className="text-primary font-semibold hover:underline">Back to regular login</Link>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
