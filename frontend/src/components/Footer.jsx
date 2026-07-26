import React from 'react'
import { Link } from 'react-router-dom'
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Award, ShieldCheck } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BarberBook</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Your trusted platform for booking barber and salon appointments. Find the best grooming services near you.</p>
            <div className="flex space-x-4">
              <Instagram className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Facebook className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-400 hover:text-primary transition-colors">Home</Link>
              <Link to="/search" className="block text-gray-400 hover:text-primary transition-colors">Find Barbers</Link>
              <Link to="/register-organization" className="block text-gray-400 hover:text-primary transition-colors">Register Shop</Link>
              <Link to="/login" className="block text-gray-400 hover:text-primary transition-colors">Sign In</Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-400 hover:text-primary transition-colors">About Us</Link>
              <Link to="/" className="block text-gray-400 hover:text-primary transition-colors">Contact Us</Link>
              <Link to="/" className="block text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/" className="block text-gray-400 hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-primary" /> +91 98765 43210</div>
              <div className="flex items-center"><Mail className="h-4 w-4 mr-2 text-primary" /> info@barberbook.com</div>
              <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> Mumbai, India</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm"> BarberBook. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Award className="h-4 w-4 text-primary" />
              <span>Trusted Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
