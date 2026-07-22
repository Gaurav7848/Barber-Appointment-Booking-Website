import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const [step, setStep] = React.useState(1)
  const [email, setEmail] = React.useState('')
  const [resetToken, setResetToken] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.resetToken) {
          setResetToken(data.resetToken)
          setStep(3)
          toast.success('Reset token generated (development mode)')
        } else {
          toast.success('Reset link sent to your email')
          setStep(2)
        }
      } else {
        toast.error(data.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = resetToken || prompt('Enter reset token from email:')
      if (!token) { toast.error('Reset token is required'); setLoading(false); return }
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password reset successfully! Please login.')
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Enter your email to receive a reset link' : step === 2 ? 'Check your email for reset link' : 'Set your new password'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">If an account with that email exists, we sent a password reset link. Please check your email and click the link to reset your password.</p>
            <p className="text-sm text-gray-500">In development mode, check the server console for the reset link.</p>
            <Link to="/login" className="btn-primary block text-center">Back to Sign In</Link>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {!resetToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Paste token from console/email"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5">
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Remember your password? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
