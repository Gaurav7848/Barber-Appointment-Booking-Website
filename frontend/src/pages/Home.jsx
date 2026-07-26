import React from 'react'
import { Link } from 'react-router-dom'
import { Scissors, MapPin, Calendar, Star, ChevronRight, Phone, Mail, Clock, Award, Users, ShieldCheck } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <section id="home" className="relative bg-dark text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920"
          alt="Barber"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Style,<br />
              <span className="text-primary">Our Passion</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
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
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Find Near You', desc: 'Discover top-rated barbers and salons in your area' },
              { icon: Calendar, title: 'Easy Booking', desc: 'Book appointments instantly with real-time availability' },
              { icon: Star, title: 'Verified Reviews', desc: 'Read genuine reviews from real customers' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold uppercase tracking-wide">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-4">
              Premium Grooming Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From classic cuts to modern styles, we offer a wide range of grooming services tailored to your needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Haircuts & Styling', icon: '✂️', desc: 'Professional cuts and styling for all hair types', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600' },
              { title: 'Beard Grooming', icon: '🧔', desc: 'Expert beard trimming, shaping, and care', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600' },
              { title: 'Hair Color & Treatment', icon: '🎨', desc: 'Vibrant colors and nourishing treatments', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600' },
            ].map((service, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group">
                <div className="relative overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">{service.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                  <Link to="/search" className="text-primary font-semibold flex items-center hover:underline">
                    Book Now <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold uppercase tracking-wide">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-6">
                Elevating Your Hair with Personalized Care & Expertise
              </h2>
              <p className="text-gray-600 mb-6">
                We connect you with skilled barbers and premium salons in your area. Our platform makes it easy to discover, book, and enjoy professional grooming services.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Verified and experienced professionals',
                  'Flexible booking and instant confirmation',
                  'Secure payments and transparent pricing',
                  '24/7 customer support',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/search" className="btn-primary">Explore Now</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?w=400" alt="Haircut" className="rounded-2xl w-full h-64 object-cover shadow-lg" />
              <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400" alt="Styling" className="rounded-2xl w-full h-64 object-cover shadow-lg mt-8" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold uppercase tracking-wide">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-4">
              The BarberBook Advantage
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Top Rated', desc: 'Only the best salons and barbers on our platform' },
              { icon: Clock, title: '24/7 Booking', desc: 'Book appointments anytime, anywhere' },
              { icon: ShieldCheck, title: 'Verified', desc: 'All professionals are background checked' },
              { icon: Users, title: 'Trusted', desc: 'Thousands of happy customers nationwide' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary hover:text-white transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Look Your Best?</h2>
              <p className="text-lg mb-8 text-white/90">Join thousands of satisfied customers who trust BarberBook for their grooming needs.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/search" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center">
                  Find a Barber Near You
                </Link>
                <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-center">
                  Sign Up Free
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '500+', label: 'Partner Shops' },
                { num: '10K+', label: 'Happy Customers' },
                { num: '50+', label: 'Cities Covered' },
                { num: '4.8', label: 'Average Rating' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold mb-1">{stat.num}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold uppercase tracking-wide">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-4">
              Meet Our Professional Hair Stylists
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', role: 'Master Barber', exp: '10 Years', img: '1507003211169' },
              { name: 'Amit Verma', role: 'Style Expert', exp: '7 Years', img: '1472099644585' },
              { name: 'Priya Singh', role: 'Color Specialist', exp: '5 Years', img: '1438761681033' },
            ].map((stylist, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-4">
                  <img src={`https://images.unsplash.com/photo-${stylist.img}?w=400`} alt={stylist.name} className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-2xl transition-all" />
                  <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <h3 className="text-xl font-bold">{stylist.name}</h3>
                <p className="text-primary font-medium">{stylist.role}</p>
                <p className="text-gray-500 text-sm">{stylist.exp} Experience</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold uppercase tracking-wide">Contact Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2 mb-4">
              Get In Touch
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Thank you! We will get back to you soon.') }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="john@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="How can we help?" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Your message..." required></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-3">Send Message</button>
              </form>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Our Office</h3>
                  <p className="text-gray-600">123 Barber Street, MG Road, Near City Mall, Bangalore - 560001</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Call Us</h3>
                  <p className="text-gray-600">+91 98765 43210</p>
                  <p className="text-sm text-gray-500">Mon - Sat, 9am - 6pm</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-gray-600">support@barberbook.com</p>
                  <p className="text-sm text-gray-500">We'll reply within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
