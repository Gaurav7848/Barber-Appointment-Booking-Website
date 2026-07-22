import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { Shield, Users, Store, Calendar, DollarSign, Star, TrendingUp, LogOut, Settings } from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = React.useState('overview')
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalOrganizations: 0,
    pendingOrganizations: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalReviews: 0,
  })
  const [recentAppointments, setRecentAppointments] = React.useState([])
  const [recentOrganizations, setRecentOrganizations] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [organizations, setOrganizations] = React.useState([])
  const [reviews, setReviews] = React.useState([])

  React.useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
        setRecentAppointments(data.recentAppointments || [])
        setRecentOrganizations(data.recentOrganizations || [])
      }
      
      const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const usersData = await usersRes.json()
      setUsers(usersData)
      
      const orgsRes = await fetch('/api/admin/organizations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const orgsData = await orgsRes.json()
      setOrganizations(orgsData)
      
      const reviewsRes = await fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const reviewsData = await reviewsRes.json()
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const verifyOrganization = async (id) => {
    await fetch(`/api/admin/organizations/${id}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadAdminData()
  }

  const rejectOrganization = async (id) => {
    await fetch(`/api/admin/organizations/${id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadAdminData()
  }

  const suspendOrganization = async (id) => {
    await fetch(`/api/admin/organizations/${id}/suspend`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadAdminData()
  }

  const deleteReview = async (id) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadAdminData()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'organization' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'organizations':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Organization Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Owner</th>
                    <th className="text-left py-3 px-4">City</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Rating</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{org.name}</td>
                      <td className="py-3 px-4">{org.ownerId?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{org.city}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          org.status === 'approved' ? 'bg-green-100 text-green-800' :
                          org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          org.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{org.rating || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {org.status === 'pending' && (
                            <>
                              <button onClick={() => verifyOrganization(org._id)} className="text-green-600 hover:text-green-700 text-sm">Verify</button>
                              <button onClick={() => rejectOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Reject</button>
                            </>
                          )}
                          {org.status === 'approved' && (
                            <button onClick={() => suspendOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Suspend</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Appointment Monitoring</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Organization</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{apt.userId?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{apt.organizationId?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{apt.serviceId?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'reviews':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Review Moderation</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-semibold">{review.userId?.name}</span>
                      <span className="text-gray-500 text-sm ml-2">on {review.organizationId?.name}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  <button onClick={() => deleteReview(review._id)} className="text-red-600 hover:text-red-700 ml-4">Delete</button>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
            </div>
          </div>
        )
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-secondary">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Organizations</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalOrganizations}</p>
                  </div>
                  <Store className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Appointments</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalAppointments}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Revenue</p>
                    <p className="text-3xl font-bold text-primary">₹{stats.totalRevenue}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Pending Approvals ({stats.pendingOrganizations})</h3>
                <div className="space-y-3">
                  {recentOrganizations.filter(o => o.status === 'pending').slice(0, 5).map((org) => (
                    <div key={org._id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{org.name}</p>
                        <p className="text-sm text-gray-600">{org.ownerId?.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => verifyOrganization(org._id)} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                        <button onClick={() => rejectOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                  {recentOrganizations.filter(o => o.status === 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pending approvals</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Recent Appointments</h3>
                <div className="space-y-3">
                  {recentAppointments.slice(0, 5).map((apt) => (
                    <div key={apt._id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{apt.userId?.name}</p>
                        <p className="text-sm text-gray-600">{apt.organizationId?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'organizations', label: 'Organizations', icon: Store },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300 mt-2">Platform Administration</p>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
