import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoginPage } from '../components/LoginPage';
import { RegisterPage } from '../pages/Register';
import { MotherCompanyHome } from '../components/MotherCompanyHome';
import { InternalStaffPortal } from '../components/InternalStaffPortal';
import { ClientPortal } from '../components/ClientPortal';
import { MainNavigation } from '../components/MainNavigation';
import { SupabaseSyncStatus } from '../components/SupabaseSyncStatus';
import { ThemeToggle } from '../components/ThemeToggle';
import { PaymentCalendar } from '../components/PaymentCalendar';
import { DatabaseSetupNotice } from '../components/DatabaseSetupNotice';
import { CacheWarning } from './CacheWarning';
import { AutoDuplicateFix } from '../components/AutoDuplicateFix';
import { AutoFixProgress } from '../components/AutoFixProgress';
import { Toaster } from 'sonner@2.0.3';
import { 
  LogOut, 
  Eye, 
  Edit, 
  Share2, 
  ChevronRight, 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Link2, 
  FolderInput, 
  Trash2, 
  Copy,
  User,
  ChevronDown
} from 'lucide-react';
import { runComprehensiveCleanup } from '../utils/databaseCleanup';
import { getStorageUsage, cleanupAllAutoBackups } from '../utils/dataBackup';
import { getOrganizationName, getCountryDemonym, getOrganizationLogo } from '../utils/organizationUtils';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { BV_FUNGUO_LOGO } from '../assets/BVFunguoLogo';
import logoImage from "figma:asset/8c9a9782f822a04113fd7bff4f68f1bc0ac7a2af.png";
import { QuickVerify } from '../components/diagnostics/QuickVerify';
import { JournalEntryFixNotice } from '../components/diagnostics/JournalEntryFixNotice';
import { PrincipalFixSummary } from '../components/diagnostics/PrincipalFixSummary';
import { ProfileModal } from '../components/modals/ProfileModal';
import PermissionsDiagnostic from '../components/PermissionsDiagnostic';
import { DebugPermissions } from '../components/DebugPermissions';
import { DatabaseErrorHandler } from '../components/DatabaseErrorHandler';
import { DatabaseErrorHelper } from '../components/DatabaseErrorHelper';
import { FigmaMakeStatus } from '../components/FigmaMakeStatus';
import { FaviconSetter } from '../components/FaviconSetter';
import { initializeGlobalNumericInputs } from '../utils/globalNumericInputs';
// Disabled temporarily to debug loading issues
// import '../utils/devMigrationTools'; // Import developer migration tools for data updates
import '../utils/localStorageMonitor'; // Monitor all localStorage operations for debugging
import '../utils/databaseDiagnostics'; // Database diagnostics tool - use window.diagnoseDatabaseIssue() in console

// Initialize default organization and user BEFORE React renders
// This prevents AuthContext sync issues
const initializeDefaultSession = () => {
  const existingUser = localStorage.getItem('bvfunguo_user');
  const existingOrg = localStorage.getItem('current_organization');
  
  // Use a valid UUID format for organization ID
  const validOrgId = '00000000-0000-0000-0000-000000000001';
  
  // Default organization data
  const defaultOrganization = {
    id: validOrgId,
    organization_name: 'SmartLenderUp',
    email: 'admin@smartlenderup.com',
    contact_person_email: 'admin@smartlenderup.com',
    country: 'Kenya',
    status: 'active',
    currency: 'KES'
  };
  
  // Check if existing organization has invalid ID and needs fixing
  let needsOrgUpdate = false;
  if (existingOrg) {
    try {
      const org = JSON.parse(existingOrg);
      // Check if organization ID is not a valid UUID format
      if (org.id && !org.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.warn('⚠️ [App] Invalid organization ID format detected:', org.id);
        needsOrgUpdate = true;
      }
    } catch (e) {
      needsOrgUpdate = true;
    }
  }
  
  // Check if existing user has invalid organization ID or user ID
  let needsUserUpdate = false;
  if (existingUser) {
    try {
      const user = JSON.parse(existingUser);
      // Check both organizationId and id fields
      if ((user.organizationId && !user.organizationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) ||
          (user.id && !user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))) {
        console.warn('⚠️ [App] Invalid user organization ID format detected:', user.organizationId || user.id);
        needsUserUpdate = true;
      }
    } catch (e) {
      needsUserUpdate = true;
    }
  }
  
  // Update organization if it exists and has invalid format OR doesn't exist at all
  if (!existingOrg || (existingOrg && needsOrgUpdate)) {
    console.log('🔐 [App] Setting up organization data with valid UUID...');
    localStorage.setItem('current_organization', JSON.stringify(defaultOrganization));
    console.log('✅ [App] Organization data set with valid UUID:', validOrgId);
  }
  
  // Only update user if it exists and has invalid format
  if (existingUser && needsUserUpdate) {
    console.log('🔐 [App] Updating user data with valid UUID...');
    const user = JSON.parse(existingUser);
    user.id = validOrgId;
    user.organizationId = validOrgId;
    localStorage.setItem('bvfunguo_user', JSON.stringify(user));
    localStorage.setItem('bv_funguo_user', JSON.stringify(user)); // Also set alternate key for compatibility
    console.log('✅ [App] User data updated with valid UUID:', validOrgId);
  }
  
  // Log final status
  if (!existingUser && !existingOrg) {
    console.log('✅ [App] Default organization created - ready for auto-login');
  } else if (!needsOrgUpdate && !needsUserUpdate && existingUser && existingOrg) {
    console.log('✅ [App] Session already exists with valid UUID, skipping initialization');
  } else if (needsOrgUpdate || needsUserUpdate) {
    console.log('✅ [App] Successfully migrated from legacy ID format to UUID format');
  }
};

// Run initialization immediately when module loads
initializeDefaultSession();

function AppContent() {
  const { currentUser, isAuthenticated, isLoading, logout, login } = useAuth();
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null); // Start with null to show landing page
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);
  const [portalView, setPortalView] = useState<'staff' | 'client'>('staff');
  const [selectedClientId, setSelectedClientId] = useState('CL001'); // Default client ID
  const [openHeaderDropdown, setOpenHeaderDropdown] = useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  
  // Debug: Track dropdown state changes
  useEffect(() => {
    console.log('🎯 [DROPDOWN] State changed to:', openHeaderDropdown);
  }, [openHeaderDropdown]);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<'share' | 'social-media' | string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [triggerTab, setTriggerTab] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentTheme, isDark } = useTheme();
  
  // Debug profile modal state
  useEffect(() => {
    console.log('🔵 Profile Modal State:', showProfileModal);
  }, [showProfileModal]);
  
  const organizationName = getOrganizationName();
  const countryDemonym = getCountryDemonym();
  const organizationLogo = getOrganizationLogo() || BV_FUNGUO_LOGO;

  // Listen to URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  const handleRegisterSuccess = () => {
    // Navigate to login page after successful registration
    navigateTo('/login');
  };

  const handleBackToLogin = () => {
    navigateTo('/login');
  };

  const handleGoToRegister = () => {
    navigateTo('/register');
  };

  // Debug logging
  useEffect(() => {
    console.log('🔍 [App] Current State:', { 
      isAuthenticated, 
      isLoading, 
      currentUser: currentUser?.name,
      currentRoute,
      portalView 
    });
  }, [isAuthenticated, isLoading, currentUser, currentRoute, portalView]);

  // EMERGENCY: Force isLoading to false if it's stuck for more than 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.error('⚠️ [App] STUCK IN LOADING STATE - This should not happen!');
        console.error('⚠️ [App] isAuthenticated:', isAuthenticated);
        console.error('⚠️ [App] currentUser:', currentUser);
        console.error('⚠️ [App] Please check AuthContext or DataContext for errors');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, currentUser]);

  // Auto-login effect - runs once when component mounts
  useEffect(() => {
    // ❌ DISABLED: Auto-login removed to show landing page
    // Users should see the login/landing page first
    setAutoLoginAttempted(true);
    
    /* ORIGINAL AUTO-LOGIN CODE - DISABLED
    // Only run once, immediately on mount
    if (autoLoginAttempted) return;
    
    // Check if user is already initialized in localStorage
    const existingUser = localStorage.getItem('bvfunguo_user');
    
    console.log('🔐 [App] Auto-login check:', {
      isLoading,
      isAuthenticated,
      autoLoginAttempted,
      existingUser: !!existingUser,
      currentRoute
    });
    
    // If user already exists in localStorage, let AuthContext handle it
    if (existingUser) {
      console.log('🔐 User already exists in localStorage, AuthContext will load it');
      setAutoLoginAttempted(true);
      // Auto-select SmartLenderUp platform to skip brown landing page
      setCurrentPlatform('smartlenderup');
      return;
    }
    
    // If not on register page and no user exists, auto-login
    if (currentRoute !== '/register') {
      // ✅ Auto-login to make dashboard the default landing page
      console.log('🔐 Auto-login enabled - creating default admin session');
      setAutoLoginAttempted(true);
      
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Admin User',
        email: 'admin@smartlenderup.com',
        phone: '0700000000',
        role: 'Admin' as const,
        userType: 'admin' as const,
        organizationId: '00000000-0000-0000-0000-000000000001',
        username: 'admin'
      };
      
      // Call login directly (no setTimeout to avoid timing issues)
      login(adminUser);
      // Auto-select SmartLenderUp platform to skip brown landing page
      setCurrentPlatform('smartlenderup');
    } else {
      setAutoLoginAttempted(true);
    }
    */
  }, []); // Run only once on mount

  // Auto-select platform when authenticated (skip landing page)
  useEffect(() => {
    if (isAuthenticated && !currentPlatform) {
      console.log('🔐 User authenticated, auto-selecting platform to skip landing page');
      setCurrentPlatform('smartlenderup');
    }
  }, [isAuthenticated, currentPlatform]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on a button inside the dropdown
      if (target.closest('button')?.textContent?.includes('My Profile') || 
          target.closest('button')?.textContent?.includes('Log Out')) {
        return;
      }
      
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenHeaderDropdown(null);
      }
    };

    if (openHeaderDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openHeaderDropdown]);

  // Debug helper for organizations
  useEffect(() => {
    (window as any).debugOrgs = () => {
      const db = JSON.parse(localStorage.getItem('bv_funguo_db') || '{}');
      console.log('🔍 ===== ORGANIZATION DEBUG =====');
      console.log('📦 Total organizations:', db.organizations?.length || 0);
      
      if (db.organizations && db.organizations.length > 0) {
        db.organizations.forEach((org: any, i: number) => {
          console.log(`\n--- Organization ${i + 1}: ${org.organization_name} ---`);
          console.log('✅ Login with Email:', org.email);
          console.log('✅ OR Contact Email:', org.contact_person_email);
          console.log('✅ Password:', org.password_hash);
          console.log('Username:', org.username);
          console.log('ID:', org.id);
        });
      } else {
        console.log('❌ No organizations found');
      }
      console.log('\n🔍 ===== END DEBUG =====');
    };
    
    // Register database cleanup function
    (window as any).cleanupDatabase = async () => {
      console.log('🧹 Manual database cleanup triggered...');
      const orgData = localStorage.getItem('current_organization');
      const orgId = orgData ? JSON.parse(orgData)?.id : null;
      const result = await runComprehensiveCleanup(orgId);
      console.log('✅ Cleanup result:', result);
      return result;
    };
    
    // Register storage management functions
    (window as any).checkStorage = () => {
      const usage = getStorageUsage();
      console.log('📊 ===== LOCALSTORAGE USAGE =====');
      console.log(`💾 Used: ${usage.usedMB} MB (${usage.percentage.toFixed(1)}%)`);
      console.log(` Total backups: ${usage.backupCount}`);
      console.log(`💼 Backup size: ${(usage.backupSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log('================================');
      return usage;
    };
    
    (window as any).cleanupBackups = () => {
      const count = cleanupAllAutoBackups();
      console.log(`✅ Cleaned up ${count} auto backups`);
      return count;
    };
    
    // Debug authentication state
    (window as any).debugAuthState = () => {
      console.log('🔐 ===== AUTHENTICATION STATE =====');
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Is Loading:', isLoading);
      console.log('Current User:', currentUser);
      console.log('');
      
      // Check localStorage
      const userData = localStorage.getItem('bv_funguo_user');
      const credentials = localStorage.getItem('bv_funguo_credentials');
      const orgData = localStorage.getItem('current_organization');
      
      console.log(' ===== LOCALSTORAGE DATA =====');
      console.log('User Data:', userData ? JSON.parse(userData) : null);
      console.log('Credentials:', credentials ? JSON.parse(credentials) : null);
      console.log('Organization:', orgData ? JSON.parse(orgData) : null);
      console.log('');
      
      // Check permissions
      if (currentUser?.permissions) {
        console.log('🔑 ===== PERMISSIONS =====');
        console.log('User Permissions:', currentUser.permissions);
      }
      
      console.log('================================');
      return {
        isAuthenticated,
        isLoading,
        currentUser,
        localStorage: {
          user: userData ? JSON.parse(userData) : null,
          credentials: credentials ? JSON.parse(credentials) : null,
          organization: orgData ? JSON.parse(orgData) : null
        }
      };
    };
    
    console.log('💡 Debug ready! Type: window.debugOrgs()');
    console.log('💡 Manual cleanup: window.cleanupDatabase()');
    console.log('💡 Check storage: window.checkStorage()');
    console.log('💡 Clean backups: window.cleanupBackups()');
    console.log('💡 Check auth: window.debugAuthState()');
    console.log('💡 🔍 Diagnose DB issues: window.diagnoseDatabaseIssue()');
    console.log('💡 Go to register: window.location.href = "/register"');
  }, [isAuthenticated, isLoading, currentUser]);

  const handleLogin = (userType: 'admin' | 'employee' | 'staff', userData: any) => {
    login(userData);
    
    // Close any open dropdowns
    setOpenHeaderDropdown(null);
    
    // ✅ Auto-select platform to skip landing page
    setCurrentPlatform('smartlenderup');
    
    // Check if this is a client logging in
    if (userData.userType === 'client' && userData.clientId) {
      setPortalView('client');
      setSelectedClientId(userData.clientId);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('bv_funguo_credentials');
    // Close any open dropdowns
    setOpenHeaderDropdown(null);
    // Reset to landing page
    setCurrentPlatform(null);
  };

  const handleHeaderMenuClick = (tabId: string) => {
    setPortalView('staff'); // Switch to staff portal if not already there
    setTriggerTab(tabId);
    setOpenHeaderDropdown(null);
    // Clear trigger after a short delay to allow the effect to fire
    setTimeout(() => setTriggerTab(null), 100);
  };

  const handleMenuItemClick = (itemText: string) => {
    setSelectedMenuItem(itemText);
    setOpenHeaderDropdown(null);
    setHoveredSubmenu(null);
    console.log('Clicked item:', itemText);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111120]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading SmartLenderUp...</p>
        </div>
      </div>
    );
  }

  // Show permissions diagnostic (accessible without login)
  if (currentRoute === '/permissions-diagnostic') {
    return <PermissionsDiagnostic />;
  }

  // Show register page if route is /register
  if (currentRoute === '/register' && !isAuthenticated) {
    return (
      <RegisterPage 
        onSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // ✅ Show login page if not authenticated
  if (!isAuthenticated) {
    console.log('🔐 [App] Not authenticated - showing login page');
    return (
      <LoginPage 
        onLogin={handleLogin}
        onGoToRegister={handleGoToRegister}
      />
    );
  }

  // 🏠 Show landing page if authenticated but no platform selected
  if (!currentPlatform) {
    console.log('🏠 [App] Authenticated - showing landing page');
    console.log('🏠 [App] currentPlatform:', currentPlatform);
    console.log('🏠 [App] isAuthenticated:', isAuthenticated);
    console.log('🏠 [App] currentUser:', currentUser);
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#3c1f1b' }}>
        {/* Added wrapper with explicit background to ensure visibility */}
        <MotherCompanyHome 
          onSelectPlatform={(platformId) => {
            console.log('✅ Platform selected:', platformId);
            setCurrentPlatform(platformId);
          }}
        />
      </div>
    );
  }

  // 🐛 DEBUG: Check if we're authenticated but nothing is rendering
  console.log('🔍 [App] Rendering authenticated view:', { 
    isAuthenticated, 
    currentUser: currentUser?.name,
    portalView 
  });

  return (
    <div 
      className={`min-h-screen overflow-x-hidden transition-colors ${isDark ? 'dark' : ''}`}
      style={{
        backgroundColor: isDark ? currentTheme.darkColors.appBackground : currentTheme.colors.appBackground
      }}
    >
      {/* Portal Selector */}
      <div 
        className="border-b px-4 sm:px-6 md:px-8 py-2 flex-shrink-0 transition-colors backdrop-blur-md relative z-10"
        style={{
          backgroundColor: 'rgba(17, 17, 32, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <img 
              src={logoImage}
              alt={organizationName} 
              className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg truncate text-white">
                {organizationName}
              </h1>
              <p className="text-xs hidden sm:block truncate text-white/70 text-[rgba(155,159,190,0.7)]">
                Empowering {countryDemonym} Entrepreneurs
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
            {/* Supabase Sync Status - Hidden on mobile */}
            <div className="hidden md:block">
              <SupabaseSyncStatus />
            </div>
            
            {/* Theme Toggle - Temporarily hidden (light mode only) */}
            {/* <ThemeToggle /> */}
            
            {/* Payment Calendar - Hidden on mobile */}
            <div className="hidden lg:block">
              <PaymentCalendar />
            </div>
            
            {/* Header Icon Menus Container */}
            <div ref={headerRef} className="flex gap-1 sm:gap-2">
              {/* Notifications Menu */}
              {portalView === 'staff' && (
                <div className="relative">


                  {/* Notifications Dropdown */}
                  {openHeaderDropdown === 'notifications' && (
                    <div 
                      className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border py-2 min-w-[200px] z-[100]"
                      style={{
                        backgroundColor: currentTheme.darkColors.menuBackground,
                        borderColor: currentTheme.darkColors.border
                      }}
                    >
                      {/* View */}
                      <button
                        onClick={() => handleMenuItemClick('View')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                        style={{
                          color: currentTheme.darkColors.menuText
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye className="size-4" />
                        <span>View</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleMenuItemClick('Edit')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                        style={{
                          color: currentTheme.darkColors.menuText
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit className="size-4" />
                        <span>Edit</span>
                      </button>

                      {/* Share */}
                      <div 
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('share')}
                        onMouseLeave={() => setHoveredSubmenu(null)}
                      >
                        <button
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                          style={{
                            color: currentTheme.darkColors.menuText,
                            backgroundColor: hoveredSubmenu === 'share' ? currentTheme.darkColors.menuHover : 'transparent'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Share2 className="size-4" />
                            <span>Share</span>
                          </div>
                          <ChevronRight className="size-4" />
                        </button>

                        {/* Share Submenu */}
                        {hoveredSubmenu === 'share' && (
                          <div
                            className="absolute left-full top-0 ml-1 rounded-lg shadow-xl border py-2 min-w-[200px]"
                            style={{
                              backgroundColor: currentTheme.darkColors.menuBackground,
                              borderColor: currentTheme.darkColors.border
                            }}
                          >
                            {/* On social media */}
                            <div 
                              className="relative"
                              onMouseEnter={() => setHoveredSubmenu('social-media')}
                              onMouseLeave={() => setHoveredSubmenu('share')}
                            >
                              <button
                                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                                style={{
                                  color: currentTheme.darkColors.menuText,
                                  backgroundColor: hoveredSubmenu === 'social-media' ? currentTheme.darkColors.menuHover : 'transparent'
                                }}
                              >
                                <span>On social media</span>
                                <ChevronRight className="size-4" />
                              </button>

                              {/* Social Media Sub-submenu */}
                              {hoveredSubmenu === 'social-media' && (
                                <div
                                  className="absolute left-full top-0 ml-1 rounded-lg shadow-xl border py-2 min-w-[180px]"
                                  style={{
                                    backgroundColor: currentTheme.darkColors.menuBackground,
                                    borderColor: currentTheme.darkColors.border
                                  }}
                                >
                                  <button
                                    onClick={() => handleMenuItemClick('Facebook')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                                    style={{
                                      color: currentTheme.darkColors.menuText
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Facebook className="size-4" />
                                    <span>Facebook</span>
                                  </button>
                                  <button
                                    onClick={() => handleMenuItemClick('Twitter')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                                    style={{
                                      color: currentTheme.darkColors.menuText
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Twitter className="size-4" />
                                    <span>Twitter</span>
                                  </button>
                                  <button
                                    onClick={() => handleMenuItemClick('Instagram')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                                    style={{
                                      color: currentTheme.darkColors.menuText
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Instagram className="size-4" />
                                    <span>Instagram</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleMenuItemClick('By email')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                              style={{
                                color: currentTheme.darkColors.menuText
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Mail className="size-4" />
                              <span>By email</span>
                            </button>
                            <button
                              onClick={() => handleMenuItemClick('Get Link')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                              style={{
                                color: currentTheme.darkColors.menuText
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Link2 className="size-4" />
                              <span>Get Link</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Move */}
                      <div 
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('move')}
                        onMouseLeave={() => setHoveredSubmenu(null)}
                      >
                        <button
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                          style={{
                            color: currentTheme.darkColors.menuText,
                            backgroundColor: hoveredSubmenu === 'move' ? currentTheme.darkColors.menuHover : 'transparent'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <FolderInput className="size-4" />
                            <span>Move</span>
                          </div>
                          <ChevronRight className="size-4" />
                        </button>

                        {/* Move Submenu */}
                        {hoveredSubmenu === 'move' && (
                          <div
                            className="absolute left-full top-0 ml-1 rounded-lg shadow-xl border py-2 min-w-[180px]"
                            style={{
                              backgroundColor: currentTheme.darkColors.menuBackground,
                              borderColor: currentTheme.darkColors.border
                            }}
                          >
                            <button
                              onClick={() => handleMenuItemClick('To folder')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                              style={{
                                color: currentTheme.darkColors.menuText
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <FolderInput className="size-4" />
                              <span>To folder</span>
                            </button>
                            <button
                              onClick={() => handleMenuItemClick('To trash')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                              style={{
                                color: currentTheme.darkColors.menuText
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Trash2 className="size-4" />
                              <span>To trash</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleMenuItemClick('Duplicate')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                        style={{
                          color: currentTheme.darkColors.menuText
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Copy className="size-4" />
                        <span>Duplicate</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Info & Profile Dropdown */}
            <div className="relative flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
              <button
                onClick={() => setOpenHeaderDropdown(openHeaderDropdown === 'profile' ? null : 'profile')}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-white font-bold">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-white/70 text-[rgba(175,175,182,0.7)]">
                    {currentUser?.email}
                  </p>
                </div>
                <ChevronDown className={`size-4 text-white transition-transform ${openHeaderDropdown === 'profile' ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {openHeaderDropdown === 'profile' && (
                <div 
                  className="absolute top-full right-0 mt-2 rounded-lg shadow-xl border py-2 min-w-[200px] z-[9999]"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    backgroundColor: currentTheme.darkColors.menuBackground,
                    borderColor: currentTheme.darkColors.border
                  }}
                >
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔵 My Profile clicked, opening modal...');
                      setShowProfileModal(true);
                      setOpenHeaderDropdown(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{
                      color: currentTheme.darkColors.menuText
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User className="size-4" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔴 Log Out clicked...');
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{
                      color: currentTheme.darkColors.menuText
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.darkColors.menuHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="size-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Main Navigation */}
      {portalView === 'staff' && (
        <MainNavigation />
      )}

      {/* Portal Content */}
      {portalView === 'staff' ? (
        <InternalStaffPortal onClientSelect={setSelectedClientId} triggerTab={triggerTab} />
      ) : (
        <ClientPortal clientId={selectedClientId} onBackToAdmin={() => setPortalView('staff')} />
      )}

      {/* Footer */}
      <footer 
        className="border-t py-4 mt-8 transition-colors"
        style={{
          backgroundColor: '#0f1e2e',
          borderColor: '#1e2f42'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p 
            className="text-sm"
            style={{
              color: '#8a99ab'
            }}
          >
            © {new Date().getFullYear()} SmartLenderUp. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Debug Permissions Tool */}
      <DebugPermissions />
    </div>
  );
}

export default function App() {
  // Initialize global numeric input enhancement
  React.useEffect(() => {
    const cleanup = initializeGlobalNumericInputs();
    return cleanup;
  }, []);

  // Suppress known Recharts duplicate key warnings (harmless library issue)
  React.useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      // Filter out Recharts duplicate key warnings
      const stringifiedArgs = args.join(' ');
      if (
        stringifiedArgs.includes('Encountered two children with the same key') ||
        stringifiedArgs.includes('Warning: Encountered two children')
      ) {
        return; // Suppress
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      // Filter out Recharts duplicate key warnings
      const stringifiedArgs = args.join(' ');
      if (
        stringifiedArgs.includes('Encountered two children with the same key') ||
        stringifiedArgs.includes('Warning: Encountered two children')
      ) {
        return; // Suppress
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <ErrorBoundary>
      <FaviconSetter />
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <NavigationProvider>
              <PermissionsProvider>
                <AppContent />
                <Toaster position="top-right" theme="dark" richColors />
                <DatabaseSetupNotice />
                {/* DatabaseErrorOverlay disabled - database is properly configured */}
                {/* <DatabaseErrorOverlay /> */}
                <DatabaseErrorHandler />
                <DatabaseErrorHelper />
                <AutoDuplicateFix />
                <AutoFixProgress />
              </PermissionsProvider>
            </NavigationProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}