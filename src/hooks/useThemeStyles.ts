import { useTheme } from '../contexts/ThemeContext';

export function useThemeStyles() {
  const { isDark, currentTheme } = useTheme();

  return {
    isDark,
    // Page background
    pageBackground: isDark ? currentTheme.darkColors.background : '#F5FFFA',
    
    // Card styles
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    cardHover: isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
    
    // Text colors
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-500',
    
    // Input styles
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    inputFocus: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
    
    // Table styles
    tableHeader: isDark ? 'bg-gray-700' : 'bg-gray-50',
    tableRow: isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50',
    tableText: isDark ? 'text-gray-300' : 'text-gray-900',
    
    // Button styles
    buttonPrimary: isDark 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
    
    // Border colors
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderLight: isDark ? 'border-gray-800' : 'border-gray-100',
    
    // Modal/Dropdown
    modal: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    modalOverlay: 'bg-black bg-opacity-50',
    
    // Divider
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    
    // Badges/Tags
    badge: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    
    // Success/Warning/Danger (keep vibrant in both modes)
    success: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-200',
    danger: isDark ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-800 border-red-200',
    info: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200',
    
    // Chart backgrounds
    chartBackground: isDark ? '#1e293b' : '#ffffff',
    chartGrid: isDark ? '#374151' : '#e5e7eb',
    chartText: isDark ? '#9ca3af' : '#6b7280',
  };
}
