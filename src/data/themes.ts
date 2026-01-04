// Theme Configuration for BV FUNGUO LTD Platform

export interface Theme {
  id: string;
  name: string;
  description: string;
  isCustomizable?: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    // Card specific colors
    cardBackground: string;
    cardText: string;
    cardTextSecondary: string;
    cardBorder: string;
    cardHover: string;
    // Chart colors (for data visualization)
    chartColors: string[];
    // Platform UI elements
    appBackground: string;
    sidebarBackground: string;
    sidebarText: string;
    sidebarTextActive: string;
    sidebarHover: string;
    menuBackground: string;
    menuText: string;
    menuHover: string;
    // Modal/Dialog colors
    modalBackground: string;
    modalOverlay: string;
    modalBorder: string;
    // Input field colors
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputFocus: string;
    // State colors
    hover: string;
    disabled: string;
    disabledText: string;
  };
  darkColors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    // Card specific colors
    cardBackground: string;
    cardText: string;
    cardTextSecondary: string;
    cardBorder: string;
    cardHover: string;
    // Chart colors (for data visualization)
    chartColors: string[];
    // Platform UI elements
    appBackground: string;
    sidebarBackground: string;
    sidebarText: string;
    sidebarTextActive: string;
    sidebarHover: string;
    menuBackground: string;
    menuText: string;
    menuHover: string;
    // Modal/Dialog colors
    modalBackground: string;
    modalOverlay: string;
    modalBorder: string;
    // Input field colors
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputFocus: string;
    // State colors
    hover: string;
    disabled: string;
    disabledText: string;
  };
  preview: {
    gradient: string;
  };
}

