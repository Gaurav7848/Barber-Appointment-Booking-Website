import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Star, Users, TrendingUp, Scissors, Settings, LogOut } from 'lucide-react'

const OrganizationDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = React.useState('overview')
  const [stats, setStats] = React.useState({
    todayAppointments: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    averageRating: 0,
  })
  const [appointments, setAppointments] = React.useState([])
  const [barbers, setBarbers] = React.useState([])
  const [services, setServices] = React.useState([])
  const [reviews, setReviews] = React.useState([])

  React.useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const orgRes = await fetch('/api/organizations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const orgs = await orgRes.json()
      const myOrg = orgs.find(o => o.ownerId?._id === user?._id || o.ownerId === user?._id)
      
      if (myOrg) {
        const aptRes = await fetch(`/api/appointments/organization/${myOrg._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        const apts = await aptRes.json()
        setAppointments(apts)
        
        const today = new Date().toDateString()
        const todayApts = apts.filter(a => new Date(a.date).toDateString() === today)
        
        setStats({
          todayAppointments: apts.length,
          completed: apts.filter(a => a.status === 'completed').length,
          pending: apts.filter(a => a.status === 'pending').length,
          cancelled: apts.filter(a => ['cancelled', 'rejected'].includes(a.status)).length,
          todayRevenue: todayApts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.amount || 0), 0),
          monthlyRevenue: apts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.amount || 0), 0),
          totalCustomers: new Set(apts.map(a => a.userId?._id || a.userId)).size,
          averageRating: myOrg.rating || 4.7,
        })
        
        const barberRes = await fetch(`/api/barbers/organization/${myOrg._id}`)
        setBarbers(await barberRes.json())
        
        const serviceRes = await fetch(`/api/services/organization/${myOrg._id}`)
        setServices(await serviceRes.json())
        
        const reviewRes = await fetch(`/api/reviews/organization/${myOrg._id}`)
        setReviews(await reviewRes.json())
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">All Appointments</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Barber</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{apt.userId?.name || 'Customer'}</td>
                      <td className="py-3 px-4">{apt.serviceId?.name || 'Service'}</td>
                      <td className="py-3 px-4">{apt.barberId?.name || 'Any'}</td>
                      <td className="py-3 px-4">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{apt.timeSlot?.start || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">₹{apt.amount || 0}</td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'barbers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Barbers / Staff</h3>
              <button className="btn-primary text-sm">+ Add Barber</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      {barber.avatar ? <img src={barber.avatar} alt={barber.name} className="w-full h-full rounded-full object-cover" /> : <Users className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{barber.name}</h4>
                      <p className="text-sm text-gray-600">{barber.specialization}</p>
                      <p className="text-xs text-gray-500">{barber.experience} years experience</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                      <span className="text-sm">{barber.rating || 'New'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${barber.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {barber.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              ))}
              {barbers.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No barbers added yet</p>}
            </div>
          </div>
        )
      case 'services':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Services</h3>
              <button className="btn-primary text-sm">+ Add Service</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.category}</p>
                    </div>
                    <span className="text-primary font-bold">₹{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{service.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{service.duration} min</span>
                    <span className={`px-2 py-1 rounded text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No services added yet</p>}
            </div>
          </div>
        )
      case 'reviews':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-semibold">{review.userId?.name || 'Customer'}</span>
                    <span className="text-gray-500 text-sm ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Organization Settings</h3>
            <form className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Your Shop Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contact Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <button type="button" className="btn-primary">Save Settings</button>
            </form>
          </div>
        )
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Appointments</p>
                  <p className="text-3xl font-bold text-secondary">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <Clock className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-primary">₹{stats.monthlyRevenue}</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Rating</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.averageRating}</p>
                </div>
                <Star className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
          </div>
        )
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'barbers', label: 'Barbers / Staff', icon: Users },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-gray-300 mt-2">Welcome back, {user?.name}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="lg:col-span-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationDashboard
