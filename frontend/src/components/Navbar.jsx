import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, X, User, Scissors, LogOut, Shield, Bell, Heart } from 'lucide-react'
import { logout } from '../features/auth/authSlice'
import notificationAPI from '../utils/notificationAPI'

const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    if (user) {
      notificationAPI.getUnread()
        .then(data => {
          const count = data.notifications?.length || data.count || 0
          setUnreadCount(count)
        })
        .catch(() => {})
    }
  }, [user])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setIsOpen(false)
  }

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
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
            <button onClick={() => scrollTo('home')} className="text-secondary hover:text-primary transition-colors">Home</button>
            <button onClick={() => scrollTo('about')} className="text-secondary hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollTo('services')} className="text-secondary hover:text-primary transition-colors">Services</button>
            <button onClick={() => scrollTo('features')} className="text-secondary hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollTo('contact')} className="text-secondary hover:text-primary transition-colors">Contact Us</button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={`/dashboard/${user.role}`} className="flex items-center space-x-2 text-secondary hover:text-primary">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">Login</Link>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('home')} className="block text-secondary hover:text-primary">Home</button>
            <button onClick={() => scrollTo('about')} className="block text-secondary hover:text-primary">About</button>
            <button onClick={() => scrollTo('services')} className="block text-secondary hover:text-primary">Services</button>
            <button onClick={() => scrollTo('features')} className="block text-secondary hover:text-primary">Features</button>
            <button onClick={() => scrollTo('contact')} className="block text-secondary hover:text-primary">Contact Us</button>
            {user ? (
              <>
                <Link to={`/dashboard/${user.role}`} className="block text-secondary hover:text-primary" onClick={() => setIsOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="block text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-secondary hover:text-primary" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block text-primary font-semibold" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
