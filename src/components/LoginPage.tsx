import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ChevronDown, Search, Globe, Menu, X, Users, TrendingUp, Shield, Zap, DollarSign, BarChart3, Smartphone, ArrowLeft, Monitor, Star, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
const abcLogo = '/logo.svg'; // Replaced figma:asset for deployment
import smartLenderLogo from 'figma:asset/fd18aa8c77f7b0374c9ef5d44e370cbe0bc4832b.png';
import laptopImage from 'figma:asset/2dba3dabe7010b763ebec2a8f70edae4bf1041a6.png';
const aiInsightsImage = '/logo.svg'; // Replaced figma:asset for deployment
import { OrganizationSignUpModal } from './modals/OrganizationSignUpModal';
import { OrganizationSuccessModal } from './modals/OrganizationSuccessModal';
import { RegistrationTypeModal } from './modals/RegistrationTypeModal';
import { IndividualSignUpModal } from './modals/IndividualSignUpModal';
import { GroupSignUpModal } from './modals/GroupSignUpModal';
import { SuperAdminLoginModal } from './modals/SuperAdminLoginModal';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { FeaturesCarousel } from './FeaturesCarousel';
import { db } from '../utils/database';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLogin: (userType: 'admin' | 'employee', userData: any) => void;
  onBack?: () => void;
  platformName?: string;
}

