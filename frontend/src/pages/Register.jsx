import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../features/auth/authSlice'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', password: '', role: 'customer' })
  const [otp, setOtp] = React.useState('')
  const [step, setStep] = React.useState(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      try {
        const res = await dispatch(register(formData)).unwrap()
        toast.success('Registration successful!')
        navigate(`/dashboard/${res.role}`)
      } catch (error) {
        toast.error(error.message || 'Registration failed')
      }
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('OTP sent successfully!')
        setStep(2)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Email verified! Please complete registration.')
        setStep(1)
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our platform today</p>
        </div>

        {step === 1 && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5">
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="customer">Customer</option>
                  <option value="organization">Barber / Salon Owner</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4">
              <button type="button" onClick={handleSendOtp} className="w-full btn-secondary">
                Verify Email with OTP
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter OTP"
              />
            </div>
            <button type="submit" className="w-full btn-primary">Verify OTP</button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-gray-600 hover:text-primary">Back to Registration</button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
