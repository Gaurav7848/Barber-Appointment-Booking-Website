import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '../features/organization/organizationSlice'
import { MapPin, Star, Clock } from 'lucide-react'

const Search = () => {
  const dispatch = useDispatch()
  const { organizations, loading } = useSelector((state) => state.organization)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [city, setCity] = React.useState('')
  const [selectedService, setSelectedService] = React.useState('')

  React.useEffect(() => {
    dispatch(fetchOrganizations({ city, search: searchQuery }))
  }, [city, searchQuery])

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find the Best Barbers & Salons</h1>
          <p className="text-gray-300 mb-8">Discover top-rated grooming professionals near you</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-secondary"
            />
            <input
              type="text"
              placeholder="City..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="md:w-48 px-4 py-3 rounded-lg text-secondary"
            />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
              <div key={org._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img src={org.coverImage || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600'} alt={org.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{org.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {org.city}
                  </div>
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 fill-primary text-primary mr-1" />
                    <span className="font-semibold">{org.rating}</span>
                    <span className="text-gray-500 ml-2">({org.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    {org.openingTime} - {org.closingTime}
                  </div>
                  <a href={`/shop/${org._id}`} className="btn-primary block text-center">View Details</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
