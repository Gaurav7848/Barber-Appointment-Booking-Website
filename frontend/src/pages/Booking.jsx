import React from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, Clock, Scissors, ArrowLeft, CreditCard, CheckCircle2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentAPI, paymentAPI } from '../utils/appointmentAPI'

const Booking = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [shop, setShop] = React.useState(null)
  const [services, setServices] = React.useState([])
  const [barbers, setBarbers] = React.useState([])
  const [selectedService, setSelectedService] = React.useState('')
  const [selectedBarber, setSelectedBarber] = React.useState('')
  const [selectedDate, setSelectedDate] = React.useState('')
  const [selectedTime, setSelectedTime] = React.useState('')
  const [slots, setSlots] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState('pay-at-shop')
  const [appointmentId, setAppointmentId] = React.useState(null)
  const [razorpayReady, setRazorpayReady] = React.useState(false)
  const [rescheduleId, setRescheduleId] = React.useState(null)
  const [loadError, setLoadError] = React.useState('')
  const [slotsError, setSlotsError] = React.useState('')
  const [loadingSlots, setLoadingSlots] = React.useState(false)

  React.useEffect(() => {
    if (location.state?.rescheduleId) {
      setRescheduleId(location.state.rescheduleId)
      if (location.state.selectedService) setSelectedService(location.state.selectedService)
      if (location.state.selectedBarber) setSelectedBarber(location.state.selectedBarber)
      if (location.state.selectedDate) setSelectedDate(location.state.selectedDate)
      if (location.state.selectedTime) setSelectedTime(location.state.selectedTime)
    }
  }, [location.state])

  React.useEffect(() => {
    Promise.all([
      fetch('/api/organizations/' + id).then(function(r) { if (r.ok) return r.json(); return Promise.reject(); }),
      fetch('/api/services/organization/' + id).then(function(r) { if (r.ok) return r.json(); return Promise.reject(); }),
      fetch('/api/barbers/organization/' + id).then(function(r) { if (r.ok) return r.json(); return Promise.reject(); }),
    ]).then(function(results) {
      setShop(results[0])
      setServices(results[1])
      setBarbers(results[2])
    }).catch(function(err) {
      console.error('Error loading booking data:', err)
      setLoadError('Failed to load booking details. Please try again.')
    })
  }, [id])

  React.useEffect(() => {
    if (selectedService && selectedDate) {
      setLoadingSlots(true)
      setSlotsError('')
      var barberParam = selectedBarber ? '&barberId=' + selectedBarber : ''
      fetch('/api/timeslots/organization/' + id + '?date=' + selectedDate + '&serviceId=' + selectedService + barberParam)
        .then(function(r) { if (r.ok) return r.json(); return Promise.reject(); })
        .then(function(data) { setSlots(data.slots || []); })
        .catch(function(err) {
          console.error('Error loading slots:', err)
          setSlotsError('Failed to load time slots. Please try another date.')
          setSlots([])
        })
        .finally(function() { setLoadingSlots(false); })
    }
  }, [selectedService, selectedDate, selectedBarber, id])

  React.useEffect(function() {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayReady(true)
    } else {
      var script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = function() { setRazorpayReady(true) }
      script.onerror = function() { console.error('Failed to load Razorpay') }
      document.body.appendChild(script)
    }
  }, [])

  var loadRazorpay = function() {
    return new Promise(function(resolve) {
      if (window.Razorpay) {
        resolve(window.Razorpay)
      } else {
        var check = setInterval(function() {
          if (window.Razorpay) {
            clearInterval(check)
            resolve(window.Razorpay)
          }
        }, 100)
        setTimeout(function() {
          clearInterval(check)
          resolve(null)
        }, 3000)
      }
    })
  }

  var handleBooking = async function() {
    setLoading(true)
    try {
      var token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to book an appointment')
        navigate('/login')
        return
      }

      if (!selectedService || !selectedDate || !selectedTime) {
        toast.error('Please complete all steps before booking')
        setLoading(false)
        return
      }

      var appointmentData = {
        organizationId: id,
        serviceId: selectedService,
        barberId: selectedBarber || null,
        date: new Date(selectedDate).toISOString(),
        timeSlot: {
          start: selectedTime,
          end: (slots.find(function(s) { return s.time === selectedTime; }) || {}).endTime || selectedTime,
        },
        amount: (services.find(function(s) { return s._id === selectedService; }) || {}).price || 0,
        paymentMethod: paymentMethod,
        status: paymentMethod === 'online' ? 'pending' : 'confirmed',
      }

      if (rescheduleId) {
        var res = await fetch('/api/appointments/' + rescheduleId + '/reschedule', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ date: appointmentData.date, timeSlot: appointmentData.timeSlot }),
        })
        var data = await res.json()
        if (res.ok) {
          toast.success('Appointment rescheduled successfully!')
          navigate('/dashboard/customer')
        } else {
          toast.error((data && data.message) || 'Reschedule failed')
        }
        setLoading(false)
        return
      }

      var apiRes = await appointmentAPI.create(appointmentData)
      var appointment = apiRes.appointment || apiRes

      if (paymentMethod === 'online') {
        var Razorpay = await loadRazorpay()
        if (!Razorpay) {
          toast.error('Payment gateway not loaded. Please try again.')
          setLoading(false)
          return
        }

        var orderRes = await paymentAPI.createOrder(appointment._id)
        var order = orderRes.order || orderRes

        var options = {
          key: order.key || 'rzp_test_XXXX',
          amount: order.amount || appointment.amount * 100,
          currency: order.currency || 'INR',
          name: shop.name,
          description: (services.find(function(s) { return s._id === selectedService; }) || {}).name || 'Appointment Booking',
          order_id: order.id,
          handler: async function(response) {
            try {
              var verifyRes = await paymentAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appointment._id,
              })
              if (verifyRes.success) {
                toast.success('Payment successful! Appointment confirmed.')
                navigate('/dashboard/customer')
              } else {
                toast.error('Payment verification failed')
              }
            } catch (err) {
              toast.error('Payment verification failed')
            } finally {
              setLoading(false)
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#2563eb',
          },
          modal: {
            ondismiss: function() {
              setLoading(false)
            },
          },
        }

        var rzp = new Razorpay(options)
        rzp.open()
        setLoading(false)
      } else {
        toast.success('Appointment booked successfully!')
        navigate('/dashboard/customer')
      }
    } catch (error) {
      toast.error((error && error.message) || 'Booking failed')
      setLoading(false)
    }
  }

  if (!shop && !loadError) return <div className="text-center py-20">Loading...</div>
  if (loadError) return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
        <p className="text-red-600 mb-4">{loadError}</p>
        <Link to={'/shop/' + id} className="btn-primary inline-block">Back to Shop</Link>
      </div>
    </div>
  )

  var steps = [
    { id: 1, label: 'Service', icon: Scissors },
    { id: 2, label: 'Barber', icon: Users },
    { id: 3, label: 'Date & Time', icon: Calendar },
    { id: 4, label: 'Confirm', icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={'/shop/' + id} className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Shop
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Book Appointment</h1>
            <div className="flex items-center space-x-2">
              {steps.map(function(s, idx) {
                return (
                  <div key={s.id} className="flex items-center">
                    <div className={'h-3 w-3 rounded-full ' + (idx < 3 ? 'bg-primary' : 'bg-gray-300')}></div>
                    {idx < 3 && <div className={'h-0.5 w-8 ' + (idx < 2 ? 'bg-primary' : 'bg-gray-300')}></div>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
            <p className="text-gray-600">{shop.address}, {shop.city}</p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center"><Scissors className="h-5 w-5 mr-2" />Step 1: Select Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(function(service) {
                  return (
                    <div
                      key={service._id}
                      onClick={function() { setSelectedService(service._id) }}
                      className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (selectedService === service._id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary')}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-gray-500 text-sm">{service.duration} minutes</p>
                          <p className="text-gray-400 text-xs">{service.category}</p>
                        </div>
                        <p className="text-primary font-bold text-lg">Rs.{service.price}</p>
                      </div>
                    </div>
                  )
                })}
                {services.length === 0 && <p className="text-gray-500 col-span-full text-center py-4">No services available for this shop</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: Select Barber (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  onClick={function() { setSelectedBarber('') }}
                  className={'p-4 border-2 rounded-lg cursor-pointer text-center ' + (!selectedBarber ? 'border-primary bg-primary/5' : 'border-gray-200')}
                >
                  <p className="font-semibold">Any Available Barber</p>
                  <p className="text-sm text-gray-500">First available</p>
                </div>
                {barbers.map(function(barber) {
                  return (
                    <div
                      key={barber._id}
                      onClick={function() { setSelectedBarber(barber._id) }}
                      className={'p-4 border-2 rounded-lg cursor-pointer text-center ' + (selectedBarber === barber._id ? 'border-primary bg-primary/5' : 'border-gray-200')}
                    >
                      <p className="font-semibold">{barber.name}</p>
                      <p className="text-sm text-gray-500">{barber.specialization}</p>
                      <p className="text-xs text-gray-400">{barber.experience} years</p>
                    </div>
                  )
                })}
                {barbers.length === 0 && <p className="text-gray-500 col-span-full">No barbers available</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2" />Step 3: Select Date & Time</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={function(e) { setSelectedDate(e.target.value) }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                min={new Date().toISOString().split('T')[0]}
              />
              {selectedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Time Slots:</p>
                  {slotsError && <p className="text-red-500 text-sm mb-2">{slotsError}</p>}
                  {loadingSlots ? (
                    <p className="text-gray-500 text-sm col-span-full">Loading slots...</p>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.map(function(slot) {
                        return (
                          <button
                            key={slot.time}
                            onClick={function() { setSelectedTime(slot.time) }}
                            disabled={!slot.available}
                            className={'py-2 px-3 rounded-lg text-sm border ' + (selectedTime === slot.time ? 'bg-primary text-white border-primary' : slot.available ? 'border-gray-200 hover:border-primary' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed')}
                          >
                            {slot.time}
                          </button>
                        )
                      })}
                      {slots.length === 0 && <p className="text-gray-500 col-span-full">No slots available for this date</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center"><Clock className="h-5 w-5 mr-2" />Step 4: Confirm Booking</h3>
              <div className="bg-accent p-6 rounded-lg space-y-2">
                <p><strong>Shop:</strong> {shop.name}</p>
                <p><strong>Service:</strong> {(services.find(function(s) { return s._id === selectedService; }) || {}).name || 'Not selected'}</p>
                <p><strong>Barber:</strong> {selectedBarber ? (barbers.find(function(b) { return b._id === selectedBarber; }) || {}).name : 'Any Available'}</p>
                <p><strong>Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not selected'}</p>
                <p><strong>Time:</strong> {selectedTime || 'Not selected'}</p>
                <p><strong>Duration:</strong> {(services.find(function(s) { return s._id === selectedService; }) || {}).duration || 0} minutes</p>
                <p className="text-xl font-bold text-primary mt-4">Total: Rs.{(services.find(function(s) { return s._id === selectedService; }) || {}).price || 0}</p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={function() { setPaymentMethod('pay-at-shop') }}
                    className={'p-4 border-2 rounded-lg text-center transition-all ' + (paymentMethod === 'pay-at-shop' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary')}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-semibold">Pay At Shop</p>
                    <p className="text-xs text-gray-500">Pay when you visit</p>
                  </button>
                  <button
                    type="button"
                    onClick={function() { setPaymentMethod('online') }}
                    className={'p-4 border-2 rounded-lg text-center transition-all ' + (paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary')}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Online Payment</p>
                    <p className="text-xs text-gray-500">Pay securely via Razorpay</p>
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button onClick={handleBooking} disabled={loading} className="flex-1 btn-primary">
                  {loading ? 'Processing...' : paymentMethod === 'online' ? 'Pay & Book' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
