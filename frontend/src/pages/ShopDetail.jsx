import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Phone, Clock, Calendar, ChevronRight, Scissors } from 'lucide-react'

const ShopDetail = () => {
  const { id } = useParams()
  const [shop, setShop] = React.useState(null)
  const [services, setServices] = React.useState([])
  const [barbers, setBarbers] = React.useState([])
  const [reviews, setReviews] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState('')
  const [slots, setSlots] = React.useState([])
  const [selectedBarberFilter, setSelectedBarberFilter] = React.useState('')
  const [loadingSlots, setLoadingSlots] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/organizations/${id}`).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(`/api/services/organization/${id}`).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(`/api/barbers/organization/${id}`).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(`/api/reviews/organization/${id}`).then(res => res.ok ? res.json() : Promise.reject()),
    ]).then(([shopData, servicesData, barbersData, reviewsData]) => {
      setShop(shopData)
      setServices(servicesData)
      setBarbers(barbersData)
      setReviews(reviewsData)
    }).catch(err => console.error('Error loading shop details:', err))
  }, [id])

  const fetchSlots = async (date, barberId) => {
    if (!date) return
    setLoadingSlots(true)
    try {
      const barberParam = barberId ? `&barberId=${barberId}` : ''
      const res = await fetch(`/api/timeslots/organization/${id}?date=${date}${barberParam}`)
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots || [])
      }
    } catch (err) {
      console.error('Error fetching slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  React.useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate, selectedBarberFilter)
    }
  }, [selectedDate, selectedBarberFilter, id])

  if (!shop) return <div className="text-center py-20">Loading...</div>

  const mapQuery = encodeURIComponent(`${shop.address}, ${shop.city}`)
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-96">
        <img src={shop.coverImage || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920'} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{shop.name}</h1>
          <div className="flex items-center mb-2">
            <Star className="h-5 w-5 fill-primary text-primary mr-1" />
            <span>{shop.rating || 'New'}</span>
            <span className="ml-2">({shop.totalReviews || 0} reviews)</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{shop.address}, {shop.city}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Services & Pricing</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service._id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-gray-500 text-sm">{service.duration} minutes • {service.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-lg">₹{service.price}</p>
                    </div>
                  </div>
                ))}
                {services.length === 0 && <p className="text-gray-500">No services available yet</p>}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Our Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {barbers.map((barber) => (
                  <div key={barber._id} className="text-center p-4 border rounded-lg">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                      {barber.avatar ? <img src={barber.avatar} alt={barber.name} className="w-full h-full rounded-full object-cover" /> : <Scissors className="h-8 w-8 text-gray-400" />}
                    </div>
                    <h3 className="font-semibold">{barber.name}</h3>
                    <p className="text-primary text-sm">{barber.specialization}</p>
                    <p className="text-gray-500 text-xs">{barber.experience} years experience</p>
                  </div>
                ))}
                {barbers.length === 0 && <p className="text-gray-500 col-span-full">No barbers added yet</p>}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{review.userId?.name || 'Customer'}</span>
                      <span className="text-gray-500 text-sm ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-accent p-6 rounded-xl sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>
              <Link to={`/book/${shop._id}`} className="btn-primary block text-center mb-6">Book Now</Link>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{shop.openingTime || '10:00'} - {shop.closingTime || '20:00'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>{shop.contactPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{shop.address}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Check Availability</h4>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  min={new Date().toISOString().split('T')[0]}
                />
                {barbers.length > 0 && (
                  <select
                    value={selectedBarberFilter}
                    onChange={(e) => setSelectedBarberFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  >
                    <option value="">Any Barber</option>
                    {barbers.map((barber) => (
                      <option key={barber._id} value={barber._id}>{barber.name}</option>
                    ))}
                  </select>
                )}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium mb-2">Available Slots (30 min each):</p>
                    {loadingSlots ? (
                      <p className="text-gray-500 text-sm col-span-full">Loading...</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <div key={slot.time} className={`text-center py-2 px-2 rounded text-sm ${slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {slot.time}
                          </div>
                        ))}
                        {slots.length === 0 && <p className="text-gray-500 text-sm col-span-full">No slots</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Location</h2>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="Shop Location"
              src={mapSrc}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopDetail
