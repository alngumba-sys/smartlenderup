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
  Copy 
} from 'lucide-react';
import { runComprehensiveCleanup } from '../utils/databaseCleanup';
import { getStorageUsage, cleanupAllAutoBackups } from '../utils/storageManager';
import { getOrganizationName, getCountryDemonym, getOrganizationLogo } from '../utils/organizationUtils';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { BV_FUNGUO_LOGO } from '../assets/BVFunguoLogo';
// Disabled temporarily to debug loading issues
// import '../utils/devMigrationTools'; // Import developer migration tools for data updates

function AppContent() {
  const { currentUser, isAuthenticated, isLoading, logout, login } = useAuth();
  const [currentPlatform, setCurrentPlatform] = useState<string | null>('smartlenderup'); // Start directly with SmartLenderUp
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);
  const [portalView, setPortalView] = useState<'staff' | 'client'>('staff');
  const [selectedClientId, setSelectedClientId] = useState('CL001'); // Default client ID
  const [openHeaderDropdown, setOpenHeaderDropdown] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<'share' | 'social-media' | string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [triggerTab, setTriggerTab] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentTheme, isDark } = useTheme();
  
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
    console.log('🔍 App State:', { isAuthenticated, isLoading, currentUser });
  }, [isAuthenticated, isLoading, currentUser]);

  // Run database cleanup on app load (only once)
  useEffect(() => {
    let hasRunCleanup = false;
    
    const performCleanup = async () => {
      if (hasRunCleanup || !isAuthenticated) return;
      
      hasRunCleanup = true;
      
      try {
        const orgData = localStorage.getItem('current_organization');
        const orgId = orgData ? JSON.parse(orgData)?.id : null;
        
        // ❌ DISABLED: Automatic cleanup was deleting loan products with non-UUID IDs (like "PRD1234567890")
        // This cleanup should only be run manually when needed via window.cleanupDatabase()
        // console.log('🚀 Running automatic database cleanup...');
        // await runComprehensiveCleanup(orgId);
        // console.log('✅ Automatic cleanup complete');
      } catch (error) {
        console.error('Error during automatic cleanup:', error);
      }
    };
    
    // Run cleanup after a short delay to allow other initialization to complete
    // ❌ DISABLED: Comment out automatic cleanup to prevent deletion of loan products
    // const timeoutId = setTimeout(performCleanup, 2000);
    
    // return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      console.log(`📦 Total backups: ${usage.backupCount}`);
      console.log(`💼 Backup size: ${(usage.backupSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log('================================');
      return usage;
    };
    
    (window as any).cleanupBackups = () => {
      const count = cleanupAllAutoBackups();
      console.log(`✅ Cleaned up ${count} auto backups`);
      return count;
    };
    
    console.log('💡 Debug ready! Type: window.debugOrgs()');
    console.log('💡 Manual cleanup: window.cleanupDatabase()');
    console.log('💡 Check storage: window.checkStorage()');
    console.log('💡 Clean backups: window.cleanupBackups()');
    console.log('💡 Go to register: window.location.href = "/register"');
  }, []);

  const handleLogin = (userType: 'admin' | 'employee', userData: any) => {
    login(userData);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('bv_funguo_credentials');
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

  // Show landing page if no platform selected
  if (!currentPlatform) {
    return <MotherCompanyHome onSelectPlatform={setCurrentPlatform} />;
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onBack={() => setCurrentPlatform(null)}
        onGoToRegister={handleGoToRegister}
        platformName={currentPlatform === 'smartlenderup' ? 'SmartLenderUp' : currentPlatform === 'scissorup' ? 'ScissorUp' : 'SalesUp'}
      />
    );
  }

  return (
    <div 
      className={`min-h-screen overflow-x-hidden transition-colors ${isDark ? 'dark' : ''}`}
      style={{
        backgroundColor: isDark ? currentTheme.darkColors.appBackground : currentTheme.colors.appBackground
      }}
    >
      {/* Portal Selector */}
      <div 
        className="border-b px-2 sm:px-4 py-2 flex-shrink-0 transition-colors"
        style={{
          backgroundColor: '#0d1b2a',
          borderColor: '#1e2f42'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {organizationLogo && (
              <img 
                src={organizationLogo} 
                alt={organizationName} 
                className="h-6 sm:h-8 w-auto object-contain flex-shrink-0" 
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg truncate" style={{ 
                color: '#e1e8f0'
              }}>{organizationName}</h1>
              <p className="text-xs hidden sm:block truncate" style={{
                color: '#b8c5d6',
                opacity: 0.5,
                position: 'relative',
                zIndex: 10
              }}>
                Empowering {countryDemonym} Entrepreneurs
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
            {/* Supabase Sync Status - Hidden on mobile */}
            <div className="hidden md:block">
              <SupabaseSyncStatus />
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
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

            {/* User Info & Logout */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l" style={{
              borderColor: '#1e2f42'
            }}>
              <div className="text-right hidden sm:block">
                <p className="text-xs" style={{
                  color: '#b8c5d6',
                  fontWeight: 'bold'
                }}>
                  {currentUser?.role}
                </p>
                <p className="text-xs" style={{
                  color: '#b8c5d6',
                  opacity: 0.8
                }}>
                  {currentUser?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#1a2942',
                  color: '#e1e8f0'
                }}
                title="Logout"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <NavigationProvider>
              <AppContent />
              <Toaster position="top-right" theme="dark" richColors />
              <DatabaseSetupNotice />
              {/* DatabaseErrorOverlay disabled - database is properly configured */}
              {/* <DatabaseErrorOverlay /> */}
            </NavigationProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}