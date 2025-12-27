import { useState, useRef, useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { MessageSquare, Bell, Users, LogOut, ChevronDown, ChevronRight, Eye, Edit, Share2, FolderInput, Copy, Trash2, Mail, Link2, Facebook, Twitter, Instagram } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { InternalStaffPortal } from './components/InternalStaffPortal';
import { ClientPortal } from './components/ClientPortal';
import { LoginPage } from './components/LoginPage';
import { MotherCompanyHome } from './components/MotherCompanyHome';
import { ThemeToggle } from './components/ThemeToggle';
import { PaymentCalendar } from './components/PaymentCalendar';
import { SupabaseSyncStatus } from './components/SupabaseSyncStatus';
import { MainNavigation } from './components/MainNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import abcLogo from 'figma:asset/09c4fb0bee355dd36ef162b16888a598745d0152.png';
import './utils/clearLocalStorage'; // Import to register window.clearAppData function
import './utils/resetDatabase'; // Import to register window.resetDatabase function
import './utils/populateSampleData'; // Import to register window.populateSampleData function
// import './utils/clearDummyData'; // One-time clear of all dummy data - DISABLED to prevent reload loops
import './utils/clearShareholdersAndBanks'; // Import to register window.clearShareholdersAndBanks function
import './utils/migrateToSupabase'; // Import to register window.migrateToSupabase function
import './utils/syncOrganizationToSupabase'; // Import to register window.syncOrganization function
import './utils/debugOrganizations'; // Import to register window.debugOrgs function
import './utils/fixLocalStorage'; // Import to register window.fixLocalStorage function
import './utils/updateOrganizationPassword'; // Import to register window.updateOrgPassword function
import './utils/addTrialColumns'; // Import to register window.addTrialColumns function
import './utils/showTrialMigrationHelp'; // Import to show trial setup help
// import './utils/clearCurrentShareholders'; // Auto-clear current shareholders - DISABLED to preserve data
import { getOrganizationName, getCountryDemonym, getOrganizationLogo } from './utils/organizationUtils';

function AppContent() {
  const { currentUser, isAuthenticated, isLoading, logout, login } = useAuth();
  const [currentPlatform, setCurrentPlatform] = useState<string | null>('smartlenderup');
  const [portalView, setPortalView] = useState<'staff' | 'client'>('staff');
  const [selectedClientId, setSelectedClientId] = useState('CL-001'); // Default to Wanjiru Kamau
  const [openHeaderDropdown, setOpenHeaderDropdown] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [triggerTab, setTriggerTab] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentTheme, isDark } = useTheme();
  
  const organizationName = getOrganizationName();
  const countryDemonym = getCountryDemonym();
  const organizationLogo = getOrganizationLogo();

  // Debug logging
  useEffect(() => {
    console.log('🔍 App State:', { isAuthenticated, isLoading, currentUser });
  }, [isAuthenticated, isLoading, currentUser]);

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
    console.log('💡 Debug ready! Type: window.debugOrgs()');
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onBack={() => setCurrentPlatform(null)}
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
        className="border-b px-4 py-2 flex-shrink-0 transition-colors"
        style={{
          backgroundColor: '#0d1b2a',
          borderColor: '#1e2f42'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {organizationLogo && (
              <img 
                src={organizationLogo} 
                alt={organizationName} 
                className="h-14 w-auto object-contain" 
              />
            )}
            <div>
              <h1 style={{ 
                color: '#e1e8f0'
              }}>{organizationName}</h1>
              <p className="text-sm" style={{
                color: '#b8c5d6',
                opacity: 0.5,
                position: 'relative',
                zIndex: 10
              }}>
                Empowering {countryDemonym} Entrepreneurs
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Supabase Sync Status */}
            <SupabaseSyncStatus />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Payment Calendar */}
            <PaymentCalendar />
            
            {/* Header Icon Menus Container */}
            <div ref={headerRef} className="flex gap-2">
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
            </NavigationProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}