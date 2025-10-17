# Apex Auto Movers - Setup Guide

## Overview

This is a full-stack vehicle transport quote management system built with:
- **Frontend**: React + Tailwind CSS + Motion (animations)
- **Backend**: Supabase (authentication + database via KV store)
- **Features**: Quote submission, user authentication, user dashboard, admin dashboard

## Getting Started

### 1. Create Your First Admin Account

To access the admin dashboard, you need to create an admin account:

1. Visit the signup page: `#/signup`
2. Create a new account with your email and password
3. After signing up, you'll be automatically logged in

### 2. Upgrade Your Account to Admin

Since the first user needs to be an admin, you'll need to manually upgrade your account:

**Option A: Use the browser console** (on the Dashboard or any logged-in page):
```javascript
// Get your user ID
const user = await (await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-f0a9c31f/profile', {
  headers: { 'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session.access_token }
})).json();

// Note your user ID, then manually update it via the KV store
// You'll need to use Supabase dashboard or contact support
```

**Option B: Temporary workaround** (for development):
You can temporarily modify the `/supabase/functions/server/index.tsx` signup endpoint to set the first user as admin:
```typescript
await kv.set(`profile:${data.user.id}`, {
  id: data.user.id,
  email,
  name,
  role: 'admin', // Change from 'user' to 'admin' for first account
  created_at: new Date().toISOString(),
});
```

After creating your admin account, change it back to `'user'` for subsequent signups.

## Application Structure

### Pages

1. **Landing Page** (`/` or `#/`)
   - Hero section with parallax background
   - Quote form (above the fold)
   - Feature tiles
   - Testimonials
   - Newsletter signup
   - Footer

2. **Login Page** (`#/login`)
   - Sign in with email/password
   - Link to signup page
   - Supabase authentication

3. **Signup Page** (`#/signup`)
   - Create new account
   - Auto-login after signup
   - Redirect to dashboard

4. **User Dashboard** (`#/dashboard`)
   - Protected route (requires authentication)
   - View submitted quotes
   - See quote status
   - Track vehicle transport progress

5. **Admin Dashboard** (`#/admin`)
   - Protected route (requires admin role)
   - View all quotes from all users
   - Update quote status
   - Search and filter functionality

### Database Schema (KV Store)

The application uses Supabase's built-in KV store with the following key patterns:

- `profile:{userId}` - User profiles
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user" | "admin",
    "created_at": "ISO date"
  }
  ```

- `quote:{quoteId}` - Individual quotes
  ```json
  {
    "id": "uuid",
    "user_id": "uuid or 'guest'",
    "pickup_location": "City, State",
    "delivery_location": "City, State",
    "vehicle": "2023 Toyota Camry",
    "transport_type": "open" | "enclosed",
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "(555) 123-4567",
    "status": "new" | "quoted" | "booked" | "in_transit" | "completed" | "cancelled",
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
  ```

- `user_quotes:{userId}` - Array of quote IDs for each user
  ```json
  ["quoteId1", "quoteId2", ...]
  ```

- `newsletter:{subscriberId}` - Newsletter subscribers
  ```json
  {
    "id": "uuid",
    "email": "subscriber@example.com",
    "subscribed_at": "ISO date"
  }
  ```

### API Endpoints

All endpoints are prefixed with `/make-server-f0a9c31f/`:

- `POST /signup` - Create new user account
- `POST /quote` - Submit a quote (authenticated or guest)
- `GET /quotes/my` - Get current user's quotes (authenticated)
- `GET /quotes/all` - Get all quotes (admin only)
- `PATCH /quotes/:id/status` - Update quote status (admin only)
- `POST /newsletter` - Subscribe to newsletter
- `GET /profile` - Get user profile (authenticated)

### Authentication Flow

1. **Signup**: Creates user in Supabase Auth + stores profile in KV store
2. **Login**: Uses Supabase Auth for session management
3. **Protected Routes**: Check for valid session via `getCurrentUser()`
4. **Admin Routes**: Additionally check user role in profile

## Features

### Guest Quote Submission
- Users can submit quotes without creating an account
- Quotes are saved with `user_id: "guest"`
- Email notification sent with login link to view quote later

### User Dashboard
- View all personal quotes
- See quote status and history
- Request new quotes
- Responsive design for mobile/tablet/desktop

### Admin Dashboard
- Comprehensive quote management
- Search by customer name, email, vehicle, location
- Filter by quote status
- Update status with dropdown
- Real-time updates
- Responsive table layout

### Animations
- Parallax scrolling on hero section
- Smooth page transitions
- Form success animations
- Hover effects on cards and buttons
- Loading skeletons

## Design System

### Colors
- **Deep Navy**: `#0A1020` (backgrounds)
- **Neon Emerald**: `#00FFB0` (accents, CTAs)
- **White**: `#FFFFFF` (text, cards)

### Typography
- Modern sans-serif (system defaults)
- Bold headlines
- Light body text

### Components
- All UI components from shadcn/ui
- Custom styling with Tailwind CSS
- Consistent spacing and sizing (12-column grid, max-width 1280px)

## Development Tips

### Testing Quote Flow
1. Submit a quote as a guest on landing page
2. Create account with signup
3. Submit another quote while logged in
4. View quotes in dashboard
5. Access admin dashboard to manage all quotes

### Creating Test Data
Use the signup page to create multiple user accounts, then submit quotes from each account to test the admin dashboard filtering and search features.

### Mobile Testing
The app is fully responsive. Test on:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px+

## Security Notes

⚠️ **Important**: This is a prototype/MVP application. For production use:

1. Enable email confirmation in Supabase
2. Add rate limiting to API endpoints
3. Implement CAPTCHA on forms
4. Add proper error logging
5. Set up email service for notifications
6. Review and tighten Row Level Security policies
7. Use environment variables properly
8. Add input validation and sanitization
9. Implement proper session management
10. Add GDPR compliance features

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection is active
3. Ensure environment variables are set correctly
4. Review API logs in Supabase dashboard