export const themes: Theme[] = [
  // Theme 1: Coral Reef
  {
    id: 'theme-1-light',
    name: 'Coral Reef',
    description: 'Vibrant coral and turquoise ocean-inspired colors',
    isCustomizable: false,
    colors: {
      primary: '#ff6b6b',
      primaryLight: '#ffe0e0',
      primaryDark: '#c92a2a',
      secondary: '#20c997',
      accent: '#ff8787',
      success: '#51cf66',
      warning: '#ffd43b',
      danger: '#ff6b6b',
      info: '#4dabf7',
      background: '#fff5f5',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#495057',
      border: '#ffc9c9',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#212529',
      cardTextSecondary: '#495057',
      cardBorder: '#ffc9c9',
      cardHover: '#fff5f5',
      // Chart colors
      chartColors: ['#ff6b6b', '#20c997', '#4dabf7', '#ffd43b', '#ff8787', '#51cf66', '#74c0fc', '#ffa8a8'],
      // Platform UI
      appBackground: '#f8f9fa',
      sidebarBackground: '#2b3035',
      sidebarText: '#ced4da',
      sidebarTextActive: '#ff8787',
      sidebarHover: '#495057',
      menuBackground: '#ffffff',
      menuText: '#212529',
      menuHover: '#fff5f5',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(0, 0, 0, 0.5)',
      modalBorder: '#ffc9c9',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#dee2e6',
      inputText: '#212529',
      inputFocus: '#ff6b6b',
      // States
      hover: '#fff5f5',
      disabled: '#e9ecef',
      disabledText: '#adb5bd'
    },
    darkColors: {
      primary: '#ff8787',
      primaryLight: '#862e2e',
      primaryDark: '#ffc9c9',
      secondary: '#3bc9a3',
      accent: '#ffa8a8',
      success: '#51cf66',
      warning: '#ffd43b',
      danger: '#ff8787',
      info: '#74c0fc',
      background: '#1a1b1e',
      surface: '#25262b',
      text: '#f8f9fa',
      textSecondary: '#adb5bd',
      border: '#495057',
      // Card specific colors
      cardBackground: '#25262b',
      cardText: '#f8f9fa',
      cardTextSecondary: '#adb5bd',
      cardBorder: '#495057',
      cardHover: '#2c2e33',
      // Chart colors
      chartColors: ['#ff8787', '#3bc9a3', '#74c0fc', '#ffd43b', '#ffa8a8', '#63e6be', '#a5d8ff', '#ffc078'],
      // Platform UI
      appBackground: '#0a1628',
      sidebarBackground: '#25262b',
      sidebarText: '#ced4da',
      sidebarTextActive: '#ff8787',
      sidebarHover: '#373a40',
      menuBackground: '#25262b',
      menuText: '#f8f9fa',
      menuHover: '#373a40',
      // Modal/Dialog
      modalBackground: '#25262b',
      modalOverlay: 'rgba(0, 0, 0, 0.75)',
      modalBorder: '#495057',
      // Input fields
      inputBackground: '#1a1b1e',
      inputBorder: '#495057',
      inputText: '#f8f9fa',
      inputFocus: '#ff8787',
      // States
      hover: '#373a40',
      disabled: '#495057',
      disabledText: '#6c757d'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #20c997 50%, #4dabf7 100%)'
    }
  },
  // Theme 2: Amethyst Night
  {
    id: 'theme-2-dark',
    name: 'Amethyst Night',
    description: 'Deep purple and violet luxury theme',
    isCustomizable: false,
    colors: {
      primary: '#9333ea',
      primaryLight: '#f3e8ff',
      primaryDark: '#6b21a8',
      secondary: '#a855f7',
      accent: '#d946ef',
      success: '#22c55e',
      warning: '#facc15',
      danger: '#ef4444',
      info: '#06b6d4',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#1e1b4b',
      cardTextSecondary: '#6b7280',
      cardBorder: '#e9d5ff',
      cardHover: '#faf5ff',
      // Chart colors
      chartColors: ['#9333ea', '#a855f7', '#d946ef', '#c084fc', '#e879f9', '#f0abfc', '#7c3aed', '#8b5cf6'],
      // Platform UI
      appBackground: '#f5f3ff',
      sidebarBackground: '#3b0764',
      sidebarText: '#e9d5ff',
      sidebarTextActive: '#c084fc',
      sidebarHover: '#581c87',
      menuBackground: '#ffffff',
      menuText: '#1e1b4b',
      menuHover: '#faf5ff',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(59, 7, 100, 0.5)',
      modalBorder: '#e9d5ff',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#ddd6fe',
      inputText: '#1e1b4b',
      inputFocus: '#9333ea',
      // States
      hover: '#faf5ff',
      disabled: '#f3e8ff',
      disabledText: '#a78bfa'
    },
    darkColors: {
      primary: '#c084fc',
      primaryLight: '#581c87',
      primaryDark: '#e9d5ff',
      secondary: '#d8b4fe',
      accent: '#f0abfc',
      success: '#4ade80',
      warning: '#fde047',
      danger: '#f87171',
      info: '#22d3ee',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#faf5ff',
      textSecondary: '#c4b5fd',
      border: '#4c1d95',
      // Card specific colors
      cardBackground: '#312e81',
      cardText: '#faf5ff',
      cardTextSecondary: '#c4b5fd',
      cardBorder: '#4c1d95',
      cardHover: '#3730a3',
      // Chart colors
      chartColors: ['#c084fc', '#d8b4fe', '#f0abfc', '#e9d5ff', '#e879f9', '#f5d0fe', '#a78bfa', '#ddd6fe'],
      // Platform UI
      appBackground: '#0f0a1e',
      sidebarBackground: '#312e81',
      sidebarText: '#e9d5ff',
      sidebarTextActive: '#c084fc',
      sidebarHover: '#4c1d95',
      menuBackground: '#312e81',
      menuText: '#faf5ff',
      menuHover: '#4c1d95',
      // Modal/Dialog
      modalBackground: '#312e81',
      modalOverlay: 'rgba(0, 0, 0, 0.85)',
      modalBorder: '#4c1d95',
      // Input fields
      inputBackground: '#1e1b4b',
      inputBorder: '#6b21a8',
      inputText: '#faf5ff',
      inputFocus: '#c084fc',
      // States
      hover: '#4c1d95',
      disabled: '#581c87',
      disabledText: '#7c3aed'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #9333ea 0%, #d946ef 50%, #a855f7 100%)'
    }
  },
  // Theme 3: Custom Business Theme
  {
    id: 'theme-3-custom',
    name: 'Theme 3: Business Pro',
    description: 'Professional business theme - Customizable',
    isCustomizable: true,
    colors: {
      primary: '#2563eb',
      primaryLight: '#dbeafe',
      primaryDark: '#1e40af',
      secondary: '#64748b',
      accent: '#7c3aed',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#0f172a',
      cardTextSecondary: '#64748b',
      cardBorder: '#e2e8f0',
      cardHover: '#f8fafc',
      // Chart colors
      chartColors: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#ec4899', '#84cc16'],
      // Platform UI
      appBackground: '#f1f5f9',
      sidebarBackground: '#1e293b',
      sidebarText: '#cbd5e1',
      sidebarTextActive: '#2563eb',
      sidebarHover: '#334155',
      menuBackground: '#ffffff',
      menuText: '#0f172a',
      menuHover: '#f1f5f9',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(15, 23, 42, 0.5)',
      modalBorder: '#e2e8f0',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#cbd5e1',
      inputText: '#0f172a',
      inputFocus: '#2563eb',
      // States
      hover: '#f1f5f9',
      disabled: '#e2e8f0',
      disabledText: '#94a3b8'
    },
    darkColors: {
      primary: '#3b82f6',
      primaryLight: '#1e3a8a',
      primaryDark: '#93c5fd',
      secondary: '#94a3b8',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      // Card specific colors
      cardBackground: '#1e293b',
      cardText: '#f1f5f9',
      cardTextSecondary: '#94a3b8',
      cardBorder: '#334155',
      cardHover: '#293548',
      // Chart colors
      chartColors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f472b6', '#a3e635'],
      // Platform UI
      appBackground: '#020617',
      sidebarBackground: '#1e293b',
      sidebarText: '#cbd5e1',
      sidebarTextActive: '#3b82f6',
      sidebarHover: '#334155',
      menuBackground: '#1e293b',
      menuText: '#f1f5f9',
      menuHover: '#334155',
      // Modal/Dialog
      modalBackground: '#1e293b',
      modalOverlay: 'rgba(0, 0, 0, 0.75)',
      modalBorder: '#334155',
      // Input fields
      inputBackground: '#0f172a',
      inputBorder: '#475569',
      inputText: '#f1f5f9',
      inputFocus: '#3b82f6',
      // States
      hover: '#334155',
      disabled: '#475569',
      disabledText: '#64748b'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
    }
  },
  // Theme 4: Colorful Vibrant Theme
  {
    id: 'theme-4-vibrant',
    name: 'Theme 4: Vibrant Colors',
    description: 'Bold and colorful theme - Fully customizable',
    isCustomizable: true,
    colors: {
      primary: '#ec4899',
      primaryLight: '#fce7f3',
      primaryDark: '#be185d',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      success: '#10b981',
      warning: '#f97316',
      danger: '#ef4444',
      info: '#06b6d4',
      background: '#fdf4ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#1f2937',
      cardTextSecondary: '#6b7280',
      cardBorder: '#f5d0fe',
      cardHover: '#fdf4ff',
      // Chart colors
      chartColors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#f97316', '#84cc16'],
      // Platform UI
      appBackground: '#faf5ff',
      sidebarBackground: '#831843',
      sidebarText: '#fce7f3',
      sidebarTextActive: '#f9a8d4',
      sidebarHover: '#9d174d',
      menuBackground: '#ffffff',
      menuText: '#1f2937',
      menuHover: '#fdf4ff',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(131, 24, 67, 0.5)',
      modalBorder: '#f5d0fe',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#e9d5ff',
      inputText: '#1f2937',
      inputFocus: '#ec4899',
      // States
      hover: '#fdf4ff',
      disabled: '#f3e8ff',
      disabledText: '#a78bfa'
    },
    darkColors: {
      primary: '#f472b6',
      primaryLight: '#831843',
      primaryDark: '#fbcfe8',
      secondary: '#a78bfa',
      accent: '#fbbf24',
      success: '#34d399',
      warning: '#fb923c',
      danger: '#f87171',
      info: '#22d3ee',
      background: '#18181b',
      surface: '#27272a',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
      // Card specific colors
      cardBackground: '#27272a',
      cardText: '#fafafa',
      cardTextSecondary: '#d4d4d8',
      cardBorder: '#52525b',
      cardHover: '#3f3f46',
      // Chart colors
      chartColors: ['#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#f87171', '#fb923c', '#a3e635'],
      // Platform UI
      appBackground: '#09090b',
      sidebarBackground: '#27272a',
      sidebarText: '#d4d4d8',
      sidebarTextActive: '#f472b6',
      sidebarHover: '#3f3f46',
      menuBackground: '#27272a',
      menuText: '#fafafa',
      menuHover: '#3f3f46',
      // Modal/Dialog
      modalBackground: '#27272a',
      modalOverlay: 'rgba(0, 0, 0, 0.8)',
      modalBorder: '#52525b',
      // Input fields
      inputBackground: '#18181b',
      inputBorder: '#52525b',
      inputText: '#fafafa',
      inputFocus: '#f472b6',
      // States
      hover: '#3f3f46',
      disabled: '#52525b',
      disabledText: '#71717a'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #f59e0b 100%)'
    }
  },
  // Theme 5: Ocean Breeze
  {
    id: 'theme-5-ocean',
    name: 'Theme 5: Ocean Breeze',
    description: 'Fresh ocean-inspired theme with teal and cyan - Customizable',
    isCustomizable: true,
    colors: {
      primary: '#06b6d4',
      primaryLight: '#cffafe',
      primaryDark: '#0e7490',
      secondary: '#14b8a6',
      accent: '#0891b2',
      success: '#10b981',
      warning: '#fbbf24',
      danger: '#ef4444',
      info: '#3b82f6',
      background: '#ecfeff',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e0f2fe',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#0f172a',
      cardTextSecondary: '#475569',
      cardBorder: '#a5f3fc',
      cardHover: '#f0fdfa',
      // Chart colors
      chartColors: ['#06b6d4', '#14b8a6', '#0891b2', '#10b981', '#3b82f6', '#22d3ee', '#2dd4bf', '#5eead4'],
      // Platform UI
      appBackground: '#f0fdfa',
      sidebarBackground: '#083344',
      sidebarText: '#cffafe',
      sidebarTextActive: '#22d3ee',
      sidebarHover: '#155e75',
      menuBackground: '#ffffff',
      menuText: '#0f172a',
      menuHover: '#ecfeff',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(8, 51, 68, 0.5)',
      modalBorder: '#a5f3fc',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#a5f3fc',
      inputText: '#0f172a',
      inputFocus: '#06b6d4',
      // States
      hover: '#ecfeff',
      disabled: '#e0f2fe',
      disabledText: '#67e8f9'
    },
    darkColors: {
      primary: '#22d3ee',
      primaryLight: '#083344',
      primaryDark: '#a5f3fc',
      secondary: '#2dd4bf',
      accent: '#06b6d4',
      success: '#34d399',
      warning: '#fcd34d',
      danger: '#f87171',
      info: '#60a5fa',
      background: '#0c4a6e',
      surface: '#164e63',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      border: '#0e7490',
      // Card specific colors
      cardBackground: '#164e63',
      cardText: '#f0f9ff',
      cardTextSecondary: '#bae6fd',
      cardBorder: '#155e75',
      cardHover: '#0e7490',
      // Chart colors
      chartColors: ['#22d3ee', '#2dd4bf', '#06b6d4', '#34d399', '#60a5fa', '#5eead4', '#67e8f9', '#a5f3fc'],
      // Platform UI
      appBackground: '#082f49',
      sidebarBackground: '#164e63',
      sidebarText: '#cffafe',
      sidebarTextActive: '#22d3ee',
      sidebarHover: '#0e7490',
      menuBackground: '#164e63',
      menuText: '#f0f9ff',
      menuHover: '#0e7490',
      // Modal/Dialog
      modalBackground: '#164e63',
      modalOverlay: 'rgba(0, 0, 0, 0.75)',
      modalBorder: '#155e75',
      // Input fields
      inputBackground: '#0c4a6e',
      inputBorder: '#155e75',
      inputText: '#f0f9ff',
      inputFocus: '#22d3ee',
      // States
      hover: '#0e7490',
      disabled: '#155e75',
      disabledText: '#0891b2'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #0891b2 100%)'
    }
  },
  // Theme 6: Sunset Glow
  {
    id: 'theme-6-sunset',
    name: 'Theme 6: Sunset Glow',
    description: 'Warm sunset colors with orange and coral - Customizable',
    isCustomizable: true,
    colors: {
      primary: '#f97316',
      primaryLight: '#ffedd5',
      primaryDark: '#c2410c',
      secondary: '#fb923c',
      accent: '#ef4444',
      success: '#10b981',
      warning: '#eab308',
      danger: '#dc2626',
      info: '#3b82f6',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#1c1917',
      textSecondary: '#57534e',
      border: '#fed7aa',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#1c1917',
      cardTextSecondary: '#78716c',
      cardBorder: '#fed7aa',
      cardHover: '#ffedd5',
      // Chart colors
      chartColors: ['#f97316', '#fb923c', '#ef4444', '#eab308', '#dc2626', '#ea580c', '#f59e0b', '#fdba74'],
      // Platform UI
      appBackground: '#fef3c7',
      sidebarBackground: '#7c2d12',
      sidebarText: '#fed7aa',
      sidebarTextActive: '#fb923c',
      sidebarHover: '#9a3412',
      menuBackground: '#ffffff',
      menuText: '#1c1917',
      menuHover: '#fff7ed',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(124, 45, 18, 0.5)',
      modalBorder: '#fed7aa',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#fdba74',
      inputText: '#1c1917',
      inputFocus: '#f97316',
      // States
      hover: '#fff7ed',
      disabled: '#ffedd5',
      disabledText: '#fb923c'
    },
    darkColors: {
      primary: '#fb923c',
      primaryLight: '#7c2d12',
      primaryDark: '#fed7aa',
      secondary: '#fdba74',
      accent: '#f87171',
      success: '#34d399',
      warning: '#fde047',
      danger: '#ef4444',
      info: '#60a5fa',
      background: '#431407',
      surface: '#7c2d12',
      text: '#fef3c7',
      textSecondary: '#fed7aa',
      border: '#9a3412',
      // Card specific colors
      cardBackground: '#7c2d12',
      cardText: '#fef3c7',
      cardTextSecondary: '#fed7aa',
      cardBorder: '#9a3412',
      cardHover: '#9a3412',
      // Chart colors
      chartColors: ['#fb923c', '#fdba74', '#f87171', '#fde047', '#ef4444', '#fbbf24', '#ea580c', '#fcd34d'],
      // Platform UI
      appBackground: '#292524',
      sidebarBackground: '#7c2d12',
      sidebarText: '#fed7aa',
      sidebarTextActive: '#fb923c',
      sidebarHover: '#9a3412',
      menuBackground: '#7c2d12',
      menuText: '#fef3c7',
      menuHover: '#9a3412',
      // Modal/Dialog
      modalBackground: '#7c2d12',
      modalOverlay: 'rgba(0, 0, 0, 0.8)',
      modalBorder: '#9a3412',
      // Input fields
      inputBackground: '#431407',
      inputBorder: '#9a3412',
      inputText: '#fef3c7',
      inputFocus: '#fb923c',
      // States
      hover: '#9a3412',
      disabled: '#c2410c',
      disabledText: '#78716c'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #ef4444 100%)'
    }
  },
  // Theme 7: Forest Emerald
  {
    id: 'theme-7-forest',
    name: 'Theme 7: Forest Emerald',
    description: 'Natural forest greens and earth tones - Customizable',
    isCustomizable: true,
    colors: {
      primary: '#059669',
      primaryLight: '#d1fae5',
      primaryDark: '#065f46',
      secondary: '#16a34a',
      accent: '#84cc16',
      success: '#22c55e',
      warning: '#facc15',
      danger: '#ef4444',
      info: '#0ea5e9',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#4a5568',
      border: '#bbf7d0',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#14532d',
      cardTextSecondary: '#166534',
      cardBorder: '#bbf7d0',
      cardHover: '#f0fdf4',
      // Chart colors
      chartColors: ['#059669', '#16a34a', '#84cc16', '#22c55e', '#10b981', '#0ea5e9', '#34d399', '#4ade80'],
      // Platform UI
      appBackground: '#dcfce7',
      sidebarBackground: '#064e3b',
      sidebarText: '#d1fae5',
      sidebarTextActive: '#34d399',
      sidebarHover: '#065f46',
      menuBackground: '#ffffff',
      menuText: '#14532d',
      menuHover: '#f0fdf4',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(6, 78, 59, 0.5)',
      modalBorder: '#bbf7d0',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#86efac',
      inputText: '#14532d',
      inputFocus: '#059669',
      // States
      hover: '#f0fdf4',
      disabled: '#dcfce7',
      disabledText: '#6ee7b7'
    },
    darkColors: {
      primary: '#34d399',
      primaryLight: '#064e3b',
      primaryDark: '#a7f3d0',
      secondary: '#4ade80',
      accent: '#a3e635',
      success: '#10b981',
      warning: '#fde047',
      danger: '#f87171',
      info: '#38bdf8',
      background: '#064e3b',
      surface: '#065f46',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#047857',
      // Card specific colors
      cardBackground: '#065f46',
      cardText: '#ecfdf5',
      cardTextSecondary: '#a7f3d0',
      cardBorder: '#047857',
      cardHover: '#047857',
      // Chart colors
      chartColors: ['#34d399', '#4ade80', '#a3e635', '#10b981', '#22c55e', '#38bdf8', '#6ee7b7', '#86efac'],
      // Platform UI
      appBackground: '#052e16',
      sidebarBackground: '#065f46',
      sidebarText: '#d1fae5',
      sidebarTextActive: '#34d399',
      sidebarHover: '#047857',
      menuBackground: '#065f46',
      menuText: '#ecfdf5',
      menuHover: '#047857',
      // Modal/Dialog
      modalBackground: '#065f46',
      modalOverlay: 'rgba(0, 0, 0, 0.75)',
      modalBorder: '#047857',
      // Input fields
      inputBackground: '#064e3b',
      inputBorder: '#047857',
      inputText: '#ecfdf5',
      inputFocus: '#34d399',
      // States
      hover: '#047857',
      disabled: '#059669',
      disabledText: '#6ee7b7'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #059669 0%, #16a34a 50%, #84cc16 100%)'
    }
  },
  // Theme 8: Royal Purple
  {
    id: 'theme-8-royal',
    name: 'Theme 8: Royal Purple',
    description: 'Luxurious purple and gold royal theme - Customizable',
    isCustomizable: true,
    colors: {
      primary: '#7c3aed',
      primaryLight: '#ede9fe',
      primaryDark: '#5b21b6',
      secondary: '#a855f7',
      accent: '#d97706',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      // Card specific colors
      cardBackground: '#ffffff',
      cardText: '#1f2937',
      cardTextSecondary: '#6b21a8',
      cardBorder: '#e9d5ff',
      cardHover: '#faf5ff',
      // Chart colors
      chartColors: ['#7c3aed', '#a855f7', '#d97706', '#c084fc', '#8b5cf6', '#fbbf24', '#9333ea', '#d946ef'],
      // Platform UI
      appBackground: '#f3e8ff',
      sidebarBackground: '#4c1d95',
      sidebarText: '#e9d5ff',
      sidebarTextActive: '#a78bfa',
      sidebarHover: '#5b21b6',
      menuBackground: '#ffffff',
      menuText: '#1f2937',
      menuHover: '#faf5ff',
      // Modal/Dialog
      modalBackground: '#ffffff',
      modalOverlay: 'rgba(76, 29, 149, 0.5)',
      modalBorder: '#e9d5ff',
      // Input fields
      inputBackground: '#ffffff',
      inputBorder: '#c4b5fd',
      inputText: '#1f2937',
      inputFocus: '#7c3aed',
      // States
      hover: '#faf5ff',
      disabled: '#f3e8ff',
      disabledText: '#c4b5fd'
    },
    darkColors: {
      primary: '#a78bfa',
      primaryLight: '#4c1d95',
      primaryDark: '#ddd6fe',
      secondary: '#c084fc',
      accent: '#fbbf24',
      success: '#34d399',
      warning: '#fcd34d',
      danger: '#f87171',
      info: '#60a5fa',
      background: '#3b0764',
      surface: '#581c87',
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      border: '#6b21a8',
      // Card specific colors
      cardBackground: '#581c87',
      cardText: '#faf5ff',
      cardTextSecondary: '#e9d5ff',
      cardBorder: '#6b21a8',
      cardHover: '#6b21a8',
      // Chart colors
      chartColors: ['#a78bfa', '#c084fc', '#fbbf24', '#d8b4fe', '#8b5cf6', '#fcd34d', '#a855f7', '#e9d5ff'],
      // Platform UI
      appBackground: '#2e1065',
      sidebarBackground: '#581c87',
      sidebarText: '#e9d5ff',
      sidebarTextActive: '#a78bfa',
      sidebarHover: '#6b21a8',
      menuBackground: '#581c87',
      menuText: '#faf5ff',
      menuHover: '#6b21a8',
      // Modal/Dialog
      modalBackground: '#581c87',
      modalOverlay: 'rgba(0, 0, 0, 0.8)',
      modalBorder: '#6b21a8',
      // Input fields
      inputBackground: '#3b0764',
      inputBorder: '#6b21a8',
      inputText: '#faf5ff',
      inputFocus: '#a78bfa',
      // States
      hover: '#6b21a8',
      disabled: '#7c3aed',
      disabledText: '#c4b5fd'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d97706 100%)'
    }
  }
];

export const getThemeById = (id: string): Theme => {
  // Check localStorage for custom theme overrides
  const customThemeKey = `custom-theme-${id}`;
  const savedCustomTheme = localStorage.getItem(customThemeKey);
  
  if (savedCustomTheme) {
    try {
      return JSON.parse(savedCustomTheme);
    } catch (e) {
      console.error('Failed to parse custom theme', e);
    }
  }
  
  return themes.find(t => t.id === id) || themes[0];
};

export const saveCustomTheme = (theme: Theme) => {
  if (theme.isCustomizable) {
    const customThemeKey = `custom-theme-${theme.id}`;
    localStorage.setItem(customThemeKey, JSON.stringify(theme));
  }
};

export const resetCustomTheme = (themeId: string) => {
  const customThemeKey = `custom-theme-${themeId}`;
  localStorage.removeItem(customThemeKey);
  return themes.find(t => t.id === themeId) || themes[0];
};