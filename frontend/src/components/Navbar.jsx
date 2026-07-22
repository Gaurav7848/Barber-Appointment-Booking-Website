import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, X, User, Scissors, LogOut, Shield } from 'lucide-react'
import { logout } from '../features/auth/authSlice'

const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setIsOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-secondary">BarberBook</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-secondary hover:text-primary transition-colors">Find Barbers</Link>
            <Link to="/how-it-works" className="text-secondary hover:text-primary transition-colors">How It Works</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={`/dashboard/${user.role}`} className="flex items-center space-x-2 text-secondary hover:text-primary">
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin-login" className="flex items-center space-x-2 text-primary hover:text-primary">
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-secondary hover:text-primary">Sign In</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </div>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
