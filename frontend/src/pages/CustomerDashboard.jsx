import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, Star, MapPin, User, Settings, LogOut, Heart, MessageSquare, Bell, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentAPI } from '../utils/appointmentAPI'
import notificationAPI from '../utils/notificationAPI'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState('upcoming')
  const [appointments, setAppointments] = React.useState([])
  const [reviews, setReviews] = React.useState([])
  const [unreadNotifications, setUnreadNotifications] = React.useState([])
  const [allNotifications, setAllNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [reviewForm, setReviewForm] = React.useState({ appointmentId: '', rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = React.useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [aptRes, notifRes, reviewsRes] = await Promise.all([
        appointmentAPI.fetchCustomer(),
        notificationAPI.getAll().catch(() => ({ data: [] })),
        fetch('/api/reviews/customer', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.ok ? r.json() : Promise.reject()).catch(() => []),
      ])
      setAppointments(aptRes)
      setAllNotifications(notifRes.data || [])
      setReviews(reviewsRes.data || reviewsRes || [])
      loadUnreadNotifications()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadNotifications = async () => {
    try {
      const data = await notificationAPI.getUnread()
      setUnreadNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await appointmentAPI.cancel(appointmentId)
      toast.success('Appointment cancelled')
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to cancel appointment')
    }
  }

  const handleReschedule = (appointment) => {
    navigate(`/book/${appointment.organizationId?._id || appointment.organizationId}`, {
      state: {
        rescheduleId: appointment._id,
        selectedService: appointment.serviceId?._id || appointment.serviceId,
        selectedBarber: appointment.barberId?._id || appointment.barberId,
        selectedDate: new Date(appointment.date).toISOString().split('T')[0],
        selectedTime: appointment.timeSlot?.start,
      },
    })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      const appointment = appointments.find(a => a._id === reviewForm.appointmentId)
      if (!appointment) { toast.error('Appointment not found'); return }
      const token = localStorage.getItem('token')
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?._id,
          organizationId: appointment.organizationId?._id || appointment.organizationId,
          appointmentId: reviewForm.appointmentId,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Review submitted successfully!')
        setShowReviewForm(false)
        setReviewForm({ appointmentId: '', rating: 5, comment: '' })
        loadData()
      } else {
        toast.error(data.message || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  const markNotificationAsRead = async (notifId) => {
    try {
      await notificationAPI.markAsRead(notifId)
      setAllNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n))
      loadUnreadNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const upcomingAppointments = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const pastAppointments = appointments.filter(a => ['completed', 'no-show'].includes(a.status))
  const cancelledAppointments = appointments.filter(a => ['cancelled', 'rejected'].includes(a.status))
  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : activeTab === 'past' ? pastAppointments : cancelledAppointments
  const unreadCount = unreadNotifications.length + allNotifications.filter(n => !n.read).length

  const menuItems = [
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'past', label: 'Past', icon: Clock },
    { id: 'cancelled', label: 'Cancelled', icon: Calendar },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="ml-2 font-semibold">{review.organizationId?.name}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet. Complete an appointment to leave a review!</p>}
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" defaultValue={user?.phone} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled />
              </div>
              <Link to="/profile" className="btn-primary inline-block">Edit Profile</Link>
            </form>
          </div>
        )
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold mb-3">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span>Email notifications for appointments</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span>SMS notifications</span>
                  </label>
                </div>
              </div>
              <button type="button" className="btn-primary">Save Settings</button>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{activeTab === 'upcoming' ? 'Upcoming' : activeTab === 'past' ? 'Past' : 'Cancelled'} Appointments</h2>
            <div className="space-y-4">
              {displayAppointments.map((appointment) => (
                <div key={appointment._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{appointment.organizationId?.name}</h3>
                      <p className="text-gray-600">{appointment.serviceId?.name}</p>
                      {appointment.barberId && <p className="text-gray-500 text-sm">Barber: {appointment.barberId?.name}</p>}
                      <div className="flex items-center mt-3 text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="mr-4">{new Date(appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{appointment.timeSlot?.start}</span>
                      </div>
                      <p className="text-primary font-semibold mt-2">₹{appointment.amount}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  {activeTab === 'upcoming' && (
                    <div className="flex space-x-3 mt-4">
                      <button onClick={() => handleReschedule(appointment)} className="text-primary font-semibold text-sm hover:underline">Reschedule</button>
                      <button onClick={() => handleCancel(appointment._id)} className="text-red-600 font-semibold text-sm hover:underline">Cancel</button>
                    </div>
                  )}
                  {activeTab === 'past' && appointment.status === 'completed' && !appointment.reviewSubmitted && (
                    <div className="mt-4">
                      {!showReviewForm ? (
                        <button onClick={() => { setShowReviewForm(true); setReviewForm({ appointmentId: appointment._id, rating: 5, comment: '' }) }} className="text-primary font-semibold text-sm hover:underline">Leave a Review</button>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}>
                                <Star className={`h-6 w-6 ${i < reviewForm.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            placeholder="Write your review..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            rows="3"
                            required
                          ></textarea>
                          <div className="flex space-x-2">
                            <button type="submit" className="btn-primary">Submit Review</button>
                            <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {displayAppointments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No {activeTab} appointments</p>
                  <Link to="/search" className="btn-primary inline-block">Find a Barber</Link>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-gray-300 mt-2">Manage your appointments and preferences</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                <Link to="/notifications" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute right-4 top-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>
                  )}
                </Link>
              </nav>
            </div>
          </div>
          <div className="lg:col-span-3">
            {loading ? <div className="text-center py-20">Loading...</div> : renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
