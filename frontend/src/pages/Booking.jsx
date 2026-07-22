import React from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, Clock, Scissors, ArrowLeft, CreditCard } from 'lucide-react'
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
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState('pay-at-shop')
  const [appointmentId, setAppointmentId] = React.useState(null)
  const [razorpayReady, setRazorpayReady] = React.useState(false)
  const [rescheduleId, setRescheduleId] = React.useState(null)

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
      fetch(`/api/organizations/${id}`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`/api/services/organization/${id}`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`/api/barbers/organization/${id}`).then(r => r.ok ? r.json() : Promise.reject()),
    ]).then(([shopData, servicesData, barbersData]) => {
      setShop(shopData)
      setServices(servicesData)
      setBarbers(barbersData)
    }).catch(err => console.error('Error loading booking data:', err))
  }, [id])

  React.useEffect(() => {
    if (selectedService && selectedDate) {
      fetch(`/api/timeslots/organization/${id}?date=${selectedDate}&serviceId=${selectedService}${selectedBarber ? `&barberId=${selectedBarber}` : ''}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setSlots(data.slots || []))
    }
  }, [selectedService, selectedDate, selectedBarber, id])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayReady(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => setRazorpayReady(true)
      script.onerror = () => console.error('Failed to load Razorpay')
      document.body.appendChild(script)
    }
  }, [])

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(window.Razorpay)
      } else {
        const check = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(check)
            resolve(window.Razorpay)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(check)
          resolve(null)
        }, 3000)
      }
    })
  }

  const handleBooking = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to book an appointment')
        navigate('/login')
        return
      }

      const appointmentData = {
        organizationId: id,
        serviceId: selectedService,
        barberId: selectedBarber || null,
        date: new Date(selectedDate).toISOString(),
        timeSlot: {
          start: selectedTime,
          end: slots.find(s => s.time === selectedTime)?.endTime || selectedTime,
        },
        amount: services.find(s => s._id === selectedService)?.price || 0,
        paymentMethod,
        status: paymentMethod === 'online' ? 'pending' : 'confirmed',
      }

      if (rescheduleId) {
        const res = await fetch(`/api/appointments/${rescheduleId}/reschedule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ date: appointmentData.date, timeSlot: appointmentData.timeSlot }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success('Appointment rescheduled successfully!')
          navigate('/dashboard/customer')
        } else {
          toast.error(data.message || 'Reschedule failed')
        }
        setLoading(false)
        return
      }

      const res = await appointmentAPI.create(appointmentData)
      const appointment = res.appointment || res

      if (paymentMethod === 'online') {
        setAppointmentId(appointment._id)
        const Razorpay = await loadRazorpay()
        if (!Razorpay) {
          toast.error('Payment gateway not loaded. Please try again.')
          setLoading(false)
          return
        }

        const orderRes = await paymentAPI.createOrder(appointment._id)
        const order = orderRes.order || orderRes

        const options = {
          key: order.key || 'rzp_test_XXXX',
          amount: order.amount || appointment.amount * 100,
          currency: order.currency || 'INR',
          name: shop.name,
          description: services.find(s => s._id === selectedService)?.name || 'Appointment Booking',
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyRes = await paymentAPI.verify({
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
            ondismiss: () => {
              setLoading(false)
            },
          },
        }

        const rzp = new Razorpay(options)
        rzp.open()
        setLoading(false)
      } else {
        toast.success('Appointment booked successfully!')
        navigate('/dashboard/customer')
      }
    } catch (error) {
      toast.error(error.message || 'Booking failed')
      setLoading(false)
    }
  }

  if (!shop) return <div className="text-center py-20">Loading...</div>

  const canProceedToStep2 = selectedService !== ''
  const canProceedToStep3 = true
  const canProceedToStep4 = selectedDate !== '' && selectedTime !== ''

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/shop/${id}`} className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Shop
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Book Appointment</h1>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  {s < 4 && <div className={`h-0.5 w-8 ${step > s ? 'bg-primary' : 'bg-gray-300'}`}></div>}
                </div>
              ))}
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
                {services.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => { setSelectedService(service._id); setStep(2) }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedService === service._id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-gray-500 text-sm">{service.duration} minutes</p>
                        <p className="text-gray-400 text-xs">{service.category}</p>
                      </div>
                      <p className="text-primary font-bold text-lg">₹{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {step >= 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 2: Select Barber (Optional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => { setSelectedBarber(''); setStep(3) }}
                    className={`p-4 border-2 rounded-lg cursor-pointer text-center ${!selectedBarber ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                    <p className="font-semibold">Any Available Barber</p>
                    <p className="text-sm text-gray-500">First available</p>
                  </div>
                  {barbers.map((barber) => (
                    <div
                      key={barber._id}
                      onClick={() => { setSelectedBarber(barber._id); setStep(3) }}
                      className={`p-4 border-2 rounded-lg cursor-pointer text-center ${selectedBarber === barber._id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <p className="font-semibold">{barber.name}</p>
                      <p className="text-sm text-gray-500">{barber.specialization}</p>
                      <p className="text-xs text-gray-400">{barber.experience} years</p>
                    </div>
                  ))}
                  {barbers.length === 0 && <p className="text-gray-500 col-span-full">No barbers available</p>}
                </div>
              </div>
            )}

            {step >= 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2" />Step 3: Select Date & Time</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setStep(4) }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                  min={new Date().toISOString().split('T')[0]}
                />
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Time Slots:</p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 px-3 rounded-lg text-sm border ${
                            selectedTime === slot.time
                              ? 'bg-primary text-white border-primary'
                              : slot.available
                              ? 'border-gray-200 hover:border-primary'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                      {slots.length === 0 && <p className="text-gray-500 col-span-full">No slots available for this date</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step >= 4 && selectedTime && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center"><Clock className="h-5 w-5 mr-2" />Step 4: Confirm Booking</h3>
                <div className="bg-accent p-6 rounded-lg space-y-2">
                  <p><strong>Shop:</strong> {shop.name}</p>
                  <p><strong>Service:</strong> {services.find(s => s._id === selectedService)?.name}</p>
                  <p><strong>Barber:</strong> {selectedBarber ? barbers.find(b => b._id === selectedBarber)?.name : 'Any Available'}</p>
                  <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Duration:</strong> {services.find(s => s._id === selectedService)?.duration} minutes</p>
                  <p className="text-xl font-bold text-primary mt-4">Total: ₹{services.find(s => s._id === selectedService)?.price}</p>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pay-at-shop')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${paymentMethod === 'pay-at-shop' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                    >
                      <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="font-semibold">Pay At Shop</p>
                      <p className="text-xs text-gray-500">Pay when you visit</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
