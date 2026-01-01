import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, DollarSign, TrendingUp, BarChart3, Bell, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function FeaturesCarousel() {
  const { currentTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const features: Feature[] = [
    {
      icon: <Users className="size-12" />,
      title: 'Client Management',
      description: 'Comprehensive client profiles with complete transaction history, documents, and communication logs. Track client relationships and manage multiple accounts effortlessly.',
      color: currentTheme.colors.success
    },
    {
      icon: <DollarSign className="size-12" />,
      title: 'Loan Portfolio',
      description: 'Automated loan origination, approval workflows, and disbursement tracking. Real-time monitoring of repayments, arrears, and portfolio quality with M-Pesa integration.',
      color: currentTheme.colors.info
    },
    {
      icon: <TrendingUp className="size-12" />,
      title: 'Savings Accounts',
      description: 'Multiple savings products with automated interest calculations. Fixed deposits, recurring deposits, and goal-based savings with complete audit trails.',
      color: currentTheme.colors.secondary
    },
    {
      icon: <BarChart3 className="size-12" />,
      title: 'Analytics & Reports',
      description: 'Real-time dashboards with key performance indicators. Generate regulatory reports, portfolio analysis, and financial statements with one click.',
      color: currentTheme.colors.warning
    },
    {
      icon: <Bell className="size-12" />,
      title: 'Smart Notifications',
      description: 'Automated SMS and email alerts for due payments, approvals, and important events. Keep clients and staff informed in real-time.',
      color: currentTheme.colors.accent
    },
    {
      icon: <Shield className="size-12" />,
      title: 'Security & Compliance',
      description: 'Bank-level encryption, role-based access control, and complete audit logs. Built-in compliance with CBK regulations and GDPR standards.',
      color: currentTheme.colors.danger
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative rounded-xl border p-8 min-h-[280px]" style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }}>
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:scale-110 z-10"
          style={{
            backgroundColor: currentTheme.colors.hover,
            color: currentTheme.colors.text
          }}
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:scale-110 z-10"
          style={{
            backgroundColor: currentTheme.colors.hover,
            color: currentTheme.colors.text
          }}
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Feature Content */}
        <div className="px-12 text-center">
          <div className="flex justify-center mb-6">
            <div 
              className="p-4 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: features[currentIndex].color + '20',
                color: features[currentIndex].color
              }}
            >
              {features[currentIndex].icon}
            </div>
          </div>

          <h3 
            className="text-2xl font-semibold mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            {features[currentIndex].title}
          </h3>

          <p 
            className="text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {features[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: currentIndex === index ? '32px' : '8px',
              height: '8px',
              backgroundColor: currentIndex === index 
                ? currentTheme.colors.primary 
                : currentTheme.colors.border
            }}
          />
        ))}
      </div>
    </div>
  );
}
