# NGO Registration & Donation Management System

A full-stack web application built for managing NGO member registrations and donations with secure payment integration via PayHere.

## 🎯 Project Overview

This project is part of the **NSS IIT Roorkee Open Project 2026**. It provides a comprehensive platform for:
- User registration and authentication
- Secure donation processing
- Admin/Owner management dashboard
- Payment tracking and verification

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript
- **Database:** PostgreSQL (via Neon)
- **ORM:** Prisma 6
- **Authentication:** NextAuth.js with Credentials Provider
- **Payment Gateway:** PayHere (Sandbox)
- **Styling:** Tailwind CSS

## 📋 Features

### User Roles

1. **MEMBER (User)**
   - Self-registration with email/password
   - Make donations via PayHere
   - View donation history
   - View profile with donation stats

2. **ADMIN**
   - View all member registrations
   - Filter and export member data
   - View all donation records
   - Track payment statuses
   - View statistics dashboard

3. **OWNER**
   - All admin privileges
   - Create and delete admin accounts
   - Full system control

### Core Functionality

#### Authentication
- Secure credential-based authentication
- Role-based access control
- Protected routes for admin/owner
- Session management with NextAuth

#### Member Registration
- Independent of donation process
- Email and password-based signup
- Automatic role assignment (MEMBER)

#### Donation System
- PayHere sandbox integration
- Secure payment processing
- Backend verification of payments
- Status tracking: CREATED → SUCCESS/FAILED
- All donation attempts logged

#### Admin Dashboard
- **Stats:** Total registrations, donations, success rate
- **Registrations:** View/filter/export member data
- **Donations:** Track all payments with timestamps
- **Create Admin:** Owner-only feature to add admins

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- PayHere sandbox account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/HarshitOnClouds/ngo-app.git
cd ngo-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**

Create `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# PayHere Sandbox
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX=true

# Public URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Database Setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed owner account
npx prisma db seed
```

5. **Run Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ngo-app/
├── src/
│   ├── app/
│   │   ├── (pages)/
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── member/         # Member portal pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/
│   │   │   ├── auth/           # Authentication routes
│   │   │   ├── admins/         # Admin routes
│   │   │   ├── donations/      # Donation API
│   │   │   ├── members/        # Member data
│   │   │   └── stats/          # Statistics
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── providers.jsx
│   │   
│   └── lib/
│       ├── auth.js             # NextAuth configuration
│       ├── authorize.js        # Role-based middleware
│       └── prisma.js           # Prisma client
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.local
└── package.json
```

## 🗄️ Database Schema

### User Model
- `id` - Unique identifier
- `name` - User's full name
- `email` - Unique email (login credential)
- `password` - Bcrypt hashed password
- `role` - MEMBER | ADMIN | OWNER
- `createdAt` - Registration timestamp

### Donation Model
- `id` - Unique identifier (used as order_id)
- `userId` - Foreign key to User
- `amount` - Amount in cents (LKR)
- `status` - CREATED | SUCCESS | FAILED
- `gateway` - Payment gateway (PAYHERE)
- `gatewayOrderId` - PayHere order ID
- `gatewayPaymentId` - PayHere payment ID
- `gatewaySignature` - MD5 signature for verification
- `createdAt` - Donation creation time
- `updatedAt` - Status update time

## 🔐 Security Features

1. **Password Hashing:** bcryptjs with salt rounds = 10
2. **Payment Verification:** MD5 signature validation
3. **Backend-Only Trust:** No frontend payment manipulation
4. **Role-Based Access:** Middleware protection on routes
5. **Session Management:** Secure NextAuth sessions

## 💳 Payment Flow

1. User selects donation amount
2. Backend creates Donation record (status: CREATED)
3. Backend generates PayHere hash
4. User redirected to PayHere checkout (form POST)
5. User completes payment
6. PayHere sends notification to `/api/donations/notify`
7. Backend verifies signature and updates status
8. User redirected back to member portal

## 📊 API Routes

### Public
- `POST /api/auth/register` - Member registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Authenticated (Member)
- `POST /api/payhere/generate-hash` - Generate payment hash
- `GET /api/donations/history` - User's donations
- `GET /api/user/profile` - User profile

### Admin/Owner Only
- `GET /api/view-members` - All members
- `GET /api/admins/donations` - All donations
- `GET /api/donations/stats` - Statistics
- `GET /api/stats/registrations` - Registration count

### Owner Only
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create admin
- `DELETE /api/admins/[id]` - Delete admin

### Webhook
- `POST /api/donations/notify` - PayHere payment notification

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Important:** Update `NEXT_PUBLIC_BASE_URL` and `NEXTAUTH_URL` to your production URL.

### PayHere Configuration

For production:
- Change `action` URL to `https://www.payhere.lk/pay/checkout`
- Update merchant credentials
- Set `PAYHERE_SANDBOX=false`

## 🧪 Testing

### Test Credentials (After Seeding)

**Owner Account:**
- Email: `owner@ngo.com`
- Password: `owner123`

**PayHere Sandbox Test Cards:**
- Visa: `4916217501611292`
- Mastercard: `5307732125531191`

## 📝 Design Principles

1. **User Independence:** Users exist without donations
2. **All Attempts Tracked:** Never delete failed donations
3. **Backend Verification:** No frontend trust for payments
4. **Clear Separation:** User data ≠ Donation data
5. **Audit Trail:** Timestamps on all records
