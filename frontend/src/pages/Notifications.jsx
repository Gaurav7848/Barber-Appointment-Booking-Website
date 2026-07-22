import React from 'react'
import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'

const Notifications = () => {
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <button onClick={markAllAsRead} className="btn-secondary inline-flex items-center">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 flex items-start justify-between hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <Bell className={`h-5 w-5 mt-1 ${!notif.read ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <p className={`${!notif.read ? 'font-semibold text-secondary' : 'text-gray-700'}`}>{notif.title || 'Notification'}</p>
                      <p className="text-gray-600 text-sm">{notif.message || notif.text}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(notif.createdAt || notif.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <button onClick={() => markAsRead(notif._id)} className="text-primary hover:text-primary/80 p-2">
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
