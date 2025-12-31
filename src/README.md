# SmartLenderUp - Comprehensive Microfinance Platform

A sophisticated microfinance platform built for the Kenyan market with role-based access control, AI-powered insights, and comprehensive loan management capabilities.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Three user types (Admin, Manager, Officer) with granular permissions
- **Five-Phase Loan Approval Workflow**: Comprehensive loan application and approval process
- **Multi-Currency Support**: Dynamic currency system for 14 countries
- **14-Day Free Trial**: Automatic countdown with Stripe payment integration
- **Real-time Data Sync**: Single-object sync pattern with Supabase

### Financial Management
- **Loan Management**: Complete loan lifecycle management with CL001-style client IDs
- **Payment Processing**: Track payments, collections, and reconciliation
- **Payroll System**: Comprehensive employee payroll management
- **Journal Entries**: Double-entry bookkeeping system
- **Expense Tracking**: Monitor and categorize business expenses

### AI & Analytics
- **AI Insights Tab**: Five AI-powered features for intelligent decision making
- **Credit Scoring**: Automated credit assessment
- **Risk Analysis**: Predictive analytics for loan defaults
- **Reports & Analytics**: Comprehensive reporting dashboard

### Administration
- **Super Admin Panel**: Access by clicking logo 5 times on login page
- **Loan Products Configuration**: Customize loan types and terms
- **SMS Campaigns**: Bulk messaging for client communication
- **Document Management**: Secure document storage and retrieval
- **Audit Trail**: Complete activity logging

## 🎨 Design

- **Color Theme**: Sophisticated blend of blue-brown tones with cool navy and midnight blue shades
- **Background**: Deep charcoal (#111120) for consistency
- **Typography**: Professional, clean, and readable
- **Number Formatting**: Automatic comma formatting for better readability

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4.0
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/alngumba-sys/smartlenderup.git
   cd smartlenderup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Update `/lib/supabase.ts` with your Supabase credentials
   - Run the SQL migration script in Supabase SQL Editor (see `SUPABASE_MIGRATION.sql`)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🗄️ Database Setup

Run the SQL migration script located in `SUPABASE_MIGRATION.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `SUPABASE_MIGRATION.sql`
5. Click "Run"

This will create:
- `project_states` table (single-object sync pattern)
- `stripe_customers` table (customer tracking)
- `stripe_subscriptions` table (subscription management)
- All necessary indexes and RLS policies

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
5. Click Deploy

**⚠️ Security Note**: Never commit your service role key or expose it in production!

## 📱 Usage

### Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Manager Account:**
- Username: `manager`
- Password: `manager123`

**Loan Officer Account:**
- Username: `officer`
- Password: `officer123`

### Super Admin Access
Click the SmartLenderUp logo **5 times** on the login page to access the Super Admin Control Panel.

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Service role key used only in development (bypasses RLS)
- Anon key used in production
- Password hashing for user authentication
- Role-based permission system

## 📊 Data Structure

### Client ID Format
- Format: `CL###` (e.g., CL001, CL002)
- Maximum: 5 alphanumeric characters
- Auto-generated and unique

### Currency Support
14 supported countries with automatic currency formatting:
- Kenya (KES), Uganda (UGX), Tanzania (TZS), Rwanda (RWF)
- Ethiopia (ETB), Nigeria (NGN), Ghana (GHS), South Africa (ZAR)
- Zambia (ZMW), Zimbabwe (USD), Malawi (MWK), Mozambique (MZN)
- Botswana (BWP), USA (USD)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email: support@smartlenderup.com

## 🙏 Acknowledgments

- Built with ❤️ for the Kenyan microfinance sector
- Powered by Supabase and Stripe
- UI components from Lucide React

---

**Version**: 1.0.0  
**Last Updated**: December 30, 2024  
**Status**: Production Ready ✅
