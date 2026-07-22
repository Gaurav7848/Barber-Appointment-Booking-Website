import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '../features/organization/organizationSlice'
import { MapPin, Star, Clock, SlidersHorizontal, X } from 'lucide-react'

const Search = () => {
  const dispatch = useDispatch()
  const { organizations, loading } = useSelector((state) => state.organization)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [city, setCity] = React.useState('')
  const [selectedService, setSelectedService] = React.useState('')
  const [minRating, setMinRating] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [sortBy, setSortBy] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [availableToday, setAvailableToday] = React.useState(false)

  React.useEffect(() => {
    dispatch(fetchOrganizations({ city, search: searchQuery }))
  }, [city, searchQuery, dispatch])

  const filteredOrgs = organizations.filter(org => {
    if (selectedService && !(org.services || []).some(s => s._id === selectedService)) return false
    if (minRating && org.rating < parseFloat(minRating)) return false
    if (maxPrice && org.minPrice > parseFloat(maxPrice)) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'price-low') return (a.minPrice || 0) - (b.minPrice || 0)
    if (sortBy === 'price-high') return (b.minPrice || 0) - (a.minPrice || 0)
    return 0
  })

  const clearFilters = () => {
    setSelectedService('')
    setMinRating('')
    setMaxPrice('')
    setSortBy('')
    setAvailableToday(false)
  }

  const activeFilterCount = [selectedService, minRating, maxPrice, sortBy, availableToday].filter(Boolean).length

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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center justify-center relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear all</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                    <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="">Any</option>
                      <option value="4">4+ stars</option>
                      <option value="3">3+ stars</option>
                      <option value="2">2+ stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="">Relevance</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="available-today" checked={availableToday} onChange={(e) => setAvailableToday(e.target.checked)} className="mr-2" />
                    <label htmlFor="available-today" className="text-sm text-gray-700">Available Today</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOrgs.map((org) => (
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
                {filteredOrgs.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No organizations found</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