export function LoginPage({ onLogin, onBack, platformName = 'SmartLenderUp' }: LoginPageProps) {
  const { login } = useAuth();
  const { currentTheme, isDark, mode, toggleMode } = useTheme();
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showOrganizationSignUp, setShowOrganizationSignUp] = useState(false);
  const [infoPopup, setInfoPopup] = useState<{ title: string; description: string } | null>(null);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showRegistrationType, setShowRegistrationType] = useState(false);
  const [showIndividualSignUp, setShowIndividualSignUp] = useState(false);
  const [showGroupSignUp, setShowGroupSignUp] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showOrgSuccess, setShowOrgSuccess] = useState(false);
  const [newOrgUsername, setNewOrgUsername] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<'organization' | 'individual' | 'group'>('organization');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [showSuperAdminDashboard, setShowSuperAdminDashboard] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const signInRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const textArray = [
    'Transform your MFI operations\npowered by innovation',
    'Empower your lending business\npowered by innovation',
    'Scale with confidence\npowered by innovation'
  ];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  // Typing effect
  useEffect(() => {
    const handleTyping = () => {
      const currentText = textArray[loopNum % textArray.length];
      
      if (!isDeleting) {
        if (typedText.length < currentText.length) {
          setTypedText(currentText.substring(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentText.substring(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum]);

  // Force dark mode for landing page
  useEffect(() => {
    if (mode !== 'dark') {
      toggleMode();
    }
  }, []);

  // Check for saved credentials on mount and auto-login
  useEffect(() => {
    const savedCredentials = localStorage.getItem('bv_funguo_credentials');
    if (savedCredentials) {
      try {
        const { identifier: savedId, password: savedPass } = JSON.parse(savedCredentials);
        setIdentifier(savedId);
        setPassword(savedPass);
        setRememberMe(true);
        
        // Auto-login with saved credentials
        setTimeout(() => {
          const loginId = savedId.trim();
          const loginPass = savedPass.trim();
          
          // Check admin credentials
          if (loginId === '12345' && loginPass === 'Test@1234') {
            const adminData = {
              id: 'USR-001',
              name: 'System Administrator',
              email: 'admin@bvfunguo.co.ke',
              phone: '0700000000',
              role: 'Admin',
              userType: 'admin' as const
            };
            onLogin('admin', adminData);
            return;
          }
          
          // Check employee credentials
          if ((loginId === 'employee@bvfunguo.co.ke' || loginId === '0712345678') && loginPass === 'Employee@123') {
            const employeeData = {
              id: 'USR-001',
              name: 'Victor Muthama',
              email: 'victor.muthama@bvfunguo.co.ke',
              phone: '0756789012',
              role: 'Loan Officer',
              userType: 'employee' as const
            };
            onLogin('employee', employeeData);
            return;
          }
          
          // Check organization accounts
          const authResult = db.authenticate(loginId, loginPass);
          if (authResult && authResult.type === 'organization') {
            const org = authResult.data as any;
            const userData = {
              id: org.id,
              name: org.organization_name,
              email: org.email,
              phone: org.phone,
              role: 'Organization Admin',
              userType: 'admin' as const,
              organizationId: org.id,
              username: org.username
            };
            localStorage.setItem('current_organization', JSON.stringify(org));
            onLogin('admin', userData);
          }
        }, 500);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        localStorage.removeItem('bv_funguo_credentials');
      }
    }
  }, [onLogin]);

  // Close sign in dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
        setShowSignInDropdown(false);
      }
    };

    if (showSignInDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSignInDropdown]);

  // Close pricing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pricingRef.current && !pricingRef.current.contains(event.target as Node)) {
        setShowPricing(false);
      }
    };

    if (showPricing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPricing]);

  // Close pricing with ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPricing) {
        setShowPricing(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPricing]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    const loginId = identifier.trim();
    const loginPass = password.trim();

    try {
      // Admin credentials (demo)
      if (loginId === '12345' && loginPass === 'Test@1234') {
        const adminData = {
          id: 'USR-001',
          name: 'System Administrator',
          email: 'admin@bvfunguo.co.ke',
          phone: '0700000000',
          role: 'Admin',
          userType: 'admin' as const
        };

        if (rememberMe) {
          localStorage.setItem('bv_funguo_credentials', JSON.stringify({
            identifier: loginId,
            password: loginPass,
            userType: 'admin'
          }));
        } else {
          // Clear saved credentials if Remember Me is not checked
          localStorage.removeItem('bv_funguo_credentials');
        }

        onLogin('admin', adminData);
        setLoading(false);
        return;
      }

      // Employee credentials (demo)
      if ((loginId === 'employee@bvfunguo.co.ke' || loginId === '0712345678') && loginPass === 'Employee@123') {
        const employeeData = {
          id: 'USR-001',
          name: 'Victor Muthama',
          email: 'victor.muthama@bvfunguo.co.ke',
          phone: '0756789012',
          role: 'Loan Officer',
          userType: 'employee' as const
        };

        if (rememberMe) {
          localStorage.setItem('bv_funguo_credentials', JSON.stringify({
            identifier: loginId,
            password: loginPass,
            userType: 'employee'
          }));
        } else {
          // Clear saved credentials if Remember Me is not checked
          localStorage.removeItem('bv_funguo_credentials');
        }

        onLogin('employee', employeeData);
        setLoading(false);
        return;
      }

      // ===== SUPABASE-FIRST AUTHENTICATION (BEST PRACTICE) =====
      console.log('🔐 Authenticating with Supabase...');
      
      // Check Supabase for organization accounts - fetch first, then verify password
      const { data: organizations, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .or(`email.eq.${loginId},contact_person_email.eq.${loginId}`)
        .limit(1);

      if (supabaseError) {
        console.error('❌ Supabase query error:', supabaseError);
        throw new Error('Database connection error');
      }

      // Verify password in JavaScript (since we can't filter by password in query if column doesn't exist yet)
      if (organizations && organizations.length > 0) {
        const org = organizations[0];
        
        // Check if password matches
        if (org.password_hash !== loginPass) {
          console.log('❌ Password mismatch');
          setError('Invalid credentials. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log('✅ Organization found in Supabase:', org.organization_name);

        // Cache organization to localStorage for offline access
        const dbData = localStorage.getItem('bv_funguo_db');
        let db = dbData ? JSON.parse(dbData) : {
          organizations: [],
          users: [],
          clients: [],
          loans: [],
          loan_products: [],
          repayments: [],
          savings_accounts: [],
          shareholders: [],
          banks: [],
          expenses: [],
          tasks: [],
          notifications: [],
          payroll: [],
          journal_entries: [],
          chart_of_accounts: [],
          credit_score_history: [],
          settings: [],
          documents: [],
          loan_approval_workflows: []
        };

        // Update or add organization to localStorage cache
        if (!db.organizations) db.organizations = [];
        const existingIndex = db.organizations.findIndex((o: any) => o.id === org.id);
        if (existingIndex >= 0) {
          db.organizations[existingIndex] = org;
        } else {
          db.organizations.push(org);
        }
        localStorage.setItem('bv_funguo_db', JSON.stringify(db));
        console.log('💾 Organization cached to localStorage');

        // Create user data for session
        const userData = {
          id: org.id,
          name: org.organization_name,
          email: org.email,
          phone: org.phone,
          role: 'Organization Admin',
          userType: 'admin' as const,
          organizationId: org.id,
          username: org.username || org.contact_person_email
        };

        if (rememberMe) {
          localStorage.setItem('bv_funguo_credentials', JSON.stringify({
            identifier: loginId,
            password: loginPass,
            userType: 'admin'
          }));
        } else {
          localStorage.removeItem('bv_funguo_credentials');
        }

        // Store organization context
        localStorage.setItem('current_organization', JSON.stringify(org));

        toast.success('Login Successful', {
          description: `Welcome back, ${org.organization_name}!`
        });

        onLogin('admin', userData);
        setLoading(false);
        return;
      }

      // ===== FALLBACK: CHECK LOCALSTORAGE FOR OFFLINE MODE =====
      console.log('⚠️ Not found in Supabase, checking localStorage for offline mode...');
      const authResult = db.authenticate(loginId, loginPass);
      
      if (authResult) {
        if (authResult.type === 'organization') {
          const org = authResult.data as any;
          console.log('✅ Organization found in localStorage (offline mode)');

          const userData = {
            id: org.id,
            name: org.organization_name,
            email: org.email,
            phone: org.phone,
            role: 'Organization Admin',
            userType: 'admin' as const,
            organizationId: org.id,
            username: org.username
          };

          if (rememberMe) {
            localStorage.setItem('bv_funguo_credentials', JSON.stringify({
              identifier: loginId,
              password: loginPass,
              userType: 'admin'
            }));
          } else {
            localStorage.removeItem('bv_funguo_credentials');
          }

          localStorage.setItem('current_organization', JSON.stringify(org));

          toast.warning('Offline Mode', {
            description: 'Using cached data. Connect to internet for full functionality.'
          });

          onLogin('admin', userData);
          setLoading(false);
          return;
        }
      }

      // Invalid credentials
      console.log('❌ Invalid credentials');
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    // Clear previous timer
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (newCount === 5) {
      setShowSuperAdminLogin(true);
      setLogoClickCount(0);
    } else {
      // Reset counter after 2 seconds of no clicks
      logoClickTimerRef.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
    }
  };

  const handleOrganizationSignUp = async (organizationData: any) => {
    console.log('Organization sign up:', organizationData);
    
    try {
      // Generate a proper UUID for Supabase compatibility
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const organizationId = generateUUID();
      const now = new Date().toISOString();

      // Create organization object with UUID
      const organization = {
        id: organizationId,
        organization_name: organizationData.organizationName,
        registration_number: organizationData.registrationNumber || null,
        industry: organizationData.industry,
        organization_type: organizationData.organizationType,
        country: organizationData.country,
        currency: organizationData.currency,
        email: organizationData.email,
        phone: organizationData.phone,
        alternative_phone: organizationData.alternativePhone || null,
        website: organizationData.website || null,
        county: organizationData.county,
        town: organizationData.town,
        address: organizationData.address,
        postal_code: organizationData.postalCode || null,
        date_of_incorporation: organizationData.dateOfIncorporation,
        organization_logo: organizationData.organizationLogo || null,
        contact_person_first_name: organizationData.contactPersonFirstName,
        contact_person_last_name: organizationData.contactPersonLastName,
        contact_person_title: organizationData.contactPersonTitle,
        contact_person_email: organizationData.contactPersonEmail,
        contact_person_phone: organizationData.contactPersonPhone,
        number_of_employees: organizationData.numberOfEmployees ? parseInt(organizationData.numberOfEmployees) : null,
        expected_clients: organizationData.expectedClients ? parseInt(organizationData.expectedClients) : null,
        description: organizationData.description || null,
        password_hash: organizationData.password, // In production, this would be hashed
        username: Math.random().toString(36).substr(2, 4).toUpperCase(),
        status: 'active',
        created_at: now,
        updated_at: now
      };

      console.log('📝 Organization created with UUID:', organization);

      // Save to localStorage with proper database structure
      const dbData = localStorage.getItem('bv_funguo_db');
      let db;
      
      if (dbData) {
        db = JSON.parse(dbData);
      } else {
        // Initialize full database structure
        db = {
          organizations: [],
          users: [],
          clients: [],
          loans: [],
          loan_products: [],
          repayments: [],
          savings_accounts: [],
          shareholders: [],
          banks: [],
          expenses: [],
          tasks: [],
          notifications: [],
          payroll: [],
          journal_entries: [],
          chart_of_accounts: [],
          credit_score_history: [],
          settings: [],
          documents: [],
          loan_approval_workflows: []
        };
      }
      
      if (!db.organizations) db.organizations = [];
      db.organizations.push(organization);
      localStorage.setItem('bv_funguo_db', JSON.stringify(db));
      console.log('💾 Saved to localStorage. Total organizations:', db.organizations.length);
      console.log('📋 Organization details for login:', {
        id: organization.id,
        email: organization.email,
        contact_person_email: organization.contact_person_email,
        password_hash: organization.password_hash,
        username: organization.username
      });

      // SYNC TO SUPABASE automatically
      try {
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days free trial

        // Base organization data (columns that always exist)
        const baseOrgData = {
          id: organization.id,
          organization_name: organization.organization_name,
          registration_number: organization.registration_number,
          industry: organization.industry,
          organization_type: organization.organization_type,
          country: organization.country,
          currency: organization.currency,
          email: organization.email,
          phone: organization.phone,
          alternative_phone: organization.alternative_phone,
          website: organization.website,
          county: organization.county,
          town: organization.town,
          address: organization.address,
          postal_code: organization.postal_code,
          date_of_incorporation: organization.date_of_incorporation,
          organization_logo: organization.organization_logo,
          contact_person_first_name: organization.contact_person_first_name,
          contact_person_last_name: organization.contact_person_last_name,
          contact_person_title: organization.contact_person_title,
          contact_person_email: organization.contact_person_email,
          contact_person_phone: organization.contact_person_phone,
          number_of_employees: organization.number_of_employees,
          expected_clients: organization.expected_clients,
          description: organization.description,
          password_hash: organization.password_hash,
          username: organization.username,
          status: organization.status,
        };

        // Try to insert with trial columns first
        let { data, error } = await supabase
          .from('organizations')
          .insert({
            ...baseOrgData,
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            subscription_status: 'trial',
            payment_status: 'pending',
          })
          .select();

        // If trial columns don't exist (error code 42703), insert without them
        if (error && error.code === '42703') {
          console.log('⚠️ Trial columns not found. Inserting without them (will use created_at for trial calculation)...');
          const fallbackResult = await supabase
            .from('organizations')
            .insert(baseOrgData)
            .select();
          
          data = fallbackResult.data;
          error = fallbackResult.error;
        }

        if (error) {
          console.error('⚠️ Failed to sync to Supabase:', error);
          toast.warning('Organization Created (Local Only)', {
            description: 'Saved locally, but Supabase sync failed. Check console.',
            duration: 5000
          });
        } else {
          console.log('✅ Organization synced to Supabase!', data);
          toast.success('Organization Created & Synced!', {
            description: `${organization.organization_name} is now in Supabase`,
            duration: 5000
          });
        }
      } catch (syncError) {
        console.error('⚠️ Supabase sync error:', syncError);
        toast.error('Sync Error', {
          description: 'Could not sync to Supabase',
          duration: 5000
        });
      }

      // Show success modal with contact email as login credential
      setNewOrgUsername(organizationData.contactPersonEmail);
      setNewOrgName(organization.organization_name);
      setShowOrganizationSignUp(false); // Close the sign-up modal
      setShowOrgSuccess(true);
      
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    }
  };

  const handleIndividualSignUp = (individualData: any) => {
    console.log('Individual sign up:', individualData);
    alert('Individual account created successfully! Please check your email to verify your account.');
  };

  const handleGroupSignUp = (groupData: any) => {
    console.log('Group sign up:', groupData);
    alert('Group registration submitted successfully! We will review your application and contact you shortly.');
  };

  const handleSuperAdminLogin = () => {
    setShowSuperAdminDashboard(true);
  };

  const handleRegistrationTypeSelect = (type: 'organization' | 'individual' | 'group') => {
    setShowRegistrationType(false);
    setSelectedAccountType(type);
    if (type === 'organization') {
      setShowOrganizationSignUp(true);
    } else if (type === 'individual') {
      setShowOrganizationSignUp(true); // Changed to use Organization modal
    } else if (type === 'group') {
      setShowOrganizationSignUp(true); // Changed to use Organization modal
    }
  };

  // Product and Customer info data
  const productInfo: { [key: string]: { title: string; description: string } } = {
    'Microfinance Suite': {
      title: 'Microfinance Suite',
      description: 'A comprehensive all-in-one platform that includes loan management, savings accounts, client management, M-Pesa integration, and advanced analytics. Perfect for institutions that want a complete solution to manage all their microfinance operations efficiently.'
    },
    'Loan Management': {
      title: 'Loan Management',
      description: 'Streamline your lending operations with automated loan origination, disbursement tracking, repayment schedules, and default management. Includes AI-powered credit scoring and risk assessment to help you make better lending decisions.'
    },
    'Savings & Deposits': {
      title: 'Savings & Deposits',
      description: 'Manage multiple savings products with automated interest calculations, flexible withdrawal rules, and goal-based savings features. Support for fixed deposits, recurring deposits, and emergency funds with real-time balance tracking.'
    },
    'Analytics & Reporting': {
      title: 'Analytics & Reporting',
      description: 'Gain actionable insights with real-time dashboards, customizable reports, and regulatory compliance reporting. Track portfolio performance, delinquency rates, and profitability metrics. Export reports in multiple formats for stakeholders.'
    }
  };

  const customerInfo: { [key: string]: { title: string; description: string } } = {
    'SACCOs': {
      title: 'SACCOs (Savings and Credit Cooperative Organizations)',
      description: 'Designed specifically for member-owned financial cooperatives. Manage member shares, loans, dividends, and general meetings efficiently. Features include member portal, voting systems, and share capital management with full transparency and compliance.'
    },
    'Microfinance Institutions': {
      title: 'Microfinance Institutions',
      description: 'Perfect for formal MFIs that provide financial services to low-income individuals and small businesses. Includes group lending, individual loans, regulatory reporting, and donor fund tracking. Supports multiple branches and currencies.'
    },
    'Community Banks': {
      title: 'Community Banks',
      description: 'Tailored for community-focused banking institutions serving local populations. Features branch management, teller operations, ATM integration, and community development loan programs. Built-in compliance with local banking regulations.'
    },
    'Credit Unions': {
      title: 'Credit Unions',
      description: 'Built for member-owned credit unions offering savings and loan services. Member dividend calculations, loan interest rebates, board management tools, and annual general meeting support. Democratic governance features with voting and elections.'
    }
  };

  const featuresInfo: { [key: string]: { title: string; description: string } } = {
    'Client Management': {
      title: 'Client Management',
      description: 'Comprehensive client tracking system with detailed profiles, KYC documentation, relationship history, and communication logs. Manage individual and group clients with custom fields, tags, and segmentation. Track client interactions, preferences, and lifecycle stages for better relationship management.'
    },
    'Loan Portfolio': {
      title: 'Loan Portfolio',
      description: 'End-to-end loan management from application to closure. Automated loan origination, credit scoring, disbursement tracking, and repayment schedules. M-Pesa integration for seamless payments. Monitor loan performance, manage arrears, and automate collections with smart reminders and notifications.'
    },
    'Savings Accounts': {
      title: 'Savings Accounts',
      description: 'Flexible savings products with automated interest calculations, tiered rates, and goal-based savings. Support for fixed deposits, recurring deposits, and emergency funds. Real-time balance tracking, withdrawal management, and automated statements. Create custom savings products tailored to your members needs.'
    },
    'Analytics & Reports': {
      title: 'Analytics & Reports',
      description: 'Powerful analytics dashboard with real-time insights into portfolio performance, delinquency rates, profitability metrics, and growth trends. Customizable reports for management, board meetings, and regulatory compliance. Export data in multiple formats (PDF, Excel, CSV). Predictive analytics and AI-powered insights for informed decision-making.'
    }
  };

  const featuredModules = [
    {
      icon: <Users className="size-6" style={{ color: currentTheme.colors.success }} />,
      title: 'Client Management',
      description: 'Comprehensive client tracking and relationship management.'
    },
    {
      icon: <DollarSign className="size-6" style={{ color: currentTheme.colors.info }} />,
      title: 'Loan Portfolio',
      description: 'End-to-end loan management with M-Pesa integration.'
    },
    {
      icon: <TrendingUp className="size-6" style={{ color: currentTheme.colors.secondary }} />,
      title: 'Savings Accounts',
      description: 'Multiple savings products with automated interest calculation.'
    },
    {
      icon: <BarChart3 className="size-6" style={{ color: currentTheme.colors.warning }} />,
      title: 'Analytics & Reports',
      description: 'Real-time insights and regulatory compliance reporting.'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 17.6% 50.7%, rgba(25,0,184,1) 0%, rgba(0,0,0,1) 90%)' }}>
      {/* Navigation Header */}
      <nav className="border-b sticky top-0 z-50" style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(255, 255, 255, 0.1)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:opacity-80 mr-2"
                  style={{ color: '#ffffff' }}
                  title="Back to platforms"
                >
                  <ArrowLeft className="size-5" />
                </button>
              )}
              <img 
                src={smartLenderLogo} 
                alt="SmartLenderUp" 
                className="h-12 cursor-pointer" 
                onClick={handleLogoClick}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                  className="flex items-center gap-1 py-2 hover:opacity-80"
                  style={{ color: '#ffffff' }}
                >
                  Products
                  <ChevronDown className={`size-4 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'products' && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-xl border py-2 z-50" style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    opacity: 1
                  }}>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(productInfo['Microfinance Suite']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Microfinance Suite
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(productInfo['Loan Management']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Loan Management
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(productInfo['Savings & Deposits']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Savings & Deposits
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(productInfo['Analytics & Reporting']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Analytics & Reporting
                    </a>
                  </div>
                )}
              </div>

              {/* Customers Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'customers' ? null : 'customers')}
                  className="flex items-center gap-1 py-2 hover:opacity-80"
                  style={{ color: '#ffffff' }}
                >
                  Customers
                  <ChevronDown className={`size-4 transition-transform ${activeDropdown === 'customers' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'customers' && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl border py-2 z-50" style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    opacity: 1
                  }}>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(customerInfo['SACCOs']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      SACCOs
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(customerInfo['Microfinance Institutions']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Microfinance Institutions
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(customerInfo['Community Banks']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Community Banks
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(customerInfo['Credit Unions']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Credit Unions
                    </a>
                  </div>
                )}
              </div>

              {/* Features Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'features' ? null : 'features')}
                  className="flex items-center gap-1 py-2 hover:opacity-80"
                  style={{ color: '#ffffff' }}
                >
                  Features
                  <ChevronDown className={`size-4 transition-transform ${activeDropdown === 'features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'features' && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl border py-2 z-50" style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    opacity: 1
                  }}>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(featuresInfo['Client Management']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Client Management
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(featuresInfo['Loan Portfolio']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Loan Portfolio
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(featuresInfo['Savings Accounts']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Savings Accounts
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setInfoPopup(featuresInfo['Analytics & Reports']); }}
                      className="block px-4 py-2 text-sm hover:opacity-80" 
                      style={{ color: currentTheme.colors.text }}
                    >
                      Analytics & Reports
                    </a>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="relative" ref={pricingRef}>
                <button
                  onClick={() => setShowPricing(!showPricing)}
                  className="flex items-center gap-1 py-2 hover:opacity-80"
                  style={{ color: '#ffffff' }}
                >
                  Pricing
                  <ChevronDown className={`size-4 transition-transform ${showPricing ? 'rotate-180' : ''}`} />
                </button>

                {showPricing && (
                  <>
                    {/* Backdrop to close */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPricing(false)}
                    />
                    
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 z-50" style={{
                      backgroundColor: '#0a1128',
                      borderColor: '#ade8f4'
                    }}>
                    <div className="text-center mb-5">
                      <h3 className="text-2xl font-semibold mb-1" style={{ color: '#ffffff' }}>Choose Your Plan</h3>
                      <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>All plans include 14-day free trial • Scale as you grow</p>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {/* Starter Plan */}
                      <div className="rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer flex flex-col" style={{
                        backgroundColor: 'rgba(173, 232, 244, 0.05)',
                        border: '1px solid rgba(173, 232, 244, 0.2)'
                      }}
                      onClick={() => {
                        setShowPricing(false);
                        setShowOrganizationSignUp(true);
                      }}
                      >
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center size-12 rounded-full mb-2" style={{ backgroundColor: '#ade8f4' }}>
                            <Users className="size-6" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>Starter</h4>
                          <div className="mb-2">
                            <span className="text-2xl font-bold" style={{ color: '#ade8f4' }}>FREE</span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: '#ffffff', opacity: 0.7 }}>Perfect for getting started</p>
                          <p className="text-xs font-medium" style={{ color: '#ade8f4' }}>+ 14-day trial</p>
                        </div>
                        <ul className="space-y-1.5 mb-4 flex-1">
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Up to 10 clients</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Basic loan management</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>5 staff accounts</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Email support</span>
                          </li>
                        </ul>
                        <button className="w-full py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity mt-auto" style={{
                          backgroundColor: '#ade8f4',
                          color: '#023e8a'
                        }}>
                          Get Started
                        </button>
                      </div>

                      {/* Growth Plan */}
                      <div className="rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer flex flex-col" style={{
                        backgroundColor: 'rgba(173, 232, 244, 0.05)',
                        border: '1px solid rgba(173, 232, 244, 0.2)'
                      }}
                      onClick={() => {
                        setShowPricing(false);
                        setShowOrganizationSignUp(true);
                      }}
                      >
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center size-12 rounded-full mb-2" style={{ backgroundColor: '#ade8f4' }}>
                            <TrendingUp className="size-6" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>Growth</h4>
                          <div className="mb-2">
                            <span className="text-2xl font-bold" style={{ color: '#ade8f4' }}>$99</span>
                            <span className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>/mo</span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: '#ffffff', opacity: 0.7 }}>For growing institutions</p>
                          <p className="text-xs font-medium" style={{ color: '#ade8f4' }}>+ 14-day trial</p>
                        </div>
                        <ul className="space-y-1.5 mb-4 flex-1">
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Up to 500 clients</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Advanced analytics</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>15 staff accounts</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Priority support</span>
                          </li>
                        </ul>
                        <button className="w-full py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity mt-auto" style={{
                          backgroundColor: '#ade8f4',
                          color: '#023e8a'
                        }}>
                          Choose Plan
                        </button>
                      </div>

                      {/* Professional Plan */}
                      <div className="rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer relative flex flex-col" style={{
                        backgroundColor: 'rgba(173, 232, 244, 0.1)',
                        border: '2px solid #ade8f4'
                      }}
                      onClick={() => {
                        setShowPricing(false);
                        setShowOrganizationSignUp(true);
                      }}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold" style={{
                          backgroundColor: '#ec7347',
                          color: '#ffffff'
                        }}>
                          POPULAR
                        </div>
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center size-12 rounded-full mb-2" style={{ backgroundColor: '#ade8f4' }}>
                            <BarChart3 className="size-6" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>Professional</h4>
                          <div className="mb-2">
                            <span className="text-2xl font-bold" style={{ color: '#ade8f4' }}>$249</span>
                            <span className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>/mo</span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: '#ffffff', opacity: 0.7 }}>For established organizations</p>
                          <p className="text-xs font-medium" style={{ color: '#ade8f4' }}>+ 14-day trial</p>
                        </div>
                        <ul className="space-y-1.5 mb-4 flex-1">
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Up to 2,000 clients</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>AI insights & predictions</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Unlimited staff</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>24/7 support & training</span>
                          </li>
                        </ul>
                        <button className="w-full py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity mt-auto" style={{
                          backgroundColor: '#ade8f4',
                          color: '#023e8a'
                        }}>
                          Choose Plan
                        </button>
                      </div>

                      {/* Enterprise Plan */}
                      <div className="rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer flex flex-col" style={{
                        backgroundColor: 'rgba(173, 232, 244, 0.05)',
                        border: '1px solid rgba(173, 232, 244, 0.2)'
                      }}
                      onClick={() => {
                        setShowPricing(false);
                        setShowOrganizationSignUp(true);
                      }}
                      >
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center justify-center size-12 rounded-full mb-2" style={{ backgroundColor: '#ade8f4' }}>
                            <Shield className="size-6" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>Enterprise</h4>
                          <div className="mb-2">
                            <span className="text-2xl font-bold" style={{ color: '#ade8f4' }}>Custom</span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: '#ffffff', opacity: 0.7 }}>For large scale operations</p>
                          <p className="text-xs font-medium" style={{ color: '#ade8f4' }}>+ 14-day trial</p>
                        </div>
                        <ul className="space-y-1.5 mb-4 flex-1">
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Unlimited clients</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Custom integrations</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>Dedicated account manager</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                            <span style={{ color: '#ade8f4' }}>✓</span>
                            <span>SLA guarantee & compliance</span>
                          </li>
                        </ul>
                        <button className="w-full py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity mt-auto" style={{
                          backgroundColor: '#ade8f4',
                          color: '#023e8a'
                        }}>
                          Contact Sales
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'rgba(173, 232, 244, 0.2)' }}>
                      <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>
                        All plans include 14-day free trial • No credit card required • <a href="#" className="hover:opacity-80" style={{ color: '#ade8f4' }}>View detailed comparison →</a>
                      </p>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Sign In Dropdown */}
              <div className="relative" ref={signInRef}>
                <button
                  onClick={() => setShowSignInDropdown(!showSignInDropdown)}
                  className="px-4 py-2 font-medium hover:opacity-80"
                  style={{ color: '#E30B5C' }}
                >
                  Sign In
                </button>

                {showSignInDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-6 z-50" style={{
                    backgroundColor: '#0a1128',
                    borderColor: '#ade8f4'
                  }}>
                    <div className="text-center mb-5">
                      <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#ffffff' }}>Welcome Back</h3>
                      <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>Sign in to continue to SmartLenderUp</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#ffffff' }}>Email Address / Username</label>
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm"
                          style={{
                            borderColor: 'rgba(173, 232, 244, 0.3)',
                            backgroundColor: 'rgba(173, 232, 244, 0.05)',
                            color: '#ffffff'
                          }}
                          placeholder="Enter your email or username"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#ffffff' }}>Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-10 transition-all text-sm"
                            style={{
                              borderColor: 'rgba(173, 232, 244, 0.3)',
                              backgroundColor: 'rgba(173, 232, 244, 0.05)',
                              color: '#ffffff'
                            }}
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80"
                            style={{ color: '#ade8f4' }}
                          >
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="size-4 border rounded"
                            style={{
                              accentColor: '#ade8f4'
                            }}
                          />
                          <label htmlFor="remember" className="ml-2 text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>
                            Remember me
                          </label>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowForgotPassword(true)} 
                          className="text-sm hover:opacity-80" 
                          style={{ color: '#ade8f4' }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      {error && (
                        <div className="border px-4 py-3 rounded-xl text-sm" style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: '#ef4444',
                          color: '#ef4444'
                        }}>
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-all text-sm"
                        style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>

                      <div className="text-center pt-3 border-t" style={{ borderColor: 'rgba(173, 232, 244, 0.2)' }}>
                        <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>
                          Don't have an account? <button onClick={() => { setShowSignInDropdown(false); setShowRegistrationType(true); }} className="font-semibold hover:opacity-80" style={{ color: '#ade8f4' }}>Sign Up</button>
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowRegistrationType(true)}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 text-sm" 
                style={{ backgroundColor: '#E30B5C', color: '#ffffff' }}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2"
              style={{ color: '#ffffff' }}
            >
              {showMobileMenu ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t" style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}>
            <div className="px-4 py-3 space-y-3">
              <a href="#" className="block py-2 hover:opacity-80" style={{ color: currentTheme.colors.text }}>Products</a>
              <a href="#" className="block py-2 hover:opacity-80" style={{ color: currentTheme.colors.text }}>Customers</a>
              <a href="#" className="block py-2 hover:opacity-80" style={{ color: currentTheme.colors.text }}>Pricing</a>
              <div className="pt-3 border-t" style={{ borderColor: currentTheme.colors.border }}>
                <button className="w-full mb-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{
                  color: currentTheme.colors.primary,
                  borderColor: currentTheme.colors.primary
                }}>
                  Sign In
                </button>
                <button className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: currentTheme.colors.primary }}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="animate-fadeIn">
            <h1 className="leading-tight mb-4 text-[46px]" style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span className="font-bold" style={{ color: '#00b4d8' }}>Empower</span> <span className="font-light">your lending business</span>
              <br />
              <span className="font-light">powered by</span> <span className="font-bold" style={{ color: '#00b4d8' }}>innovation</span>
            </h1>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: '#ffffff', opacity: 0.9 }}>
              A modern, end-to-end lending platform for small, growing, or niche credit providers. 
              Designed with strong security, compliance, and efficiency to support your business at every stage
            </p>
            <button className="px-6 py-2.5 rounded-lg font-medium text-base flex items-center gap-2 hover:opacity-90 mx-auto" style={{ backgroundColor: 'rgba(173, 232, 244, 0.15)', color: '#ade8f4', border: '1px solid rgba(173, 232, 244, 0.3)' }} onClick={() => setShowRegistrationType(true)}>
              GET STARTED FOR FREE
              <ChevronDown className="size-5 -rotate-90" />
            </button>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="size-4" style={{ color: currentTheme.colors.success }} />
                  <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Secure</span>
                </div>
                <p className="text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>Bank-level security & encryption</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 bg-[rgba(74,71,71,0)]">
                  <Zap className="size-4" style={{ color: currentTheme.colors.info }} />
                  <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Fast</span>
                </div>
                <p className="text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>Real-time processing & reports</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="size-4" style={{ color: currentTheme.colors.secondary }} />
                  <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Scalable</span>
                </div>
                <p className="text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>Grows with your business</p>
              </div>
            </div>

            {/* Laptop Screenshot */}
            <div className="mt-8 max-w-4xl mx-auto">
              <img 
                src={laptopImage} 
                alt="SmartLenderUp Dashboard" 
                className="w-full"
                style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))' }}
              />
            </div>

            {/* Platform Features Section */}
            <div className="mt-20 max-w-6xl mx-auto px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Discover our powerful platform
                </h2>
                <p className="text-lg max-w-3xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
                  Streamline your microfinance operations with cutting-edge features designed to enhance efficiency, 
                  security, and growth for your lending business.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-4 gap-6">
                {/* Loan Management */}
                <div className="rounded-2xl p-6 text-center transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="inline-flex items-center justify-center size-16 rounded-full mb-4" style={{ backgroundColor: '#ade8f4' }}>
                    <DollarSign className="size-8" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                    Loan Management
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#ffffff', opacity: 0.7 }}>
                    Manage loans from application to repayment with automated workflows and smart tracking.
                  </p>
                  <button className="text-sm font-medium flex items-center gap-1 mx-auto hover:gap-2 transition-all" style={{ color: '#ade8f4' }}>
                    Learn more
                    <ChevronDown className="size-4 -rotate-90" />
                  </button>
                </div>

                {/* M-Pesa Integration */}
                <div className="rounded-2xl p-6 text-center transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="inline-flex items-center justify-center size-16 rounded-full mb-4" style={{ backgroundColor: '#ade8f4' }}>
                    <Smartphone className="size-8" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                    M-Pesa Integration
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#ffffff', opacity: 0.7 }}>
                    Accept payments and disburse loans via mobile money seamlessly with real-time processing.
                  </p>
                  <button className="text-sm font-medium flex items-center gap-1 mx-auto hover:gap-2 transition-all" style={{ color: '#ade8f4' }}>
                    Learn more
                    <ChevronDown className="size-4 -rotate-90" />
                  </button>
                </div>

                {/* AI-Powered Insights */}
                <div className="rounded-2xl p-6 text-center transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="inline-flex items-center justify-center size-16 rounded-full mb-4" style={{ backgroundColor: '#ade8f4' }}>
                    <TrendingUp className="size-8" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                    AI-Powered Insights
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#ffffff', opacity: 0.7 }}>
                    Get intelligent recommendations and risk analysis for better lending decisions.
                  </p>
                  <button className="text-sm font-medium flex items-center gap-1 mx-auto hover:gap-2 transition-all" style={{ color: '#ade8f4' }}>
                    Learn more
                    <ChevronDown className="size-4 -rotate-90" />
                  </button>
                </div>

                {/* Client Management */}
                <div className="rounded-2xl p-6 text-center transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="inline-flex items-center justify-center size-16 rounded-full mb-4" style={{ backgroundColor: '#ade8f4' }}>
                    <Users className="size-8" style={{ color: '#023e8a', strokeWidth: 2.5 }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                    Client Management
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#ffffff', opacity: 0.7 }}>
                    Track and manage all your clients' information securely in one centralized place.
                  </p>
                  <button className="text-sm font-medium flex items-center gap-1 mx-auto hover:gap-2 transition-all" style={{ color: '#ade8f4' }}>
                    Learn more
                    <ChevronDown className="size-4 -rotate-90" />
                  </button>
                </div>
              </div>

              {/* AI Insights Dashboard Image */}
              <div className="mt-16">
                <img 
                  src={aiInsightsImage} 
                  alt="AI & Risk Insights Dashboard" 
                  className="w-full rounded-2xl"
                  style={{ 
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 10px 25px rgba(0, 0, 0, 0.3)'
                  }}
                />
              </div>

              {/* Customer Testimonials Section */}
              <div className="mt-24">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-semibold mb-4" style={{ color: '#ffffff' }}>
                    Trusted by leading institutions
                  </h2>
                  <p className="text-lg max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
                    See what our customers have to say about their experience with SmartLenderUp
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {/* Testimonial 1 */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-current" style={{ color: '#fbbf24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: '#ffffff', opacity: 0.9 }}>
                      "SmartLenderUp has transformed how we manage our loan portfolio. The AI insights have helped us reduce defaults by 40%."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ade8f4' }}>
                        <span className="font-semibold" style={{ color: '#023e8a' }}>JK</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>Jane Kamau</p>
                        <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>CEO, Nairobi SACCO</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-current" style={{ color: '#fbbf24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: '#ffffff', opacity: 0.9 }}>
                      "The M-Pesa integration is seamless. Our members can now repay loans instantly, improving our cash flow significantly."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ade8f4' }}>
                        <span className="font-semibold" style={{ color: '#023e8a' }}>PM</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>Peter Mwangi</p>
                        <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>Manager, Kisumu MFI</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-current" style={{ color: '#fbbf24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: '#ffffff', opacity: 0.9 }}>
                      "Outstanding platform! The analytics dashboard gives us real-time insights that help us make better lending decisions."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ade8f4' }}>
                        <span className="font-semibold" style={{ color: '#023e8a' }}>SA</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>Sarah Achieng</p>
                        <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>Director, Mombasa Credit Union</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 4 */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-current" style={{ color: '#fbbf24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: '#ffffff', opacity: 0.9 }}>
                      "Best decision we made! The automation features save us hours every day and the customer support is exceptional."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ade8f4' }}>
                        <span className="font-semibold" style={{ color: '#023e8a' }}>DO</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>David Ochieng</p>
                        <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>Operations Lead, Eldoret SACCO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20" style={{ 
        backgroundColor: '#010520',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <img src={smartLenderLogo} alt="SmartLenderUp" className="h-8 mb-4" />
              <p className="text-sm mb-4" style={{ color: '#ffffff', opacity: 0.7 }}>
                Empowering microfinance institutions across Africa with innovative lending solutions.
              </p>
              <div className="flex gap-3">
                <a href="#" className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Facebook className="size-5" style={{ color: '#ade8f4' }} />
                </a>
                <a href="#" className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Twitter className="size-5" style={{ color: '#ade8f4' }} />
                </a>
                <a href="#" className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Linkedin className="size-5" style={{ color: '#ade8f4' }} />
                </a>
                <a href="#" className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Instagram className="size-5" style={{ color: '#ade8f4' }} />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#ffffff' }}>Products</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Microfinance Suite</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Loan Management</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Savings & Deposits</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Analytics & Reporting</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>M-Pesa Integration</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#ffffff' }}>Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>About Us</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Careers</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Blog</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Press</a></li>
                <li><a href="#" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>Partners</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#ffffff' }}>Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Mail className="size-4 mt-0.5 flex-shrink-0" style={{ color: '#ade8f4' }} />
                  <a href="mailto:info@smartlenderup.com" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>
                    info@smartlenderup.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="size-4 mt-0.5 flex-shrink-0" style={{ color: '#ade8f4' }} />
                  <a href="tel:+254700000000" className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.7 }}>
                    +254 700 000 000
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 flex-shrink-0" style={{ color: '#ade8f4' }} />
                  <span className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>
                    Nairobi, Kenya
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>
              © {new Date().getFullYear()} SmartLenderUp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button onClick={() => setShowPrivacyPolicy(true)} className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.6 }}>Privacy Policy</button>
              <button onClick={() => setShowTermsOfService(true)} className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.6 }}>Terms of Service</button>
              <button onClick={() => setShowCookiePolicy(true)} className="text-sm hover:opacity-80" style={{ color: '#ffffff', opacity: 0.6 }}>Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Organization Sign Up Modal */}
      <OrganizationSignUpModal
        isOpen={showOrganizationSignUp}
        onClose={() => setShowOrganizationSignUp(false)}
        onSignUp={handleOrganizationSignUp}
        accountType={selectedAccountType}
      />

      {/* Organization Success Modal */}
      <OrganizationSuccessModal
        isOpen={showOrgSuccess}
        onClose={() => setShowOrgSuccess(false)}
        organizationName={newOrgName}
        loginEmail={newOrgUsername}
      />

      {/* Blur overlay when dropdowns are open */}
      {(activeDropdown === 'products' || activeDropdown === 'customers' || activeDropdown === 'features') && !infoPopup && (
        <div 
          className="fixed inset-0 z-40"
          style={{
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Info Popup */}
      {infoPopup && (
        <>
          {/* Blur background */}
          <div 
            className="fixed inset-0 z-50"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => {
              setInfoPopup(null);
              setActiveDropdown(null);
            }}
          />
          
          {/* Info card on the right */}
          <div 
            className="fixed right-8 top-1/2 -translate-y-1/2 w-96 rounded-xl shadow-2xl border p-6 z-50 animate-fade-in"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setInfoPopup(null);
                setActiveDropdown(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:bg-opacity-20"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              <X className="size-5" />
            </button>

            <h3 
              className="mb-4 pr-8"
              style={{ 
                color: currentTheme.colors.text,
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {infoPopup.title}
            </h3>
            
            <p 
              className="leading-relaxed"
              style={{ 
                color: currentTheme.colors.textSecondary,
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {infoPopup.description}
            </p>

            <button
              className="mt-6 w-full py-2.5 rounded-lg transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600'
              }}
              onClick={() => {
                setInfoPopup(null);
                setActiveDropdown(null);
              }}
            >
              Learn More
            </button>
          </div>
        </>
      )}

      {/* Registration Type Modal */}
      <RegistrationTypeModal
        isOpen={showRegistrationType}
        onClose={() => setShowRegistrationType(false)}
        onSelectType={handleRegistrationTypeSelect}
      />

      {/* Individual Sign Up Modal */}
      <IndividualSignUpModal
        isOpen={showIndividualSignUp}
        onClose={() => setShowIndividualSignUp(false)}
        onSignUp={handleIndividualSignUp}
        onShowTerms={() => {
          setShowIndividualSignUp(false);
          setShowTermsOfService(true);
        }}
        onShowPrivacy={() => {
          setShowIndividualSignUp(false);
          setShowPrivacyPolicy(true);
        }}
      />

      {/* Group Sign Up Modal */}
      <GroupSignUpModal
        isOpen={showGroupSignUp}
        onClose={() => setShowGroupSignUp(false)}
        onSignUp={handleGroupSignUp}
        onShowTerms={() => {
          setShowGroupSignUp(false);
          setShowTermsOfService(true);
        }}
        onShowPrivacy={() => {
          setShowGroupSignUp(false);
          setShowPrivacyPolicy(true);
        }}
      />

      {/* Super Admin Login Modal */}
      <SuperAdminLoginModal
        isOpen={showSuperAdminLogin}
        onClose={() => setShowSuperAdminLogin(false)}
        onLogin={handleSuperAdminLogin}
      />

      {/* Super Admin Dashboard */}
      {showSuperAdminDashboard && (
        <SuperAdminDashboard onClose={() => setShowSuperAdminDashboard(false)} />
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <>
          <div 
            className="fixed inset-0 z-50"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => setShowPrivacyPolicy(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-8"
              style={{
                backgroundColor: '#0a1128',
                borderColor: '#ade8f4'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold" style={{ color: '#ffffff' }}>Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="p-2 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'rgba(173, 232, 244, 0.1)' }}
                >
                  <X className="size-6" style={{ color: '#ade8f4' }} />
                </button>
              </div>
              
              <div className="space-y-6" style={{ color: '#ffffff', opacity: 0.9 }}>
                <p className="text-sm" style={{ opacity: 0.7 }}>Last updated: December 19, 2025</p>
                
                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>1. Introduction</h3>
                  <p className="leading-relaxed">
                    SmartLenderUp ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our microfinance platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>2. Information We Collect</h3>
                  <p className="leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Personal identification information (name, email address, phone number, national ID)</li>
                    <li>Financial information (bank account details, M-Pesa number, credit history)</li>
                    <li>Business information (organization name, registration details, tax information)</li>
                    <li>Transaction data (loan applications, repayments, savings deposits)</li>
                    <li>Usage data (how you interact with our platform)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>3. How We Use Your Information</h3>
                  <p className="leading-relaxed mb-3">We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Process loan applications and manage your account</li>
                    <li>Facilitate M-Pesa and other payment transactions</li>
                    <li>Assess creditworthiness and manage risk</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send important notifications about your account</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Improve our services through analytics and AI insights</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>4. Data Security</h3>
                  <p className="leading-relaxed">
                    We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>5. Information Sharing</h3>
                  <p className="leading-relaxed mb-3">We may share your information with:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Credit reference bureaus for credit assessment</li>
                    <li>Payment processors (M-Pesa, banks) to facilitate transactions</li>
                    <li>Regulatory authorities as required by law</li>
                    <li>Service providers who assist in our operations (under strict confidentiality agreements)</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    We will never sell your personal information to third parties.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>6. Your Rights</h3>
                  <p className="leading-relaxed mb-3">Under Kenya's Data Protection Act, you have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data (subject to legal obligations)</li>
                    <li>Object to processing of your data</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>7. Contact Us</h3>
                  <p className="leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at:<br />
                    Email: privacy@smartlenderup.com<br />
                    Phone: +254 700 000 000<br />
                    Address: Nairobi, Kenya
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(173, 232, 244, 0.2)' }}>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="w-full py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Terms of Service Modal */}
      {showTermsOfService && (
        <>
          <div 
            className="fixed inset-0 z-50"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => setShowTermsOfService(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-8"
              style={{
                backgroundColor: '#0a1128',
                borderColor: '#ade8f4'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold" style={{ color: '#ffffff' }}>Terms of Service</h2>
                <button
                  onClick={() => setShowTermsOfService(false)}
                  className="p-2 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'rgba(173, 232, 244, 0.1)' }}
                >
                  <X className="size-6" style={{ color: '#ade8f4' }} />
                </button>
              </div>
              
              <div className="space-y-6" style={{ color: '#ffffff', opacity: 0.9 }}>
                <p className="text-sm" style={{ opacity: 0.7 }}>Last updated: December 19, 2025</p>
                
                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>1. Acceptance of Terms</h3>
                  <p className="leading-relaxed">
                    By accessing and using SmartLenderUp, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>2. Eligibility</h3>
                  <p className="leading-relaxed mb-3">To use SmartLenderUp, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be at least 18 years old</li>
                    <li>Be a resident of Kenya or operating a registered entity in Kenya</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Provide accurate and complete registration information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>3. User Accounts</h3>
                  <p className="leading-relaxed mb-3">When you create an account:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized access</li>
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>4. Loan Terms</h3>
                  <p className="leading-relaxed mb-3">For loan services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Loan approval is subject to credit assessment and verification</li>
                    <li>Interest rates and repayment terms will be clearly stated in your loan agreement</li>
                    <li>Late payments may incur additional fees as specified in your agreement</li>
                    <li>You agree to repay loans according to the agreed schedule</li>
                    <li>We may report payment history to credit reference bureaus</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>5. M-Pesa Integration</h3>
                  <p className="leading-relaxed">
                    Our M-Pesa integration is subject to Safaricom's terms and conditions. By using M-Pesa services through our platform, you agree to comply with Safaricom's policies. Transaction fees may apply.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>6. Prohibited Activities</h3>
                  <p className="leading-relaxed mb-3">You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide false or misleading information</li>
                    <li>Use the platform for fraudulent purposes</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the platform</li>
                    <li>Use automated systems to access the platform without permission</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>7. Limitation of Liability</h3>
                  <p className="leading-relaxed">
                    SmartLenderUp provides the platform "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the fees paid by you in the preceding 12 months.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>8. Changes to Terms</h3>
                  <p className="leading-relaxed">
                    We reserve the right to modify these Terms of Service at any time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>9. Governing Law</h3>
                  <p className="leading-relaxed">
                    These terms are governed by the laws of Kenya. Any disputes shall be resolved in Kenyan courts.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>10. Contact Information</h3>
                  <p className="leading-relaxed">
                    For questions about these Terms of Service:<br />
                    Email: legal@smartlenderup.com<br />
                    Phone: +254 700 000 000<br />
                    Address: Nairobi, Kenya
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(173, 232, 244, 0.2)' }}>
                <button
                  onClick={() => setShowTermsOfService(false)}
                  className="w-full py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cookie Policy Modal */}
      {showCookiePolicy && (
        <>
          <div 
            className="fixed inset-0 z-50"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => setShowCookiePolicy(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-8"
              style={{
                backgroundColor: '#0a1128',
                borderColor: '#ade8f4'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold" style={{ color: '#ffffff' }}>Cookie Policy</h2>
                <button
                  onClick={() => setShowCookiePolicy(false)}
                  className="p-2 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'rgba(173, 232, 244, 0.1)' }}
                >
                  <X className="size-6" style={{ color: '#ade8f4' }} />
                </button>
              </div>
              
              <div className="space-y-6" style={{ color: '#ffffff', opacity: 0.9 }}>
                <p className="text-sm" style={{ opacity: 0.7 }}>Last updated: December 19, 2025</p>
                
                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>1. What Are Cookies?</h3>
                  <p className="leading-relaxed">
                    Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>2. Types of Cookies We Use</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Essential Cookies</h4>
                      <p className="leading-relaxed">
                        These cookies are necessary for the platform to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Performance Cookies</h4>
                      <p className="leading-relaxed">
                        These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve our services.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Functional Cookies</h4>
                      <p className="leading-relaxed">
                        These cookies enable enhanced functionality and personalization, such as remembering your login details, language preferences, and customized settings.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Analytics Cookies</h4>
                      <p className="leading-relaxed">
                        We use analytics cookies to understand how users interact with our platform, which pages are most popular, and how users navigate through our site. This information is aggregated and anonymous.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>3. Third-Party Cookies</h3>
                  <p className="leading-relaxed mb-3">We may use third-party services that set cookies on your device:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>M-Pesa integration for payment processing</li>
                    <li>Analytics services to improve our platform</li>
                    <li>Security services to protect against fraud</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>4. Managing Cookies</h3>
                  <p className="leading-relaxed mb-3">
                    You can control and manage cookies in various ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Most browsers allow you to refuse cookies through their settings</li>
                    <li>You can delete cookies that have already been set</li>
                    <li>Browser add-ons and extensions can help manage cookies</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    Please note that blocking or deleting cookies may impact your ability to use certain features of our platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>5. Cookie Retention</h3>
                  <p className="leading-relaxed">
                    Session cookies are deleted when you close your browser. Persistent cookies remain on your device until they expire or you delete them. The retention period varies depending on the purpose of the cookie.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>6. Updates to This Policy</h3>
                  <p className="leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#ade8f4' }}>7. Contact Us</h3>
                  <p className="leading-relaxed">
                    If you have questions about our use of cookies:<br />
                    Email: privacy@smartlenderup.com<br />
                    Phone: +254 700 000 000<br />
                    Address: Nairobi, Kenya
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(173, 232, 244, 0.2)' }}>
                <button
                  onClick={() => setShowCookiePolicy(false)}
                  className="w-full py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <>
          <div 
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowForgotPassword(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
              style={{ backgroundColor: '#0a1128' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#ffffff' }}>
                Reset Password
              </h2>
              <p className="text-sm mb-6" style={{ color: '#ffffff', opacity: 0.7 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <div className="mb-6">
                <label className="block text-sm mb-2" style={{ color: '#ffffff', opacity: 0.9 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(173, 232, 244, 0.05)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(173, 232, 244, 0.2)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (resetEmail.trim()) {
                      toast.success('Password Reset Email Sent', {
                        description: `Instructions have been sent to ${resetEmail}`
                      });
                      setShowForgotPassword(false);
                      setResetEmail('');
                    } else {
                      toast.error('Please enter your email address');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}
                >
                  Send Reset Link
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="flex-1 py-2.5 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: 'rgba(173, 232, 244, 0.1)', 
                    color: '#ade8f4',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(173, 232, 244, 0.3)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}