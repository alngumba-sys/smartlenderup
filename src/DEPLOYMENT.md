# SmartLenderUp Platform - Deployment Guide

## Platform Overview
A comprehensive microfinance platform for Kenya serving both internal staff and external clients, with M-Pesa integration, AI-powered insights, and role-based access control.

## Features Implemented
✅ Landing page with sophisticated dark blue theme (#020838)
✅ Three registration types: Organization, Individual, Group
✅ Authentication system with login/logout
✅ Internal staff portal with full loan management
✅ Client portal for loan applications and tracking  
✅ M-Pesa integration interface
✅ Privacy Policy, Terms of Service, and Cookie Policy modals
✅ Responsive design with mobile support
✅ Role-based access control
✅ Connected navigation and dropdowns
✅ Pricing tiers (Starter, Growth, Professional, Enterprise)

## All Links Connected
- ✅ Product dropdown info popups
- ✅ Customer dropdown info popups
- ✅ Features dropdown info popups
- ✅ Privacy Policy → Modal
- ✅ Terms of Service → Modal
- ✅ Cookie Policy → Modal
- ✅ Registration type selection → Sign up modals
- ✅ Sign in → Login dropdown
- ✅ Pricing → Pricing popup with scrolling
- ✅ Terms/Privacy links in sign-up forms → Respective modals

## Syncing to Local Environment

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git (for version control)

### Steps to Sync

1. **Download the project files**
   - Download all files from this Figma Make project
   - Save them to a local folder (e.g., `smartlenderup-platform`)

2. **Navigate to project directory**
   ```bash
   cd smartlenderup-platform
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **View in browser**
   - Open http://localhost:5173 (or the port shown in terminal)
   - The platform should load with SmartLenderUp landing page

### Default Login Credentials
**Admin Access:**
- Email/Username: `admin@bvfunguo.com` or `admin`
- Password: `admin123`

**Employee Access:**
- Email: `john.doe@bvfunguo.com`
- Password: `password123`

### File Structure
```
/
├── App.tsx                          # Main application entry
├── components/
│   ├── LoginPage.tsx                # Landing & login page
│   ├── InternalStaffPortal.tsx      # Staff dashboard
│   ├── ClientPortal.tsx             # Client dashboard
│   ├── modals/
│   │   ├── RegistrationTypeModal.tsx
│   │   ├── OrganizationSignUpModal.tsx
│   │   ├── IndividualSignUpModal.tsx
│   │   └── GroupSignUpModal.tsx
│   └── ...
├── contexts/
│   ├── AuthContext.tsx              # Authentication state
│   ├── DataContext.tsx              # Data management
│   ├── ThemeContext.tsx             # Theme management
│   └── NavigationContext.tsx        # Navigation state
└── styles/
    └── globals.css                  # Global styles & Tailwind

```

### Environment Variables (Optional)
Create a `.env` file in the root for any API keys:
```env
VITE_MPESA_CONSUMER_KEY=your_key_here
VITE_MPESA_CONSUMER_SECRET=your_secret_here
```

### Building for Production
```bash
npm run build
```

The build output will be in the `dist` folder, ready for deployment to any static hosting service (Vercel, Netlify, etc.)

### Troubleshooting
- **Port already in use**: Change port in vite.config.ts or kill the process using that port
- **Missing dependencies**: Run `npm install` again
- **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Next Steps for Production
1. Set up real M-Pesa API credentials
2. Configure proper database (Supabase recommended)
3. Add email service for notifications
4. Set up proper authentication with JWT
5. Add SSL certificate for HTTPS
6. Configure proper error logging and monitoring

## Support
For questions or issues, contact the development team.

---
**Last Updated**: December 19, 2025
**Version**: 1.0.0
