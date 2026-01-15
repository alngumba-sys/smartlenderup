# 🎛️ Pricing Remote Control - Super Admin Guide

## Overview
The Pricing Remote Control is a powerful admin panel that allows Super Admins to manage all pricing, limits, and features for the SmartLenderUp platform in real-time.

## 🔐 Access

### Location
Navigate to: **Administration Tab → Pricing Control**

### Permissions
- Only accessible to Super Admins
- Requires authentication with Super Admin credentials
- Changes are saved to Supabase database

## 🎯 Features

### 1. Plan Management
Control four subscription tiers:
- **Starter** (Free tier)
- **Growth** ($99/month or $990/year)
- **Professional** ($249/month or $2,490/year) - Marked as "POPULAR"
- **Enterprise** (Custom pricing)

### 2. Pricing Controls

#### Monthly/Yearly Pricing
- Set different prices for monthly and yearly billing cycles
- Yearly pricing automatically shows "Save 17%" badge on public page
- Input fields for each plan with live preview

#### Global Discount
- Apply site-wide discount (0-100%)
- One input field affects ALL plans instantly
- Shows discounted price alongside original price
- Displays special offer badge on public pricing page

### 3. Plan Limits (The "Valves")
For each plan, control:
- **Users/Seats**: Maximum number of clients allowed
- **Projects**: Maximum uploads/projects allowed  
- **Storage (GB)**: Storage space allocation

### 4. Feature Toggles
Enable/disable features per plan:
- ✅ **Analytics**: Advanced analytics dashboard
- ✅ **Export**: Data export functionality
- ✅ **AI Insights**: AI-powered predictions and insights
- ✅ **Priority Support**: 24/7 priority customer support
- ✅ **Custom Integrations**: Custom API integrations

Toggle switches show:
- **Green** = Feature enabled
- **Gray** = Feature disabled

### 5. Visibility Control
- **Eye Icon** = Plan visible on public website
- **Eye-Off Icon** = Plan hidden from public view
- Useful for hiding plans during maintenance or special campaigns

### 6. Save & Go Live
- **Big Green Button**: "Save & Go Live"
- Pushes all changes to production immediately
- Saves to Supabase database
- Shows success/error toasts
- Offline detection: Shows "Database not reachable. Check your internet" if offline

## 📊 Database Structure

### Table: `pricing_config`
```sql
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY,
  plans JSONB NOT NULL,
  global_discount NUMERIC(5,2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Data Format
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "isVisible": true,
      "limits": {
        "users": 10,
        "projects": 10,
        "storageGB": 5
      },
      "features": {
        "analytics": false,
        "export": true,
        "aiInsights": false,
        "prioritySupport": false,
        "customIntegrations": false
      }
    }
  ],
  "global_discount": 20
}
```

## 🚀 Setup Instructions

### 1. Create Database Table
Run the SQL script in Supabase SQL Editor:
```bash
/create-pricing-table.sql
```

This creates:
- `pricing_config` table
- Row Level Security (RLS) policies
- Default pricing configuration
- Indexes for performance

### 2. Verify Setup
```sql
SELECT * FROM pricing_config ORDER BY updated_at DESC LIMIT 1;
```

### 3. Access Admin Panel
1. Login as Super Admin
2. Navigate to **Administration Tab**
3. Click **Pricing Control** sub-tab
4. Make your changes
5. Click **Save & Go Live**

## 🎨 Public Pricing Page

### Component: `PublicPricingPage.tsx`
- Auto-loads pricing from Supabase
- Shows only visible plans
- Displays monthly/yearly toggle
- Shows global discount badge if active
- Responsive design with gradient background
- "POPULAR" badge on featured plans

### Usage
```tsx
import { PublicPricingPage } from './components/PublicPricingPage';

<PublicPricingPage />
```

## 📝 Use Cases

### Example 1: Launch Promotion
1. Set global discount to **20%**
2. All prices automatically reduced by 20%
3. Orange "Special Offer" badge appears
4. Click **Save & Go Live**
5. ✅ Site-wide 20% off active!

### Example 2: Hide Plan Temporarily
1. Click **Eye Icon** on Growth plan
2. Plan visibility toggles to hidden
3. Click **Save & Go Live**
4. ✅ Growth plan removed from public website

### Example 3: Increase User Limits
1. Go to Professional plan
2. Change "Users" from 2000 to 5000
3. Click **Save & Go Live**
4. ✅ Professional plan now supports 5,000 users

### Example 4: Enable New Feature
1. Select Starter plan
2. Toggle "Analytics" to ON (green)
3. Click **Save & Go Live**
4. ✅ Analytics feature now available to Starter users

## ⚙️ Technical Details

### State Management
- React `useState` for local state
- Supabase for persistence
- Real-time updates on save

### Validation
- Number inputs with min/max constraints
- Discount limited to 0-100%
- Required fields enforced
- Database connection check before save

### Error Handling
- Toast notifications for success/errors
- Offline detection
- Supabase error logging
- Fallback to default values

### Performance
- Single database query on load
- Batch update on save
- Indexed queries for speed
- No localStorage fallback (database-only)

## 🔒 Security

### Row Level Security (RLS)
- ✅ Public can VIEW pricing (read-only)
- ✅ Only authenticated users can UPDATE
- ✅ Super Admin role recommended for access

### Best Practices
- Always test changes in staging first
- Verify pricing before "Go Live"
- Monitor subscription renewals after changes
- Keep backup of previous pricing

## 📱 Responsive Design
- Mobile-friendly layout
- Grid adapts to screen size
- Touch-friendly toggles
- Scrollable on small screens

## 🎯 Future Enhancements
- [ ] Version history/rollback
- [ ] A/B testing support
- [ ] Scheduled pricing changes
- [ ] Multi-currency support
- [ ] Plan comparison table editor
- [ ] Custom plan creation
- [ ] Analytics dashboard for pricing performance

## 💡 Pro Tips

1. **Test Before Launch**: Use a test organization to preview changes
2. **Communication**: Notify users before major pricing changes
3. **Grandfathering**: Existing subscriptions continue at original price until renewal
4. **Discount Strategy**: Use global discounts for limited-time promotions
5. **Feature Rollout**: Enable features gradually across plans

## 📞 Support
For issues or questions about Pricing Control:
- Check Supabase logs for errors
- Verify database connectivity
- Ensure Super Admin access
- Review browser console for client-side errors

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Component**: `/components/PricingControlPanel.tsx`
