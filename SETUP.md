# TOCdoc Setup Guide - Pre-Alpha

This guide will help you set up the TOCdoc application with role-based authentication using Clerk.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Clerk account (free tier available)

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tocdoc?schema=public"
```

## Getting Clerk Keys

1. Go to [clerk.dev](https://clerk.dev) and create a free account
2. Create a new application
3. In your Clerk dashboard, go to "API Keys"
4. Copy the "Publishable key" and "Secret key"
5. Replace the placeholder values in your `.env.local` file

## Database Setup

1. Make sure PostgreSQL is running
2. Create a database named `tocdoc`
3. Update the `DATABASE_URL` in your `.env.local` file
4. Run the database migrations:

```bash
npx prisma migrate dev
```

5. Seed the database with test data:

```bash
npm run seed
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Start the development server:

```bash
npm run dev
```

## User Roles and Features

### Administrator Role
- **Full system access**: Can view all patients system-wide
- **Patient management**: Create, update, and delete patient records
- **HIPAA compliance**: Manage 30-day record retention and cleanup
- **Analytics**: View system statistics and physician summaries
- **Access**: Admin Panel and all physician features

### Physician Role
- **Patient-specific access**: Can only view patients assigned to them
- **Notifications**: Receive discharge notifications for their patients
- **Care coordination**: Manage follow-up care and transition planning
- **Limited creation**: Cannot create patient admissions (admin-only)
- **Access**: Dashboard, patient list, and notification settings

## First-Time Setup

1. Start the application (`npm run dev`)
2. Navigate to `http://localhost:3000/sign-up`
3. Create your first user account
4. Select your role (Administrator or Physician) on the onboarding page
5. Access your role-specific dashboard

## Key Differences from Demo Mode

### Authentication
- **Before**: Mock users with hardcoded emails
- **After**: Real Clerk authentication with secure sessions

### Authorization
- **Before**: Role checking based on email patterns
- **After**: Database-stored roles with proper middleware protection

### Data Access
- **Before**: All users could see all data
- **After**: Role-based data filtering (physicians see only their patients)

### User Management
- **Before**: No user creation process
- **After**: Proper onboarding flow with role selection

## Security Features

- **Session-based authentication** via Clerk
- **Role-based access control** at API and UI levels
- **Middleware protection** for authenticated routes
- **HIPAA-compliant data handling** with 30-day retention
- **Protected health information** never included in notifications

## API Changes

All API endpoints now:
- Require proper authentication
- Use real user sessions instead of URL parameters
- Implement role-based access control
- Return appropriate HTTP status codes for unauthorized access

## Troubleshooting

### Common Issues

1. **Clerk keys not working**: Make sure you copied the correct keys from your Clerk dashboard
2. **Database connection errors**: Verify your PostgreSQL is running and `DATABASE_URL` is correct
3. **Role not showing**: Complete the onboarding process after signing up
4. **Admin panel not visible**: Only administrators can see the admin panel link
5. **Clerk SignIn component error**: The sign-in route is configured as a catch-all route (`/sign-in/[[...sign-in]]/page.tsx`) to work properly with Clerk

### Clerk-Specific Issues

If you see an error about the SignIn component not being configured correctly:
- The sign-in route is already set up as a catch-all route: `/sign-in/[[...sign-in]]/page.tsx`
- The middleware includes `(.*)` patterns for sign-in and sign-up routes
- The onboarding route is included in public routes for new user setup

### Development Tips

- Use the browser's developer tools to check for authentication errors
- Check the server console for API error messages
- Verify your user role in the database if access issues persist
- Clear browser cache and cookies if experiencing authentication issues

## Next Steps for Production

1. Set up production Clerk application
2. Configure production database
3. Add proper error handling and logging
4. Implement email/SMS notification services
5. Add comprehensive testing
6. Set up CI/CD pipeline
7. Configure monitoring and analytics

## Support

This is a pre-alpha version. For issues or questions:
1. Check the browser console for errors
2. Review server logs for API issues
3. Verify environment variables are set correctly 