import { ArrowRight, Sparkles, Scissors, DollarSign, TrendingUp, ChevronDown, Search, MessageCircle, Plus, Minus, Calendar, Users, Award, Share2, Copy, Check, Download, X, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
const consortiumLogo = '/logo.svg'; // Replaced figma:asset for deployment
const scissorUpLogo = '/logo.svg'; // Replaced figma:asset for deployment
const smartLenderUpLogo = '/logo.svg'; // Replaced figma:asset for deployment
const salesUpLogo = '/logo.svg'; // Replaced figma:asset for deployment

interface Platform {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  icon: any;
  color: string;
  gradient: string;
}

interface MotherCompanyHomeProps {
  onSelectPlatform: (platformId: string) => void;
}

// Live activity feed data
const activities = [
  { name: 'Sarah K.', action: 'signed up for', platform: 'ScissorUp', location: 'Nairobi', time: '2m ago' },
  { name: 'James M.', action: 'started a trial on', platform: 'SmartLenderUp', location: 'Mombasa', time: '5m ago' },
  { name: 'Grace N.', action: 'joined', platform: 'SalesUp', location: 'Kisumu', time: '8m ago' },
  { name: 'David O.', action: 'signed up for', platform: 'ScissorUp', location: 'Eldoret', time: '12m ago' },
  { name: 'Lucy W.', action: 'started a trial on', platform: 'SmartLenderUp', location: 'Nakuru', time: '15m ago' },
  { name: 'Peter K.', action: 'joined', platform: 'SalesUp', location: 'Thika', time: '18m ago' },
];

// Success stories - multiple sets to rotate through
const successStorySets = [
  [
    {
      icon: DollarSign,
      color: '#00693E',
      name: 'Mary Achieng',
      title: 'Small Business Owner',
      location: 'Kisumu',
      story: 'As a solo entrepreneur running a small lending business, SmartLenderUp helped me track my loans professionally. I went from Excel sheets to a proper system and grew my client base by <span style="color: #00693E; font-weight: bold;">120%</span> in 4 months.',
      author: '— Mary Achieng, Entrepreneur'
    },
    {
      icon: Scissors,
      color: '#d15746',
      name: 'Glam Studio',
      title: 'Beauty Salon',
      location: 'Westlands, Nairobi',
      story: 'ScissorUp transformed how we manage appointments and inventory. Our no-show rate dropped by <span style="color: #d15746; font-weight: bold;">40%</span> and revenue increased by <span style="color: #d15746; font-weight: bold;">55%</span>.',
      author: '— Sarah Wanjiru, Salon Owner'
    },
    {
      icon: Award,
      color: '#6C3082',
      name: 'Tukuza Enterprises',
      title: 'Wholesale Distributor',
      location: 'Mombasa',
      story: 'With SalesUp\'s CRM and analytics, we identified our best customers and increased repeat purchases by <span style="color: #6C3082; font-weight: bold;">80%</span>. Sales tracking is now effortless.',
      author: '— David Kimani, Sales Director'
    }
  ],
  [
    {
      icon: DollarSign,
      color: '#00693E',
      name: 'John Mwangi',
      title: 'Chama Treasurer',
      location: 'Nakuru',
      story: 'Managing our chama\'s table banking was chaos before SmartLenderUp. Now I process member loans in minutes, not days. Our members love the <span style="color: #00693E; font-weight: bold;">instant</span> M-Pesa disbursements!',
      author: '— John Mwangi, Chama Treasurer'
    },
    {
      icon: Scissors,
      color: '#A52A2A',
      name: 'Bella\'s Hair Lounge',
      title: 'Hair Salon',
      location: 'Thika',
      story: 'ScissorUp\'s booking system changed everything. Clients book online anytime, and I reduced double-bookings to <span style="color: #A52A2A; font-weight: bold;">zero</span>. Revenue up <span style="color: #A52A2A; font-weight: bold;">45%</span>!',
      author: '— Bella Njeri, Salon Owner'
    },
    {
      icon: Award,
      color: '#6C3082',
      name: 'Nairobi Office Supplies',
      title: 'B2B Sales',
      location: 'Nairobi CBD',
      story: 'SalesUp helped us organize our customer database and automate follow-ups. We recovered <span style="color: #6C3082; font-weight: bold;">KES 800K</span> in unpaid invoices in just 2 months!',
      author: '— Grace Wambui, Sales Manager'
    }
  ],
  [
    {
      icon: DollarSign,
      color: '#00693E',
      name: 'Peter Omondi',
      title: 'Loan Officer',
      location: 'Eldoret',
      story: 'I run a personal lending service from my phone using SmartLenderUp. The AI credit scoring saves me hours of work, and I\'ve grown my portfolio to <span style="color: #00693E; font-weight: bold;">KES 1.2M</span> safely.',
      author: '— Peter Omondi, Loan Officer'
    },
    {
      icon: Scissors,
      color: '#A52A2A',
      name: 'Kings Barbershop',
      title: 'Barbershop',
      location: 'Ruaka',
      story: 'ScissorUp tracks all my barbers\' sales and commissions automatically. No more disputes! Customer loyalty program brought back <span style="color: #A52A2A; font-weight: bold;">30%</span> more regulars.',
      author: '— Kevin Otieno, Barbershop Owner'
    },
    {
      icon: Award,
      color: '#6C3082',
      name: 'Fresh Produce Ltd',
      title: 'Agricultural Sales',
      location: 'Kiambu',
      story: 'SalesUp\'s route planning and inventory alerts prevent wastage. We optimized deliveries and increased our profit margins by <span style="color: #6C3082; font-weight: bold;">35%</span> this season!',
      author: '— James Kariuki, Operations Head'
    }
  ],
  [
    {
      icon: DollarSign,
      color: '#00693E',
      name: 'Faith Wangari',
      title: 'Microfinance Agent',
      location: 'Nyeri',
      story: 'SmartLenderUp made me a professional lender overnight. The automated reminders and M-Pesa integration mean I get paid on time. My default rate dropped to just <span style="color: #00693E; font-weight: bold;">2%</span>!',
      author: '— Faith Wangari, MFI Agent'
    },
    {
      icon: Scissors,
      color: '#A52A2A',
      name: 'Elegance Spa',
      title: 'Beauty Spa',
      location: 'Karen, Nairobi',
      story: 'ScissorUp helps us manage packages, memberships, and product inventory seamlessly. Our repeat client rate jumped to <span style="color: #A52A2A; font-weight: bold;">75%</span> and staff love the commission tracking.',
      author: '— Anne Mutiso, Spa Manager'
    },
    {
      icon: Award,
      color: '#6C3082',
      name: 'Tech Solutions KE',
      title: 'IT Services',
      location: 'Mombasa Road',
      story: 'SalesUp transformed our B2B sales process. Pipeline visibility and automated quotes shortened our sales cycle by <span style="color: #6C3082; font-weight: bold;">50%</span>. We closed <span style="color: #6C3082; font-weight: bold;">3X</span> more deals!',
      author: '— Michael Njoroge, CEO'
    }
  ]
];

export function MotherCompanyHome({ onSelectPlatform }: MotherCompanyHomeProps) {
  const { currentTheme } = useTheme();
  const [showSticky, setShowSticky] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    loans: 0,
    appointments: 0,
    sales: 0
  });
  
  // Randomly select a success story set on mount
  const [currentStories] = useState(() => {
    const randomIndex = Math.floor(Math.random() * successStorySets.length);
    return successStorySets[randomIndex];
  });
  
  // Mouse trail effect state (#22)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trailColor, setTrailColor] = useState('#ec7347');
  const [showTrail, setShowTrail] = useState(false);
  
  // Referral link state (#14)
  const [showReferralCopy, setShowReferralCopy] = useState(false);
  
  // Resource download modal state (#19)
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [downloadEmail, setDownloadEmail] = useState('');
  
  // Limited slots per platform (#13)
  const [demoSlots] = useState({
    smartlenderup: Math.floor(Math.random() * 8) + 5, // 5-12 slots
    scissorup: Math.floor(Math.random() * 8) + 5,
    salesup: Math.floor(Math.random() * 8) + 5
  });
  
  // Dropdown states
  const [showPricingDropdown, setShowPricingDropdown] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ contact: '', notes: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Handle scroll for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (cardsRef.current) {
        const rect = cardsRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cycle through activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prevIndex) => (prevIndex + 1) % activities.length);
    }, 3000); // Change activity every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Animated stats counter (#1)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsInView) {
            setStatsInView(true);
            
            // Animate numbers
            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepDuration = duration / steps;
            
            // Random targets within specified limits
            const targets = { 
              loans: Math.floor(Math.random() * 200) + 1, // 1-200
              appointments: Math.floor(Math.random() * 230) + 1, // 1-230
              sales: Math.floor(Math.random() * 1300) + 1 // 1-1300
            };
            let currentStep = 0;
            
            const interval = setInterval(() => {
              currentStep++;
              const progress = currentStep / steps;
              
              setAnimatedStats({
                loans: Math.floor(targets.loans * progress),
                appointments: Math.floor(targets.appointments * progress),
                sales: Math.floor(targets.sales * progress)
              });
              
              if (currentStep >= steps) {
                clearInterval(interval);
                setAnimatedStats(targets);
              }
            }, stepDuration);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsInView]);

  // WhatsApp widget - show after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsApp(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle platform selection with animation
  const handlePlatformClick = (platformId: string) => {
    if (platformId === 'scissorup') {
      window.open('https://scissorup.com/', '_blank');
      return;
    }
    
    setSelectedPlatform(platformId);
    setTransitioning(true);
    
    setTimeout(() => {
      onSelectPlatform(platformId);
    }, 600);
  };

  const platforms: Platform[] = [
    {
      id: 'smartlenderup',
      name: 'SmartLenderUp',
      tagline: 'Transform your lending operations',
      description: 'A modern, end-to-end lending platform for small, growing, or niche credit providers with M-Pesa integration.',
      url: 'smartlenderup.com',
      icon: DollarSign,
      color: '#00693E', // Dark green for SmartLenderUp
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      id: 'scissorup',
      name: 'ScissorUp',
      tagline: 'Elevate your beauty business',
      description: 'Complete management solution for salons, barbershops, and beauty professionals to streamline operations.',
      url: 'scissorup.com',
      icon: Scissors,
      color: '#A52A2A', // Brown for ScissorUp
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      id: 'salesup',
      name: 'SalesUp',
      tagline: 'Supercharge your sales',
      description: 'Powerful sales management platform with analytics, CRM, and automation tools for growing businesses.',
      url: 'salesup.com',
      icon: TrendingUp,
      color: '#6C3082', // Purple for SalesUp
      gradient: 'from-blue-500 to-indigo-600'
    }
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: hoveredPlatform === 'smartlenderup' ? '#1a3a2e' :
                        hoveredPlatform === 'scissorup' ? '#1a2332' :
                        hoveredPlatform === 'salesup' ? '#2a1a3a' : '#3c1f1b',
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Flowing Arcs Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
        {/* Arc 1 - Top Right to Left Diagonal */}
        <svg 
          className="absolute" 
          style={{ 
            top: '-10%', 
            left: '0%', 
            width: '100%', 
            height: '50%' 
          }}
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 1200,200 Q 900,350 600,250 Q 300,150 0,400"
            stroke="#ec7347"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Arc 2 - Top Left Swooping Right */}
        <svg 
          className="absolute" 
          style={{ 
            top: '5%', 
            left: '0%', 
            width: '100%', 
            height: '40%' 
          }}
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 0,250 Q 400,100 800,250 Q 1000,320 1200,180"
            stroke="#ec7347"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        {/* Arc 3 - Middle Right to Left Wave */}
        <svg 
          className="absolute" 
          style={{ 
            top: '30%', 
            left: '0%', 
            width: '100%', 
            height: '40%' 
          }}
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 1200,150 Q 900,300 600,200 Q 300,100 0,350"
            stroke="#ec7347"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>

        {/* Arc 4 - Bottom Right Swooping Left */}
        <svg 
          className="absolute" 
          style={{ 
            bottom: '10%', 
            left: '0%', 
            width: '100%', 
            height: '35%' 
          }}
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 1200,150 Q 800,280 400,180 Q 200,100 0,250"
            stroke="#ec7347"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        {/* Arc 5 - Bottom Left Rising Right */}
        <svg 
          className="absolute" 
          style={{ 
            bottom: '-5%', 
            left: '0%', 
            width: '100%', 
            height: '30%' 
          }}
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 0,300 Q 300,150 600,220 Q 900,280 1200,100"
            stroke="#ec7347"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Arc 7 - Top Center Undulating */}
        <svg 
          className="absolute" 
          style={{ 
            top: '0%', 
            left: '0%', 
            width: '100%', 
            height: '25%' 
          }}
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 1200,100 Q 900,220 600,120 Q 300,40 0,180"
            stroke="#ec7347"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
        
        {/* Arc below nav - Diagonal Left Up to Right Down */}
        <svg 
          className="absolute" 
          style={{ 
            top: '80px', 
            left: '0%', 
            width: '100%', 
            height: '120px' 
          }}
          viewBox="0 0 1200 150"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 0,120 Q 300,40 600,90 Q 900,130 1200,50"
            stroke="#ec7347"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Blur Overlay when any dropdown or modal is open */}
      {(showPricingDropdown || showFeaturesDropdown || showAboutDropdown || showResourcesDropdown || showSearchModal) && (
        <div 
          className="fixed inset-0 z-40"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => {
            setShowPricingDropdown(false);
            setShowFeaturesDropdown(false);
            setShowAboutDropdown(false);
            setShowResourcesDropdown(false);
            setShowSearchModal(false);
          }}
        />
      )}
    
      {/* Platform Transition Overlay (Feature #17) */}
      {transitioning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: selectedPlatform === 'smartlenderup' ? '#00693E' :
                            selectedPlatform === 'salesup' ? '#6C3082' : '#3c1f1b',
            animation: 'fadeIn 0.6s ease-out'
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading {platforms.find(p => p.id === selectedPlatform)?.name}...</p>
          </div>
        </div>
      )}

      {/* Sticky Platform Selector (Feature #13) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: '#2d1612',
          borderTop: '2px solid #e8d1c9',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <span className="hidden sm:block" style={{ color: '#e8d1c9', fontSize: '12px', sm: '14px', fontWeight: 'bold' }}>Quick Access:</span>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform.id)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm"
                  style={{
                    backgroundColor: platform.color,
                    color: '#ffffff',
                    fontWeight: '600',
                    minWidth: '100px'
                  }}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed (Feature #12) - MOBILE RESPONSIVE */}
      <div
        className="hidden lg:block fixed left-4 lg:left-6 bottom-4 lg:bottom-6 z-30 overflow-hidden rounded-lg shadow-2xl"
        style={{
          backgroundColor: 'rgba(60, 31, 27, 0.7)',
          width: 'clamp(150px, 20vw, 200px)',
          border: '1px solid rgba(232, 209, 201, 0.2)'
        }}
      >
        <div
          className="px-3 py-2 border-b"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(232, 209, 201, 0.2)'
          }}
        >
          <p style={{ color: '#e8d1c9', fontSize: '10px', fontWeight: 'bold' }}>
            🔴 Live Activity
          </p>
        </div>
        <div className="px-3 py-1 relative" style={{ height: '60px' }}>
          {activities.map((activity, index) => {
            const currentActivity = activities[currentActivityIndex];
            return index === currentActivityIndex ? (
              <div
                key={index}
                className="py-2 absolute inset-0 px-3 flex flex-col justify-center transition-opacity duration-500"
                style={{
                  opacity: 1
                }}
              >
                <p style={{ color: '#e8d1c9', fontSize: '9px', fontWeight: '600' }}>
                  <span style={{ fontWeight: 'bold' }}>{currentActivity.name}</span> {currentActivity.action}{' '}
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: currentActivity.platform === 'SmartLenderUp' ? '#00693E' :
                             currentActivity.platform === 'ScissorUp' ? '#A52A2A' : '#6C3082'
                    }}
                  >
                    {currentActivity.platform}
                  </span>
                </p>
                <p style={{ color: '#e8d1c9', fontSize: '8px', marginTop: '4px', fontWeight: '600', opacity: 0.7 }}>
                  {currentActivity.location} • {currentActivity.time}
                </p>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Header */}
      <header 
        className="border-b"
        style={{
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <img 
                src={consortiumLogo} 
                alt="3consortium" 
                className="h-auto"
                style={{ width: '40px' }}
              />
            </div>
            
            {/* Center - Navigation links */}
            <nav className="flex items-center gap-8">
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowAboutDropdown(!showAboutDropdown);
                    setShowFeaturesDropdown(false);
                    setShowPricingDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: '#e8d1c9', fontSize: '14px' }}
                >
                  About
                  <ChevronDown className="size-4" />
                </button>
                
                {/* About Dropdown */}
                {showAboutDropdown && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ 
                      backgroundColor: '#2d1612',
                      border: '2px solid #ec7347',
                      width: '320px',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    <div className="p-6">
                      <h3 
                        className="text-center mb-4"
                        style={{ color: '#e8d1c9', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        About 3consortium
                      </h3>
                      
                      <div className="space-y-4">
                        <a 
                          href="#mission"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowAboutDropdown(false)}
                        >
                          <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            Our Mission
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                            Empowering African businesses with innovative solutions
                          </div>
                        </a>
                        
                        <a 
                          href="#story"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowAboutDropdown(false)}
                        >
                          <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            Our Story
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                            Born in Kenya, serving businesses across Africa
                          </div>
                        </a>
                        
                        <a 
                          href="#team"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowAboutDropdown(false)}
                        >
                          <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            Our Team
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                            Meet the people building your success
                          </div>
                        </a>
                        
                        <a 
                          href="#contact"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowAboutDropdown(false)}
                        >
                          <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            Contact Us
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                            Get in touch with our team
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowFeaturesDropdown(!showFeaturesDropdown);
                    setShowAboutDropdown(false);
                    setShowPricingDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: '#e8d1c9', fontSize: '14px' }}
                >
                  Features
                  <ChevronDown className="size-4" />
                </button>
                
                {/* Features Dropdown */}
                {showFeaturesDropdown && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ 
                      backgroundColor: '#2d1612',
                      border: '2px solid #ec7347',
                      width: '450px',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    <div className="p-6">
                      <h3 
                        className="text-center mb-4"
                        style={{ color: '#e8d1c9', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        Platform Features
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(0, 105, 62, 0.1)', border: '1px solid #00693E' }}
                        >
                          <DollarSign className="size-5 mb-2" style={{ color: '#00693E' }} />
                          <div style={{ color: '#e8d1c9', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Lending
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>
                            M-Pesa integration, AI scoring
                          </div>
                        </div>
                        
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(165, 42, 42, 0.1)', border: '1px solid #A52A2A' }}
                        >
                          <Scissors className="size-5 mb-2" style={{ color: '#A52A2A' }} />
                          <div style={{ color: '#e8d1c9', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Beauty
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>
                            Bookings, inventory, staff
                          </div>
                        </div>
                        
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(108, 48, 130, 0.1)', border: '1px solid #6C3082' }}
                        >
                          <TrendingUp className="size-5 mb-2" style={{ color: '#6C3082' }} />
                          <div style={{ color: '#e8d1c9', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Sales
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>
                            CRM, analytics, automation
                          </div>
                        </div>
                        
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)', border: '1px solid #ec7347' }}
                        >
                          <Sparkles className="size-5 mb-2" style={{ color: '#ec7347' }} />
                          <div style={{ color: '#e8d1c9', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            AI-Powered
                          </div>
                          <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>
                            Smart insights & predictions
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(236, 115, 71, 0.3)' }}>
                        <a 
                          href="#all-features"
                          className="block text-center py-2 rounded-lg transition-all hover:bg-opacity-10 hover:bg-white"
                          style={{ color: '#ec7347', fontSize: '13px', fontWeight: '600' }}
                          onClick={() => setShowFeaturesDropdown(false)}
                        >
                          View All Features →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowPricingDropdown(!showPricingDropdown);
                    setShowAboutDropdown(false);
                    setShowFeaturesDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: '#e8d1c9', fontSize: '14px' }}
                >
                  Pricing
                  <ChevronDown className="size-4" />
                </button>
                
                {/* Pricing Dropdown */}
                {showPricingDropdown && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ 
                      backgroundColor: '#2d1612',
                      border: '2px solid #ec7347',
                      width: '600px',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    <div className="p-6">
                      <h3 
                        className="text-center mb-6"
                        style={{ color: '#e8d1c9', fontSize: '20px', fontWeight: 'bold' }}
                      >
                        Platform Pricing
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* SmartLenderUp Pricing */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ 
                            backgroundColor: 'rgba(0, 105, 62, 0.1)',
                            border: '1px solid #00693E'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="size-5" style={{ color: '#00693E' }} />
                            <h4 style={{ color: '#e8d1c9', fontSize: '14px', fontWeight: 'bold' }}>SmartLenderUp</h4>
                          </div>
                          <div className="mb-3">
                            <div style={{ color: '#00693E', fontSize: '24px', fontWeight: 'bold' }}>KES 2,500</div>
                            <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>per month</div>
                          </div>
                          <ul className="space-y-2 mb-4">
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Up to 100 loans</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ M-Pesa integration</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ AI credit scoring</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ SMS notifications</li>
                          </ul>
                          <button 
                            className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ 
                              backgroundColor: '#00693E', 
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onClick={() => handlePlatformClick('smartlenderup')}
                          >
                            Start Free Trial
                          </button>
                        </div>
                        
                        {/* ScissorUp Pricing */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ 
                            backgroundColor: 'rgba(165, 42, 42, 0.1)',
                            border: '1px solid #A52A2A'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Scissors className="size-5" style={{ color: '#A52A2A' }} />
                            <h4 style={{ color: '#e8d1c9', fontSize: '14px', fontWeight: 'bold' }}>ScissorUp</h4>
                          </div>
                          <div className="mb-3">
                            <div style={{ color: '#A52A2A', fontSize: '24px', fontWeight: 'bold' }}>KES 1,800</div>
                            <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>per month</div>
                          </div>
                          <ul className="space-y-2 mb-4">
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Unlimited bookings</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Client management</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Inventory tracking</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Staff commissions</li>
                          </ul>
                          <button 
                            className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ 
                              backgroundColor: '#A52A2A', 
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onClick={() => window.open('https://scissorup.com/', '_blank')}
                          >
                            Visit Website
                          </button>
                        </div>
                        
                        {/* SalesUp Pricing */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ 
                            backgroundColor: 'rgba(108, 48, 130, 0.1)',
                            border: '1px solid #6C3082'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="size-5" style={{ color: '#6C3082' }} />
                            <h4 style={{ color: '#e8d1c9', fontSize: '14px', fontWeight: 'bold' }}>SalesUp</h4>
                          </div>
                          <div className="mb-3">
                            <div style={{ color: '#6C3082', fontSize: '24px', fontWeight: 'bold' }}>KES 3,200</div>
                            <div style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>per month</div>
                          </div>
                          <ul className="space-y-2 mb-4">
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Complete CRM</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Sales analytics</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Pipeline management</li>
                            <li style={{ color: '#e8d1c9', fontSize: '11px' }}>✓ Team collaboration</li>
                          </ul>
                          <button 
                            className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ 
                              backgroundColor: '#6C3082', 
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onClick={() => handlePlatformClick('salesup')}
                          >
                            Start Free Trial
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <p style={{ color: '#e8d1c9', fontSize: '11px', opacity: 0.7 }}>All plans include 14-day free trial • No credit card required</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowResourcesDropdown(!showResourcesDropdown);
                    setShowAboutDropdown(false);
                    setShowFeaturesDropdown(false);
                    setShowPricingDropdown(false);
                  }}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: '#e8d1c9', fontSize: '14px' }}
                >
                  Resources
                  <ChevronDown className="size-4" />
                </button>
                
                {/* Resources Dropdown */}
                {showResourcesDropdown && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ 
                      backgroundColor: '#2d1612',
                      border: '2px solid #ec7347',
                      width: '380px',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    <div className="p-6">
                      <h3 
                        className="text-center mb-4"
                        style={{ color: '#e8d1c9', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        Resources & Support
                      </h3>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            setShowResourceModal(true);
                            setShowResourcesDropdown(false);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="size-5" style={{ color: '#ec7347' }} />
                            <div>
                              <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                Download Guides
                              </div>
                              <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                                Platform setup guides & tutorials
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        <a 
                          href="https://wa.me/254712207911?text=Hi!%20I%20need%20support%20with%203consortium"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowResourcesDropdown(false)}
                        >
                          <div className="flex items-center gap-3">
                            <MessageCircle className="size-5" style={{ color: '#00693E' }} />
                            <div>
                              <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                24/7 WhatsApp Support
                              </div>
                              <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                                Get instant help from our team
                              </div>
                            </div>
                          </div>
                        </a>
                        
                        <a 
                          href="#faq"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowResourcesDropdown(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="size-5" style={{ color: '#6C3082' }} />
                            <div>
                              <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                Help Center & FAQs
                              </div>
                              <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                                Find answers to common questions
                              </div>
                            </div>
                          </div>
                        </a>
                        
                        <a 
                          href="#community"
                          className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all"
                          onClick={() => setShowResourcesDropdown(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="size-5" style={{ color: '#A52A2A' }} />
                            <div>
                              <div style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                Community Forum
                              </div>
                              <div style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.8 }}>
                                Connect with other users
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
            
            {/* Right side - Search, Free trial, Login */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowSearchModal(true)}
                className="hover:opacity-70 transition-opacity p-2"
                style={{ color: '#e8d1c9' }}
                aria-label="Search"
              >
                <Search className="size-5" />
              </button>
              
              {/* Sign Up Button - Mobile Friendly */}
              <button
                onClick={() => handlePlatformClick('smartlenderup')}
                className="px-3 sm:px-5 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 text-xs sm:text-sm"
                style={{
                  backgroundColor: '#ec7347',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                Sign Up
              </button>
              
              {/* Login Button - Mobile Friendly */}
              <button
                onClick={() => handlePlatformClick('smartlenderup')}
                className="px-3 sm:px-5 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-20 hover:bg-white active:scale-95 text-xs sm:text-sm"
                style={{
                  border: '1px solid #ec7347',
                  color: '#ec7347',
                  fontWeight: '600'
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - MOBILE RESPONSIVE */}
      <section className="pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          {/* New tagline with Bentham font - RESPONSIVE */}
          <div className="mb-6 sm:mb-8"
            style={{ 
              fontFamily: 'Bentham, serif',
              lineHeight: '1.1'
            }}
          >
            <span className="block sm:inline" style={{ color: '#ec7347', fontSize: 'clamp(32px, 10vw, 72px)' }}>Cutting-edge</span>
            {' '}
            <span className="block sm:inline" style={{ color: '#e8d1c9', fontSize: 'clamp(32px, 10vw, 72px)' }}>platforms tailored</span>
            <br className="hidden sm:block" />
            <span className="block sm:inline" style={{ color: '#e8d1c9', fontSize: 'clamp(32px, 10vw, 72px)' }}>to</span>
            {' '}
            <span className="block sm:inline" style={{ color: '#ec7347', fontSize: 'clamp(32px, 10vw, 72px)' }}>transform your operations</span>
          </div>
        </div>
      </section>

      {/* Platforms Grid - MOBILE RESPONSIVE */}
      <section className="pb-12 sm:pb-20 px-4 sm:px-6 -mt-8 sm:-mt-16" ref={cardsRef}>
        <div className="mx-auto w-full max-w-[856.8px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-1">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              // Define background colors for each platform
              const bgColors: { [key: string]: string } = {
                smartlenderup: '#e8d1c9',
                scissorup: '#e8d1c9',
                salesup: '#e8d1c9'
              };
              
              return (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform.id)}
                  onMouseEnter={() => setHoveredPlatform(platform.id)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-2xl sm:hover:scale-105 active:scale-95"
                  style={{
                    borderColor: '#ffffff',
                    transform: window.innerWidth < 1024 ? 'scale(1)' : 'scale(0.81)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)',
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    minHeight: '250px'
                  }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Dimming Overlay when Preview is Shown */}
                  <div 
                    className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                  />

                  {/* Platform Preview on Hover (Feature #1) */}
                  <div 
                    className="absolute inset-x-0 bottom-0 rounded-t-xl overflow-hidden shadow-2xl transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20"
                    style={{
                      height: '200px',
                      backgroundColor: '#2d2d2d',
                      borderTop: `3px solid ${platform.color}`
                    }}
                  >
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: platform.color }}
                        />
                        <span style={{ fontSize: '11px', color: '#999', fontWeight: '600' }}>
                          Preview Dashboard
                        </span>
                      </div>
                      
                      {/* Mock Dashboard UI */}
                      <div className="flex-1 space-y-2">
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div 
                            className="rounded p-2"
                            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                          >
                            <div style={{ fontSize: '9px', color: '#999' }}>
                              {platform.id === 'smartlenderup' ? 'Active Loans' : 
                               platform.id === 'scissorup' ? 'Appointments' : 'Sales'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: platform.color }}>
                              {platform.id === 'smartlenderup' ? '234' : 
                               platform.id === 'scissorup' ? '48' : '1,234'}
                            </div>
                          </div>
                          <div 
                            className="rounded p-2"
                            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                          >
                            <div style={{ fontSize: '9px', color: '#999' }}>
                              {platform.id === 'smartlenderup' ? 'Portfolio' : 
                               platform.id === 'scissorup' ? 'Revenue' : 'Conversion'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: platform.color }}>
                              {platform.id === 'smartlenderup' ? 'KES 2.4M' : 
                               platform.id === 'scissorup' ? 'KES 124K' : '34%'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Mini chart representation */}
                        <div 
                          className={platform.id === 'scissorup' ? '' : 'rounded p-2'}
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', height: '60px' }}
                        >
                          {/* SmartLenderUp - Bar chart with growth trend */}
                          {platform.id === 'smartlenderup' && (
                            <div className="flex items-end justify-between h-full px-1">
                              {[30, 45, 50, 65, 70, 85, 95].map((height, i) => (
                                <div
                                  key={i}
                                  className="rounded-t transition-all duration-300"
                                  style={{
                                    width: '8px',
                                    height: `${height}%`,
                                    backgroundColor: platform.color,
                                    opacity: 0.7
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* ScissorUp - Line chart style */}
                          {platform.id === 'scissorup' && (
                            <div className="relative h-full">
                              <svg width="100%" height="100%" viewBox="0 0 150 60" preserveAspectRatio="none" className="overflow-visible">
                                <defs>
                                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={platform.color} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={platform.color} stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                {/* Area under line */}
                                <path
                                  d="M 0 40 C 6 32.5, 9 27.5, 12 25 C 18 30, 21 33, 24 35 C 30 25, 33 18, 36 15 C 42 17.5, 45 18.5, 48 20 C 54 15, 57 11.5, 60 10 C 66 7.5, 69 6, 72 5 C 78 6.5, 81 7, 84 8 C 90 10, 93 11, 96 12 C 102 9.5, 105 8, 108 7 C 114 8.5, 117 9, 120 10 C 126 8, 129 7, 132 6 C 141 5, 145.5 4.5, 150 4 L 150 60 L 0 60 Z"
                                  fill="url(#lineGradient)"
                                />
                                {/* Line */}
                                <path
                                  d="M 0 40 C 6 32.5, 9 27.5, 12 25 C 18 30, 21 33, 24 35 C 30 25, 33 18, 36 15 C 42 17.5, 45 18.5, 48 20 C 54 15, 57 11.5, 60 10 C 66 7.5, 69 6, 72 5 C 78 6.5, 81 7, 84 8 C 90 10, 93 11, 96 12 C 102 9.5, 105 8, 108 7 C 114 8.5, 117 9, 120 10 C 126 8, 129 7, 132 6 C 141 5, 145.5 4.5, 150 4"
                                  stroke={platform.color}
                                  strokeWidth="2.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {/* Data points */}
                                {[
                                  {x: 12, y: 25}, {x: 24, y: 35}, 
                                  {x: 36, y: 15}, {x: 48, y: 20}, {x: 60, y: 10}, {x: 72, y: 5},
                                  {x: 84, y: 8}, {x: 96, y: 12}, {x: 108, y: 7}, 
                                  {x: 120, y: 10}, {x: 132, y: 6}
                                ].map((point, i) => (
                                  <circle
                                    key={i}
                                    cx={point.x}
                                    cy={point.y}
                                    r="2.5"
                                    fill={platform.color}
                                  />
                                ))}
                              </svg>
                            </div>
                          )}
                          
                          {/* SalesUp - Stepped area chart */}
                          {platform.id === 'salesup' && (
                            <div className="relative h-full flex items-end justify-between px-1">
                              {[
                                {height: 45, width: 12}, 
                                {height: 70, width: 12}, 
                                {height: 55, width: 12}, 
                                {height: 85, width: 12}, 
                                {height: 65, width: 12}, 
                                {height: 90, width: 12}, 
                                {height: 95, width: 12}
                              ].map((bar, i) => (
                                <div
                                  key={i}
                                  className="rounded transition-all duration-300 relative"
                                  style={{
                                    width: `${bar.width}px`,
                                    height: `${bar.height}%`,
                                    background: `linear-gradient(to top, ${platform.color}, ${platform.color}80)`,
                                    opacity: 0.8
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center pt-2">
                        <span style={{ fontSize: '9px', color: '#888' }}>
                          Click to explore →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="relative">
                    {/* Logo Container - Fixed Height with Solid Background */}
                    <div 
                      className="flex items-center justify-center" 
                      style={{ 
                        height: '120px',
                        backgroundColor: '#e8d1c9',
                        borderRadius: '1rem 1rem 0 0'
                      }}
                    >
                    {platform.id === 'scissorup' && (
                      <img 
                        src={scissorUpLogo} 
                        alt="ScissorUp" 
                        className="h-auto"
                        style={{ width: '100%', maxWidth: '194px' }}
                      />
                    )}
                    
                    {platform.id === 'smartlenderup' && (
                      <img 
                        src={smartLenderUpLogo} 
                        alt="SmartLenderUp" 
                        className="h-auto"
                        style={{ width: '100%', maxWidth: '167px' }}
                      />
                    )}
                    
                    {platform.id === 'salesup' && (
                      <img 
                        src={salesUpLogo} 
                        alt="SalesUp" 
                        className="h-auto"
                        style={{ width: '100%', maxWidth: '82px' }}
                      />
                    )}
                    </div>

                    {/* Text Container */}
                    <div
                    style={{ padding: '18px', backgroundColor: 'rgba(232, 209, 201, 0.95)', borderRadius: '0 0 1rem 1rem' }}
                    onClick={(e) => {
                      if (platform.id === 'scissorup') {
                        e.stopPropagation();
                        window.open('https://scissorup.com/', '_blank');
                      }
                    }}
                  >
                    {/* Text Content */}
                    <p 
                      className="mb-3"
                       style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.788rem' }}
                    >
                      {platform.tagline}
                    </p>

                    <p 
                      className="leading-relaxed relative"
                      style={{ color: '#351e1a', fontSize: '0.788rem', zIndex: 10 }}
                    >
                      {platform.description}
                    </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW: Animated Stats Counter (#1) */}
      <section ref={statsRef} className="py-8 px-6" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-center mb-8"
            style={{ color: '#e4d2ca', fontSize: '23px', fontWeight: 'normal' }}
          >
            Real-Time Platform Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="size-8" style={{ color: '#ccfcb1' }} />
                <div 
                  style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: '#ccfcb1' 
                  }}
                >
                  {animatedStats.loans}
                </div>
              </div>
              <p style={{ color: '#e8d1c9', fontSize: '18px' }}>Active Loans Today</p>
              <p style={{ color: '#e8d1c9', fontSize: '14px', opacity: 0.7 }}>SmartLenderUp Platform</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="size-8" style={{ color: '#e4913c' }} />
                <div 
                  style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: '#e4913c' 
                  }}
                >
                  {animatedStats.appointments.toLocaleString()}
                </div>
              </div>
              <p style={{ color: '#e8d1c9', fontSize: '18px' }}>Appointments Booked</p>
              <p style={{ color: '#e8d1c9', fontSize: '14px', opacity: 0.7 }}>ScissorUp Platform</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="size-8" style={{ color: '#b18efb' }} />
                <div 
                  style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: '#b18efb' 
                  }}
                >
                  {animatedStats.sales.toLocaleString()}
                </div>
              </div>
              <p style={{ color: '#e8d1c9', fontSize: '18px' }}>Sales Recorded</p>
              <p style={{ color: '#e8d1c9', fontSize: '14px', opacity: 0.7 }}>SalesUp Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Success Stories (#12) */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-center mb-12"
            style={{ color: '#e8d1c9', fontSize: '32px', fontWeight: 'normal' }}
          >
            Success Stories Across the Continent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentStories.map((story, index) => {
              const StoryIcon = story.icon;
              return (
                <div 
                  key={index}
                  className="rounded-xl p-6"
                  style={{ 
                    backgroundColor: `${story.color}1A`,
                    border: `2px solid ${story.color}`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: story.color }}
                    >
                      <StoryIcon className="size-6" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h3 style={{ color: '#e8d1c9', fontSize: '18px', fontWeight: 'bold' }}>{story.name}</h3>
                      <p style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.7 }}>{story.location}</p>
                    </div>
                  </div>
                  <p 
                    style={{ color: '#e8d1c9', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}
                    dangerouslySetInnerHTML={{ __html: `"${story.story}"` }}
                  />
                  <p style={{ color: '#e8d1c9', fontSize: '12px', opacity: 0.7 }}>
                    {story.author}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW: FAQ Accordion (#22) */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-center mb-12"
            style={{ color: '#e8d1c9', fontSize: '32px', fontWeight: 'bold' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do I choose the right platform for my business?',
                a: 'Each platform is designed for specific industries: SmartLenderUp for lending/microfinance, ScissorUp for beauty businesses, and SalesUp for sales-driven companies. You can start a free trial on any platform to see which fits best.'
              },
              {
                q: 'Do all platforms integrate with M-Pesa?',
                a: 'Yes! All three platforms have seamless M-Pesa integration, making it easy to process payments from your customers anywhere in Kenya.'
              },
              {
                q: 'What kind of support do you provide?',
                a: 'We offer 24/7 customer support via WhatsApp, email, and phone. Each platform also includes onboarding training and video tutorials to get you started quickly.'
              },
              {
                q: 'Can I use multiple platforms if I have different businesses?',
                a: 'Absolutely! Many of our clients use multiple platforms. We offer bundle discounts for businesses using more than one 3consortium platform.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, we use bank-level encryption and secure cloud hosting. All data is backed up daily, and we comply with Kenyan data protection regulations.'
              },
              {
                q: 'What are the pricing options?',
                a: 'Each platform offers flexible monthly and annual plans. We also have special rates for startups and NGOs. Contact us for a customized quote based on your needs.'
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="rounded-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(232, 209, 201, 0.1)',
                  border: '1px solid rgba(232, 209, 201, 0.3)'
                }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 transition-all duration-200"
                  style={{ backgroundColor: openFAQ === index ? 'rgba(236, 115, 71, 0.2)' : 'transparent' }}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span style={{ color: '#e8d1c9', fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>
                    {faq.q}
                  </span>
                  {openFAQ === index ? (
                    <Minus className="size-5" style={{ color: '#ec7347' }} />
                  ) : (
                    <Plus className="size-5" style={{ color: '#ec7347' }} />
                  )}
                </button>
                {openFAQ === index && (
                  <div 
                    className="p-5 pt-0"
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    <p style={{ color: '#e8d1c9', fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Widget (#25) */}
      {showWhatsApp && (
        <a
          href="https://wa.me/254712207911?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%203consortium%20platforms"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 bottom-6 z-30 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: '#25D366',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}
          title="Chat with us on WhatsApp"
        >
          <MessageCircle className="size-5" style={{ color: '#ffffff' }} />
        </a>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 flex items-start justify-center pt-20 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSearchModal(false);
          }}
        >
          <div 
            className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl"
            style={{
              backgroundColor: '#2d1612',
              border: '2px solid #ec7347',
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: '#e8d1c9', fontSize: '24px', fontWeight: 'bold' }}>
                  Search
                </h3>
                <button 
                  onClick={() => setShowSearchModal(false)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="size-6" style={{ color: '#e8d1c9' }} />
                </button>
              </div>
              
              <div className="mb-6">
                <div 
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'rgba(236, 115, 71, 0.1)',
                    border: '2px solid #ec7347'
                  }}
                >
                  <Search className="size-5" style={{ color: '#ec7347' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for platforms, features, or resources..."
                    className="flex-1 bg-transparent outline-none"
                    style={{ 
                      color: '#e8d1c9',
                      fontSize: '16px'
                    }}
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    Quick Links
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: 'SmartLenderUp', icon: DollarSign, color: '#00693E', action: () => handlePlatformClick('smartlenderup') },
                      { name: 'ScissorUp', icon: Scissors, color: '#A52A2A', action: () => handlePlatformClick('scissorup') },
                      { name: 'SalesUp', icon: TrendingUp, color: '#6C3082', action: () => handlePlatformClick('salesup') }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            setShowSearchModal(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all text-left"
                        >
                          <Icon className="size-5" style={{ color: item.color }} />
                          <span style={{ color: '#e8d1c9', fontSize: '14px' }}>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: '#ec7347', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Pricing', 'M-Pesa Integration', 'Free Trial', 'Support', 'Features'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-4 py-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-all"
                        style={{
                          backgroundColor: 'rgba(236, 115, 71, 0.1)',
                          border: '1px solid #ec7347',
                          color: '#e8d1c9',
                          fontSize: '12px'
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logo and Tagline Section - Below Cards */}
      <section className="pb-20 px-6 -mt-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Call to Action Button */}
          <div className="mb-12 flex justify-center">
            <button
              className="group relative px-8 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: '#ec7347',
                color: '#ffffff',
                fontSize: '15.6px',
                fontWeight: '500'
              }}
              onClick={() => setShowContactModal(true)}
            >
              <span className="flex items-center gap-2">
                Let's work together
                <Sparkles className="size-4" />
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <img 
              src={consortiumLogo} 
              alt="3consortium" 
              className="h-auto"
              style={{ width: '180px' }}
            />
            <p 
              className="max-w-2xl"
              style={{ 
                color: '#e8d1c9',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
            >
              We provide cutting-edge technology platforms tailored to transform operations in microfinance, beauty services, and sales management. Just choose your industry.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t"
            style={{
              borderColor: '#e5e7eb'
            }}
          >
            <div className="flex items-center gap-3">
              <div>
                <p 
                  className="text-sm"
                  style={{ color: '#1f2937' }}
                >
                  3consortium
                </p>
                <p 
                  className="text-xs"
                  style={{ color: '#6b7280' }}
                >
                  A Consortium of Companies Delivering Intelligent Solutions
                </p>
                <p 
                  className="text-xs"
                  style={{ color: '#6b7280' }}
                >
                  © {new Date().getFullYear()} All rights reserved
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a 
                href="#" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#6b7280' }}
              >
                About Us
              </a>
              <a 
                href="#" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#6b7280' }}
              >
                Contact
              </a>
              <a 
                href="#" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#6b7280' }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => {
            setShowContactModal(false);
            setContactSubmitted(false);
            setContactForm({ contact: '', notes: '' });
          }}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{ backgroundColor: '#3c1f1b' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowContactModal(false);
                setContactSubmitted(false);
                setContactForm({ contact: '', notes: '' });
              }}
              className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ color: '#e8d1c9' }}
            >
              <X className="size-5" />
            </button>

            {!contactSubmitted ? (
              <>
                <h3 
                  className="mb-2"
                  style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    color: '#e8d1c9'
                  }}
                >
                  Let's Work Together
                </h3>
                <p 
                  className="mb-6"
                  style={{ 
                    fontSize: '14px',
                    color: '#e8d1c9',
                    opacity: 0.8
                  }}
                >
                  Send us a message and we'll get back to you soon!
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (contactForm.contact && contactForm.notes) {
                      // Here you would typically send the data to your backend
                      console.log('Contact form submitted:', contactForm);
                      setContactSubmitted(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label 
                      htmlFor="contact"
                      className="block mb-2"
                      style={{ 
                        fontSize: '14px',
                        color: '#e8d1c9',
                        fontWeight: '500'
                      }}
                    >
                      Phone Number / Email *
                    </label>
                    <input
                      id="contact"
                      type="text"
                      required
                      value={contactForm.contact}
                      onChange={(e) => setContactForm({ ...contactForm, contact: e.target.value })}
                      placeholder="e.g., +254712345678 or email@example.com"
                      className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                      style={{
                        backgroundColor: '#2a1210',
                        borderColor: '#e8d1c9',
                        color: '#e8d1c9',
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="notes"
                      className="block mb-2"
                      style={{ 
                        fontSize: '14px',
                        color: '#e8d1c9',
                        fontWeight: '500'
                      }}
                    >
                      Notes *
                    </label>
                    <textarea
                      id="notes"
                      required
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      placeholder="Tell us about your project or how we can help..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none resize-none"
                      style={{
                        backgroundColor: '#2a1210',
                        borderColor: '#e8d1c9',
                        color: '#e8d1c9',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      backgroundColor: '#ec7347',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#ec7347' }}
                >
                  <Check className="size-8" style={{ color: '#ffffff' }} />
                </div>
                <h3 
                  className="mb-2"
                  style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: '#e8d1c9'
                  }}
                >
                  Message Sent!
                </h3>
                <p 
                  style={{ 
                    fontSize: '14px',
                    color: '#e8d1c9',
                    opacity: 0.8
                  }}
                >
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}