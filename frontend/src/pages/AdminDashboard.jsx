import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { Shield, Users, Store, Calendar, DollarSign, Star, TrendingUp, LogOut, Settings, Plus, Edit2, Trash2, X, Check, AlertCircle, BarChart3, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = React.useState('overview')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [stats, setStats] = React.useState({ totalUsers: 0, totalOrganizations: 0, pendingOrganizations: 0, totalAppointments: 0, totalRevenue: 0, totalReviews: 0 })
  const [recentAppointments, setRecentAppointments] = React.useState([])
  const [recentOrganizations, setRecentOrganizations] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [organizations, setOrganizations] = React.useState([])
  const [reviews, setReviews] = React.useState([])
  const [revenueData, setRevenueData] = React.useState([])

  const [apptDateFrom, setApptDateFrom] = React.useState('')
  const [apptDateTo, setApptDateTo] = React.useState('')
  const [apptStatusFilter, setApptStatusFilter] = React.useState('')

  const [roleModal, setRoleModal] = React.useState(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const [statsRes, usersRes, orgsRes, reviewsRes, revenueRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/organizations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/revenue', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const statsData = await statsRes.json()
      if (statsData.stats) { setStats(statsData.stats); setRecentAppointments(statsData.recentAppointments || []); setRecentOrganizations(statsData.recentOrganizations || []) }
      const usersData = await usersRes.json(); setUsers(usersData)
      const orgsData = await orgsRes.json(); setOrganizations(orgsData)
      const reviewsData = await reviewsRes.json(); setReviews(reviewsData)
      const revenueResData = await revenueRes.json(); setRevenueData(revenueResData.data || [])
    } catch (err) {
      setError('Failed to load admin data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const updateUserRole = async (userId, newRole) => {
    setSubmitting(true)
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ role: newRole }),
      })
      setRoleModal(null)
      loadAdminData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const verifyOrganization = async (id) => { await fetch(`/api/admin/organizations/${id}/verify`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); loadAdminData() }
  const rejectOrganization = async (id) => { await fetch(`/api/admin/organizations/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); loadAdminData() }
  const suspendOrganization = async (id) => { await fetch(`/api/admin/organizations/${id}/suspend`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); loadAdminData() }
  const deleteReview = async (id) => { await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); loadAdminData() }

  const filteredAppointments = recentAppointments.filter((apt) => {
    if (apptDateFrom && new Date(apt.date) < new Date(apptDateFrom)) return false
    if (apptDateTo && new Date(apt.date) > new Date(apptDateTo)) return false
    if (apptStatusFilter && apt.status !== apptStatusFilter) return false
    return true
  })

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'organizations', label: 'Organizations', icon: Store },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  )

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: bgColor || color + '20' }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  )

  const revenueChartData = revenueData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: item.revenue || 0,
    appointments: item.count || 0,
  }))

  const orgStatusData = [
    { name: 'Approved', value: organizations.filter(o => o.status === 'approved').length, color: '#10b981' },
    { name: 'Pending', value: organizations.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Suspended', value: organizations.filter(o => o.status === 'suspended').length, color: '#ef4444' },
    { name: 'Rejected', value: organizations.filter(o => o.status === 'rejected').length, color: '#6b7280' },
  ].filter(d => d.value > 0)

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">User Management</h3>
              <span className="text-sm text-gray-500">{users.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4 text-gray-600">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'organization' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setRoleModal(u)} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"><Edit2 className="h-3 w-3" />Change Role</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {roleModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                  <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Change Role</h3><button onClick={() => setRoleModal(null)} className="text-gray-500"><X className="h-5 w-5" /></button></div>
                  <p className="text-sm text-gray-600 mb-4">Update role for {roleModal.name}</p>
                  <div className="flex gap-2">
                    {['user', 'organization', 'admin'].map(role => (
                      <button key={role} onClick={() => updateUserRole(roleModal._id, role)} disabled={submitting} className={`flex-1 py-2 rounded-lg text-sm capitalize ${roleModal.role === role ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{role}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'organizations':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Organization Management</h3>
              <span className="text-sm text-gray-500">{organizations.length} organizations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">City</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr></thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{org.name}</td>
                      <td className="py-3 px-4 text-gray-600">{org.ownerId?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{org.city}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.status === 'approved' ? 'bg-green-100 text-green-800' : org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : org.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{org.status}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{org.rating || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {org.status === 'pending' && <><button onClick={() => verifyOrganization(org._id)} className="text-green-600 hover:text-green-700 text-sm">Verify</button><button onClick={() => rejectOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Reject</button></>}
                          {org.status === 'approved' && <><button onClick={() => suspendOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Suspend</button></>}
                          {org.status === 'suspended' && <><button onClick={() => verifyOrganization(org._id)} className="text-green-600 hover:text-green-700 text-sm">Restore</button></>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No organizations found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'appointments':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h3 className="text-xl font-bold flex-1">Appointment Monitoring</h3>
              <div className="flex items-center gap-2">
                <input type="date" value={apptDateFrom} onChange={(e) => setApptDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="date" value={apptDateTo} onChange={(e) => setApptDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select value={apptStatusFilter} onChange={(e) => setApptStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={loadAdminData} className="text-sm text-primary hover:underline">Reset</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Barber</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                </tr></thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{apt.userId?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{apt.organizationId?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{apt.serviceId?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{apt.barberId?.name || 'Any'}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-600">{apt.timeSlot?.start || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{apt.status}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{apt.amount || 0}</td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-gray-500">No appointments found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Review Moderation ({reviews.length})</h3>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />)}
                      </div>
                      <span className="font-semibold">{review.userId?.name}</span>
                      <span className="text-gray-500 text-sm ml-2">on {review.organizationId?.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  <button onClick={() => { if (window.confirm('Delete this review?')) deleteReview(review._id) }} className="text-red-600 hover:text-red-700 ml-4"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
            </div>
          </div>
        )

      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={DollarSign} color="#059669" bgColor="#d1fae5" />
              <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="#2563eb" bgColor="#dbeafe" />
              <StatCard title="Avg per Appointment" value={`₹${stats.totalAppointments ? Math.round(stats.totalRevenue / stats.totalAppointments) : 0}`} icon={TrendingUp} color="#7c3aed" bgColor="#ede9fe" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold mb-6">Revenue Trend</h3>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">No revenue data available</div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#2563eb" bgColor="#dbeafe" />
              <StatCard title="Organizations" value={stats.totalOrganizations} icon={Store} color="#059669" bgColor="#d1fae5" />
              <StatCard title="Appointments" value={stats.totalAppointments} icon={Calendar} color="#16a34a" bgColor="#dcfce7" />
              <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} icon={DollarSign} color="#7c3aed" bgColor="#ede9fe" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Pending Approvals ({stats.pendingOrganizations})</h3>
                <div className="space-y-3">
                  {recentOrganizations.filter(o => o.status === 'pending').slice(0, 5).map((org) => (
                    <div key={org._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-semibold">{org.name}</p>
                        <p className="text-sm text-gray-600">{org.ownerId?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => verifyOrganization(org._id)} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                        <button onClick={() => rejectOrganization(org._id)} className="text-red-600 hover:text-red-700 text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                  {recentOrganizations.filter(o => o.status === 'pending').length === 0 && <p className="text-gray-500 text-center py-4">No pending approvals</p>}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Recent Appointments</h3>
                <div className="space-y-3">
                  {recentAppointments.slice(0, 5).map((apt) => (
                    <div key={apt._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-semibold">{apt.userId?.name}</p>
                        <p className="text-sm text-gray-600">{apt.organizationId?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No revenue data available</div>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-6">Organization Status</h3>
                {orgStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={orgStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                        {orgStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No organization data available</div>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-dark to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300 mt-2">Platform Administration & Analytics</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <LogOut className="h-5 w-5" /><span>Logout</span>
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <item.icon className="h-5 w-5" /><span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="lg:col-span-4">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
