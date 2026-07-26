# Barber Appointment Booking Platform

A full-stack MERN application for booking barber and salon appointments. Customers can search and book appointments at barber shops, while organizations can register and manage their business.

## Features

### Customer
- Register / Login with JWT authentication
- Search barbers/salons by location, name, services
- View shop details, services, pricing, reviews
- Book appointments with date/time slot selection
- View booking history (upcoming, past, cancelled)
- Cancel and reschedule appointments

### Organization
- Register business (pending admin approval)
- Manage shop details, services, and barbers/staff
- View and manage appointments
- Track revenue and ratings

### Admin
- Manage users and organizations
- Verify and suspend organizations
- Monitor appointments and payments
- View platform statistics

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Redux Toolkit
- Axios
- React Hook Form
- Lucide React icons

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- Razorpay (payment)
- Cloudinary (image upload)
- Nodemailer (email)
- Twilio (SMS/OTP)

## Project Structure

```
Barber website/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── organization.model.js
│   │   ├── barber.model.js
│   │   ├── service.model.js
│   │   ├── appointment.model.js
│   │   ├── payment.model.js
│   │   └── review.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── organization.routes.js
│   │   ├── barber.routes.js
│   │   ├── service.routes.js
│   │   ├── appointment.routes.js
│   │   ├── review.routes.js
│   │   ├── admin.routes.js
│   │   └── payment.routes.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── authSlice.js
│   │   │   │   └── authAPI.js
│   │   │   ├── organization/
│   │   │   │   ├── organizationSlice.js
│   │   │   │   └── organizationAPI.js
│   │   │   └── appointment/
│   │   │       ├── appointmentSlice.js
│   │   │       └── appointmentAPI.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── ShopDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── OrganizationDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── OrganizationRegister.jsx
│   │   ├── utils/
│   │   │   ├── authAPI.js
│   │   │   ├── organizationAPI.js
│   │   │   └── appointmentAPI.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/barber-booking
   JWT_SECRET=your_jwt_secret_key_here
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:3000

## Database Models

### User
- name, email, phone, password, role (customer/organization/admin)
- isVerified, avatar

### Organization
- ownerId, name, description, businessType
- address, city, state, pincode, location (GeoJSON)
- images, coverImage, logo
- contactPhone, contactEmail, openingTime, closingTime
- status (pending/approved/rejected/suspended)
- rating, totalReviews
- businessLicense, gstNumber

### Barber
- organizationId, name, specialization, experience
- rating, totalReviews, avatar, bio
- isAvailable, workingHours
- services

### Service
- organizationId, name, description, price, duration
- category, image, isActive

### Appointment
- userId, organizationId, barberId, serviceId
- date, timeSlot (start, end)
- status (pending/confirmed/rejected/cancelled/rescheduled/completed/no-show)
- paymentStatus, paymentMethod, transactionId
- amount, notes

### Payment
- appointmentId, userId, organizationId
- amount, currency, transactionId
- razorpayOrderId, razorpayPaymentId
- status, paymentMethod

### Review
- userId, organizationId, appointmentId
- rating, comment, images

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/profile` - Update profile

### Organizations
- POST `/api/organizations` - Create organization
- GET `/api/organizations` - List organizations
- GET `/api/organizations/:id` - Get organization
- PUT `/api/organizations/:id` - Update organization
- DELETE `/api/organizations/:id` - Delete organization

### Barbers
- POST `/api/barbers` - Add barber
- GET `/api/barbers/organization/:orgId` - List barbers
- PUT `/api/barbers/:id` - Update barber
- DELETE `/api/barbers/:id` - Delete barber

### Services
- POST `/api/services` - Add service
- GET `/api/services/organization/:orgId` - List services
- PUT `/api/services/:id` - Update service
- DELETE `/api/services/:id` - Delete service

### Appointments
- POST `/api/appointments` - Create appointment
- GET `/api/appointments/customer` - Get customer appointments
- GET `/api/appointments/organization/:orgId` - Get org appointments
- PUT `/api/appointments/:id/status` - Update status
- PUT `/api/appointments/:id/cancel` - Cancel appointment

### Reviews
- POST `/api/reviews` - Create review
- GET `/api/reviews/organization/:orgId` - Get org reviews

### Admin
- GET `/api/admin/stats` - Platform statistics
- GET `/api/admin/users` - List users
- GET `/api/admin/organizations` - List organizations
- PUT `/api/admin/organizations/:id/verify` - Verify organization
- PUT `/api/admin/organizations/:id/suspend` - Suspend organization

### Payments
- POST `/api/payment/create-order` - Create Razorpay order
- POST `/api/payment/verify` - Verify payment

## Deployment

### Backend
- Deploy to Render, Railway, or any Node.js hosting
- Use MongoDB Atlas for database
- Set environment variables in hosting dashboard

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to Vercel, Netlify, or any static hosting

## License


