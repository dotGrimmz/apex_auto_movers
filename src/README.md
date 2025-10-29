# Apex Auto Movers - Vehicle Transport Quote System

A modern, full-stack web application for managing vehicle transport quotes with user authentication and admin capabilities.

## 🚀 Quick Start

### For First-Time Setup

1. **Create Your Account**
   - Visit `#/signup` to create a new account
   - You'll be automatically logged in after signup

2. **Setup First Admin (Important!)**
   - Visit `#/admin-setup` for detailed instructions on creating your first admin account
   - OR see `SETUP.md` for step-by-step guide

3. **Access Your Dashboard**
   - Regular users: `#/dashboard` - View your submitted quotes
   - Admin users: `#/admin` - Manage all quotes from all customers

### Quick Navigation

- **Home**: `#/` or just `/` - Main landing page with quote form
- **Login**: `#/login` - Sign in to existing account  
- **Signup**: `#/signup` - Create new account
- **Dashboard**: `#/dashboard` - View your quotes (protected)
- **Admin**: `#/admin` - Manage all quotes (admin only)
- **Admin Setup**: `#/admin-setup` - Instructions for first admin

## ✨ Features

### Public Features
- **Parallax Hero Section** - Smooth scrolling background with map imagery
- **Instant Quote Form** - Submit quotes as guest or logged-in user
- **Feature Highlights** - Door-to-door, fully insured, nationwide coverage
- **Customer Testimonials** - Social proof with ratings
- **Newsletter Signup** - Email capture for marketing

### User Features (Authenticated)
- **Personal Dashboard** - View all submitted quotes
- **Quote Tracking** - Monitor status changes (New → Quoted → Booked → In Transit → Completed)
- **Quote History** - See all past requests with timestamps
- **Responsive Design** - Works on mobile, tablet, and desktop

### Admin Features (Admin Role Required)
- **Quote Management** - View and manage ALL customer quotes
- **Status Updates** - Change quote status with dropdown
- **Search & Filter** - Find quotes by customer, vehicle, location, or status
- **Real-time Stats** - See total and filtered quote counts
- **Bulk Operations** - Filter by status for batch processing

## 🎨 Design

### Color Palette
- **Primary Background**: Deep Navy `#0A1020`
- **Accent/CTA**: Neon Emerald `#00FFB0`
- **Text**: White `#FFFFFF` with opacity variations

### Layout
- **Max Width**: 1280px
- **Grid**: 12-column responsive grid
- **Breakpoints**: Mobile (375px), Tablet (768px), Desktop (1280px+)

### Animations
- Parallax scrolling on hero
- Form success confirmations
- Smooth page transitions
- Hover effects on all interactive elements
- Loading skeletons for better UX

## 🏗️ Technical Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling
- **Motion (Framer Motion)** - Animations
- **shadcn/ui** - Component library

### Backend
- **Supabase Auth** - User authentication
- **Supabase Edge Functions** - Serverless API (Hono framework)
- **KV Store** - Database (using Supabase's built-in key-value store)

### API Endpoints
All endpoints are now same-origin under `/api`:
- `POST /signup` - User registration
- `POST /quote` - Submit transport quote
- `GET /quotes/my` - Get user's quotes
- `GET /quotes/all` - Get all quotes (admin)
- `PATCH /quotes/:id/status` - Update status (admin)
- `POST /newsletter` - Subscribe to newsletter
- `GET /profile` - Get user profile

## 📊 Database Schema

### Collections (KV Store Keys)

**User Profiles**: `profile:{userId}`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user" | "admin"
}
```

**Quotes**: `quote:{quoteId}`
```json
{
  "id": "uuid",
  "user_id": "uuid or 'guest'",
  "pickup_location": "Los Angeles, CA",
  "delivery_location": "New York, NY",
  "vehicle": "2023 Tesla Model 3",
  "transport_type": "open" | "enclosed",
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "(555) 123-4567",
  "status": "new" | "quoted" | "booked" | "in_transit" | "completed" | "cancelled",
  "created_at": "2025-10-17T10:00:00Z",
  "updated_at": "2025-10-17T10:00:00Z"
}
```

**User Quote Lists**: `user_quotes:{userId}`
```json
["quoteId1", "quoteId2", "quoteId3"]
```

**Newsletter**: `newsletter:{subscriberId}`
```json
{
  "id": "uuid",
  "email": "subscriber@email.com",
  "subscribed_at": "2025-10-17T10:00:00Z"
}
```

## 🔒 Security

### Current Implementation
- Supabase authentication for user management
- Session-based access control
- Role-based authorization (user/admin)
- Protected routes with authentication checks
- Admin-only endpoints with role verification

### Production Recommendations
⚠️ **This is an MVP/Prototype** - Before going to production:

1. Enable email verification in Supabase
2. Add rate limiting to API endpoints
3. Implement CAPTCHA on forms
4. Set up proper email notification service
5. Add comprehensive input validation
6. Implement proper error logging
7. Review and tighten security policies
8. Add GDPR compliance features
9. Set up monitoring and alerts
10. Implement backup strategy

## 📱 Usage Examples

### As a Customer (Guest)
1. Visit the homepage
2. Fill out the quote form (no account needed)
3. Receive quote confirmation
4. Optional: Create account to track quote status

### As a Registered User
1. Sign up or log in
2. Submit quote from homepage
3. Visit dashboard to see all your quotes
4. Track status changes in real-time

### As an Admin
1. Log in with admin account
2. Navigate to Admin Dashboard
3. View all customer quotes in table
4. Search/filter by customer, status, etc.
5. Update quote status with dropdown
6. Monitor quote pipeline

## 🛠️ Development

### Local Development
The app uses hash-based routing (`#/path`) so it works without a server.

### Adding Features
- **New API Endpoint**: Add to `/supabase/functions/server/index.tsx`
- **New Page**: Create in `/pages/` and add route to `/App.tsx`
- **New Component**: Add to `/components/`
- **New Utility**: Add to `/utils/`

### Testing Tips
1. Create multiple test accounts
2. Submit quotes from different accounts
3. Test admin features with filters
4. Test responsive design at different breakpoints
5. Test authentication flows (signup, login, logout)

## 📞 Support & Documentation

- **Full Setup Guide**: See `SETUP.md`
- **Admin Setup**: Visit `#/admin-setup` or see `SETUP.md`
- **API Documentation**: See endpoint comments in `/supabase/functions/server/index.tsx`

## 📝 License

This is a prototype/MVP application. Please ensure proper licensing and compliance before production use.

---

**Built with** ⚡️ **by Figma Make**

For questions or issues, check the browser console for detailed error messages and review the setup documentation.
