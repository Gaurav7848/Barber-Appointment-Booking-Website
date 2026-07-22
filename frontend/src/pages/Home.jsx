import React from 'react'
import { Link } from 'react-router-dom'
import { Scissors, MapPin, Calendar, Star, ChevronRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-dark text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920"
          alt="Barber"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Healthy Hair Growth Begins<br />
            <span className="text-primary">with a Well-Cared-For Scalp</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Book appointments at the best barber shops and salons near you. Professional grooming services at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/search" className="btn-primary text-center">
              Find a Barber
            </Link>
            <Link to="/register-organization" className="btn-secondary text-center border-white text-white hover:bg-white hover:text-dark">
              Register Your Shop
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Elevating Your Hair with Personalized Care & Expertise
              </h2>
              <p className="text-gray-600 mb-8">
                Discover skilled barbers and premium salons in your area. From classic cuts to modern styles, find the perfect grooming experience tailored to your needs.
              </p>
              <Link to="/search" className="btn-primary">Explore Now</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?w=400" alt="Haircut" className="rounded-lg w-full h-64 object-cover" />
              <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400" alt="Styling" className="rounded-lg w-full h-64 object-cover mt-8" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Nourishing Treatments and Styling Services for Every Hair Type
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Hair Color & Highlights', icon: '🎨' },
              { title: 'Hair Treatments & Repairs', icon: '💆' },
              { title: 'Hair Consultation Services', icon: '💬' },
            ].map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600'][idx]}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">Professional care tailored to your unique hair type and style preferences.</p>
                  <Link to="/search" className="text-primary font-semibold flex items-center hover:underline">
                    Learn More <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Browse Our Collection of Must Have Items That Stand Out
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow">
                <img src={`https://images.unsplash.com/photo-${[1527799820374, 1631730483733, 1559593400, 1522337360788][item-1]}?w=300`} alt="Product" className="w-full h-48 object-cover rounded mb-4" />
                <h3 className="font-semibold mb-1">Premium Product {item}</h3>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-primary font-bold">₹{199 + item * 50}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Meet Our Professional Hair Stylists
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', role: 'Master Barber', exp: '10 Years', img: '1507003211169' },
              { name: 'Amit Verma', role: 'Style Expert', exp: '7 Years', img: '1472099644585' },
              { name: 'Priya Singh', role: 'Color Specialist', exp: '5 Years', img: '1438761681033' },
            ].map((stylist, idx) => (
              <div key={idx} className="text-center">
                <img
                  src={`https://images.unsplash.com/photo-${stylist.img}?w=400`}
                  alt={stylist.name}
                  className="w-48 h-48 rounded-full mx-auto object-cover mb-4"
                />
                <h3 className="text-xl font-semibold">{stylist.name}</h3>
                <p className="text-primary">{stylist.role}</p>
                <p className="text-gray-500 text-sm">{stylist.exp} Experience</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Look Your Best?</h2>
          <p className="text-lg mb-8 text-white/90">Book your appointment today and experience professional grooming.</p>
          <Link to="/search" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Find a Barber Near You
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
