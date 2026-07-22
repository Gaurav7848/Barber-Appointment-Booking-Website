import React from 'react'
import { Link } from 'react-router-dom'
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BarberBook</span>
            </div>
            <p className="text-gray-400 text-sm">Your trusted platform for booking barber and salon appointments. Find the best grooming services near you.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/search" className="block text-gray-400 hover:text-primary transition-colors">Find Barbers</Link>
              <Link to="/register-organization" className="block text-gray-400 hover:text-primary transition-colors">Register Shop</Link>
              <Link to="/login" className="block text-gray-400 hover:text-primary transition-colors">Sign In</Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> +91 98765 43210</div>
              <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /> info@barberbook.com</div>
              <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Mumbai, India</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Instagram className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
              <Facebook className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          BarberBook. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
