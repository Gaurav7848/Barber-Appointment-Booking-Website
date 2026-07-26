import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star } from 'lucide-react'

const Favorites = () => {
  const [favorites, setFavorites] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('favorites')
      const favs = stored ? JSON.parse(stored) : []
      setFavorites(favs)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeFavorite = (id) => {
    const updated = favorites.filter(f => f._id !== id)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No favorites yet</p>
            <Link to="/search" className="btn-primary inline-block">Find Barbers</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((org) => (
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
                  <div className="flex space-x-2">
                    <Link to={`/shop/${org._id}`} className="btn-primary flex-1 text-center block">View</Link>
                    <button onClick={() => removeFavorite(org._id)} className="btn-secondary">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
