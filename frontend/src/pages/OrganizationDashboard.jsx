import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Star, Users, TrendingUp, Scissors, Settings, LogOut, Plus, Edit2, Trash2, X, Check, XCircle, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react'

const OrganizationDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = React.useState('overview')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

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
  const [myOrg, setMyOrg] = React.useState(null)

  const [aptDateFilter, setAptDateFilter] = React.useState('')
  const [aptStatusFilter, setAptStatusFilter] = React.useState('')

  const [showBarberForm, setShowBarberForm] = React.useState(false)
  const [showServiceForm, setShowServiceForm] = React.useState(false)
  const [editingBarber, setEditingBarber] = React.useState(null)
  const [editingService, setEditingService] = React.useState(null)

  const [barberForm, setBarberForm] = React.useState({ name: '', specialization: '', experience: '', phone: '', isAvailable: true })
  const [serviceForm, setServiceForm] = React.useState({ name: '', category: '', price: '', duration: '', description: '', isActive: true })

  const [calendarDate, setCalendarDate] = React.useState(new Date())
  const [earningsPeriod, setEarningsPeriod] = React.useState('week')

  const [orgSettings, setOrgSettings] = React.useState({ name: '', contactPhone: '', contactEmail: '', openingTime: '', closingTime: '', isOpen: true })

  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const orgRes = await fetch('/api/organizations', { headers: { Authorization: `Bearer ${token}` } })
      const orgs = await orgRes.json()
      const myOrgData = orgs.find(o => o.ownerId?._id === user?._id || o.ownerId === user?._id)
      if (!myOrgData) { setError('Organization not found'); setLoading(false); return }
      setMyOrg(myOrgData)
      setOrgSettings({
        name: myOrgData.name || '',
        contactPhone: myOrgData.contactPhone || '',
        contactEmail: myOrgData.contactEmail || '',
        openingTime: myOrgData.openingTime || '',
        closingTime: myOrgData.closingTime || '',
        isOpen: myOrgData.isOpen ?? true,
      })

      const [aptRes, barberRes, serviceRes, reviewRes] = await Promise.all([
        fetch(`/api/appointments/organization/${myOrgData._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/barbers/organization/${myOrgData._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/services/organization/${myOrgData._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/reviews/organization/${myOrgData._id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const apts = await aptRes.json()
      const barbersData = await barberRes.json()
      const servicesData = await serviceRes.json()
      const reviewsData = await reviewRes.json()
      setAppointments(apts)
      setBarbers(barbersData)
      setServices(servicesData)
      setReviews(reviewsData)

      const today = new Date().toDateString()
      const todayApts = apts.filter(a => new Date(a.date).toDateString() === today)
      const paidApts = apts.filter(a => a.paymentStatus === 'paid')
      const monthlyPaidApts = paidApts.filter(a => {
        const d = new Date(a.date)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      setStats({
        todayAppointments: apts.length,
        completed: apts.filter(a => a.status === 'completed').length,
        pending: apts.filter(a => a.status === 'pending').length,
        cancelled: apts.filter(a => ['cancelled', 'rejected'].includes(a.status)).length,
        todayRevenue: todayApts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.amount || 0), 0),
        monthlyRevenue: monthlyPaidApts.reduce((sum, a) => sum + (a.amount || 0), 0),
        totalCustomers: new Set(apts.map(a => a.userId?._id || a.userId)).size,
        averageRating: myOrgData.rating || 4.7,
      })
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (id, status) => {
    setSubmitting(true)
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status }),
      })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleBarberSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const method = editingBarber ? 'PUT' : 'POST'
      const url = editingBarber ? `/api/barbers/${editingBarber._id}` : '/api/barbers'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...barberForm, organizationId: myOrg._id }),
      })
      setShowBarberForm(false)
      setEditingBarber(null)
      setBarberForm({ name: '', specialization: '', experience: '', phone: '', isAvailable: true })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const method = editingService ? 'PUT' : 'POST'
      const url = editingService ? `/api/services/${editingService._id}` : '/api/services'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...serviceForm, organizationId: myOrg._id }),
      })
      setShowServiceForm(false)
      setEditingService(null)
      setServiceForm({ name: '', category: '', price: '', duration: '', description: '', isActive: true })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const deleteBarber = async (id) => {
    if (!window.confirm('Delete this barber?')) return
    setSubmitting(true)
    try {
      await fetch(`/api/barbers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return
    setSubmitting(true)
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const assignServicesToBarber = async (barberId, serviceIds) => {
    try {
      await fetch(`/api/barbers/${barberId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ serviceIds }),
      })
      loadDashboardData()
    } catch (err) { console.error(err) }
  }

  const saveOrgSettings = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch(`/api/organizations/${myOrg._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(orgSettings),
      })
      loadDashboardData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (aptDateFilter && new Date(apt.date).toDateString() !== new Date(aptDateFilter).toDateString()) return false
    if (aptStatusFilter && apt.status !== aptStatusFilter) return false
    return true
  })

  const getCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = Array.from({ length: firstDay }, () => null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const getDayAppointments = (day) => {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    return appointments.filter(a => new Date(a.date).toDateString() === d.toDateString())
  }

  const earningsData = { day: stats.todayRevenue, week: stats.monthlyRevenue / 4, month: stats.monthlyRevenue }

  const recentEarnings = [...appointments].filter(a => a.paymentStatus === 'paid').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'barbers', label: 'Barbers / Staff', icon: Users },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        </div>
        <Icon className="h-10 w-10" style={{ color }} />
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h3 className="text-xl font-bold flex-1">All Appointments</h3>
              <div className="flex items-center gap-2">
                <input type="date" value={aptDateFilter} onChange={(e) => setAptDateFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <select value={aptStatusFilter} onChange={(e) => setAptStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Barber</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{apt.userId?.name || 'Customer'}</td>
                      <td className="py-3 px-4">{apt.serviceId?.name || 'Service'}</td>
                      <td className="py-3 px-4">{apt.barberId?.name || 'Any'}</td>
                      <td className="py-3 px-4">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{apt.timeSlot?.start || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{apt.status}</span>
                      </td>
                      <td className="py-3 px-4">₹{apt.amount || 0}</td>
                      <td className="py-3 px-4"><div className="flex gap-2">
                        {apt.status === 'pending' && <><button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="text-green-600 hover:text-green-700"><CheckCircle className="h-4 w-4" /></button><button onClick={() => updateAppointmentStatus(apt._id, 'rejected')} className="text-red-600 hover:text-red-700"><XCircle className="h-4 w-4" /></button></>}
                        {apt.status === 'confirmed' && <><button onClick={() => updateAppointmentStatus(apt._id, 'completed')} className="text-blue-600 hover:text-blue-700"><CheckCircle className="h-4 w-4" /></button><button onClick={() => updateAppointmentStatus(apt._id, 'cancelled')} className="text-red-600 hover:text-red-700"><XCircle className="h-4 w-4" /></button></>}
                      </div></td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-gray-500">No appointments found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'calendar':
        const days = getCalendarDays()
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Calendar - {calendarDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))} className="px-3 py-2 border rounded-lg hover:bg-gray-50">&lt;</button>
                <button onClick={() => setCalendarDate(new Date())} className="px-3 py-2 border rounded-lg hover:bg-gray-50">Today</button>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))} className="px-3 py-2 border rounded-lg hover:bg-gray-50">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(d => <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>)}
              {days.map((day, i) => {
                const dayApts = day ? getDayAppointments(day) : []
                const isToday = day && new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toDateString() === new Date().toDateString()
                return (
                  <div key={i} className={`border rounded-lg p-2 min-h-24 ${day ? 'bg-white hover:shadow-md cursor-pointer' : 'bg-gray-50'} ${isToday ? 'ring-2 ring-primary' : ''}`}>
                    {day && <div className="text-sm font-medium mb-1">{day}</div>}
                    {dayApts.slice(0, 2).map(apt => (
                      <div key={apt._id} className="text-xs bg-primary text-white rounded px-1 py-0.5 mb-1 truncate">{apt.timeSlot?.start} - {apt.userId?.name}</div>
                    ))}
                    {dayApts.length > 2 && <div className="text-xs text-gray-500">+{dayApts.length - 2} more</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'earnings':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Today's Revenue" value={`₹${earningsData.day}`} icon={DollarSign} color="#000" />
              <StatCard title="This Week" value={`₹${Math.round(earningsData.week)}`} icon={TrendingUp} color="#059669" />
              <StatCard title="This Month" value={`₹${stats.monthlyRevenue}`} icon={DollarSign} color="#2563eb" />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Recent Payments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b"><th className="text-left py-3 px-4">Customer</th><th className="text-left py-3 px-4">Service</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Amount</th><th className="text-left py-3 px-4">Status</th></tr></thead>
                  <tbody>
                    {recentEarnings.map(p => (
                      <tr key={p._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{p.userId?.name}</td>
                        <td className="py-3 px-4">{p.serviceId?.name}</td>
                        <td className="py-3 px-4">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">₹{p.amount}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Paid</span></td>
                      </tr>
                    ))}
                    {recentEarnings.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No payments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'barbers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Barbers / Staff</h3>
              <button onClick={() => { setEditingBarber(null); setBarberForm({ name: '', specialization: '', experience: '', phone: '', isAvailable: true }); setShowBarberForm(true) }} className="btn-primary text-sm flex items-center gap-1"><Plus className="h-4 w-4" />Add Barber</button>
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
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center"><Star className="h-4 w-4 fill-primary text-primary mr-1" /><span className="text-sm">{barber.rating || 'New'}</span></div>
                    <span className={`px-2 py-1 rounded text-xs ${barber.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{barber.isAvailable ? 'Available' : 'Busy'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingBarber(barber); setBarberForm({ name: barber.name, specialization: barber.specialization, experience: barber.experience, phone: barber.phone || '', isAvailable: barber.isAvailable }); setShowBarberForm(true) }} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"><Edit2 className="h-3 w-3" />Edit</button>
                    <button onClick={() => deleteBarber(barber._id)} className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
                  </div>
                </div>
              ))}
              {barbers.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No barbers added yet</p>}
            </div>
            {showBarberForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingBarber ? 'Edit Barber' : 'Add Barber'}</h3><button onClick={() => setShowBarberForm(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button></div>
                  <form onSubmit={handleBarberSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={barberForm.name} onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label><input type="text" value={barberForm.specialization} onChange={(e) => setBarberForm({ ...barberForm, specialization: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label><input type="number" value={barberForm.experience} onChange={(e) => setBarberForm({ ...barberForm, experience: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={barberForm.phone} onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    </div>
                    <div className="flex items-center"><input type="checkbox" id="isAvailable" checked={barberForm.isAvailable} onChange={(e) => setBarberForm({ ...barberForm, isAvailable: e.target.checked })} className="mr-2" /><label htmlFor="isAvailable" className="text-sm text-gray-700">Available</label></div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full py-2">{submitting ? 'Saving...' : (editingBarber ? 'Update' : 'Add')} Barber</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )

      case 'services':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Services</h3>
              <button onClick={() => { setEditingService(null); setServiceForm({ name: '', category: '', price: '', duration: '', description: '', isActive: true }); setShowServiceForm(true) }} className="btn-primary text-sm flex items-center gap-1"><Plus className="h-4 w-4" />Add Service</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">₹{service.price}</span>
                      <button onClick={async () => {
                        await fetch(`/api/services/${service._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ isActive: !service.isActive }) })
                        loadDashboardData()
                      }} className={`px-2 py-1 rounded text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{service.isActive ? 'Active' : 'Inactive'}</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{service.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{service.duration} min</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingService(service); setServiceForm({ name: service.name, category: service.category, price: service.price, duration: service.duration, description: service.description || '', isActive: service.isActive }); setShowServiceForm(true) }} className="text-blue-600 hover:text-blue-700"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => deleteService(service._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No services added yet</p>}
            </div>
            {showServiceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add Service'}</h3><button onClick={() => setShowServiceForm(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button></div>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label><input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label><input type="number" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea></div>
                    <div className="flex items-center"><input type="checkbox" id="serviceIsActive" checked={serviceForm.isActive} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })} className="mr-2" /><label htmlFor="serviceIsActive" className="text-sm text-gray-700">Active</label></div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full py-2">{submitting ? 'Saving...' : (editingService ? 'Update' : 'Add')} Service</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )

      case 'reviews':
        const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Customer Reviews</h3>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">{avgRating}</span>
                <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />)}
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
            <form onSubmit={saveOrgSettings} className="space-y-4 max-w-2xl">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label><input type="text" value={orgSettings.name} onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label><input type="tel" value={orgSettings.contactPhone} onChange={(e) => setOrgSettings({ ...orgSettings, contactPhone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label><input type="email" value={orgSettings.contactEmail} onChange={(e) => setOrgSettings({ ...orgSettings, contactEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label><input type="time" value={orgSettings.openingTime} onChange={(e) => setOrgSettings({ ...orgSettings, openingTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label><input type="time" value={orgSettings.closingTime} onChange={(e) => setOrgSettings({ ...orgSettings, closingTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              </div>
              <div className="flex items-center"><input type="checkbox" id="isOpen" checked={orgSettings.isOpen} onChange={(e) => setOrgSettings({ ...orgSettings, isOpen: e.target.checked })} className="mr-2" /><label htmlFor="isOpen" className="text-sm text-gray-700">Shop Open (accepting bookings)</label></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                <input type="file" accept="image/*" className="w-full px-4 py-2 border border-gray-300 rounded-lg" onChange={async (e) => {
                  const file = e.target.files[0]; if (!file) return; const formData = new FormData(); formData.append('logo', file); await fetch(`/api/organization/${myOrg._id}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData }); loadDashboardData()
                }} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary py-2 px-6">{submitting ? 'Saving...' : 'Save Settings'}</button>
            </form>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="#2563eb" />
              <StatCard title="Completed" value={stats.completed} icon={Clock} color="#059669" />
              <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="#d97706" />
              <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} color="#dc2626" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue}`} icon={DollarSign} color="#059669" />
              <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue}`} icon={DollarSign} color="#000" />
            </div>
          </div>
        )
    }
  }

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
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>
                    <item.icon className="h-5 w-5" /><span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="lg:col-span-4">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationDashboard
