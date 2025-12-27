import { Palette, Check, RotateCcw, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { themes, saveCustomTheme, resetCustomTheme, Theme, getThemeById } from '../../data/themes';

export function ThemeSettings() {
  const { currentTheme, setTheme, refreshTheme, mode, toggleMode, isDark } = useTheme();
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [customColors, setCustomColors] = useState<any>(null);
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (editingTheme) {
      setCustomColors({
        light: { ...editingTheme.colors },
        dark: { ...editingTheme.darkColors }
      });
    }
  }, [editingTheme]);

  const handleThemeSelect = (themeId: string) => {
    // Don't apply immediately, just mark as pending
    setPendingThemeId(themeId);
  };

  const handleSaveChanges = () => {
    if (pendingThemeId) {
      setTheme(pendingThemeId);
      setPendingThemeId(null);
      setEditingTheme(null);
      setCustomColors(null);
    }
  };

  const handleEditTheme = (theme: Theme) => {
    // Load the current version (which might have customizations)
    const currentVersionOfTheme = getThemeById(theme.id);
    setEditingTheme(currentVersionOfTheme);
    setPendingThemeId(null); // Clear pending selection when editing
  };

  const handleColorChange = (mode: 'light' | 'dark', colorKey: string, value: string) => {
    if (!customColors) return;
    
    setCustomColors({
      ...customColors,
      [mode]: {
        ...customColors[mode],
        [colorKey]: value
      }
    });
  };

  const handleSaveCustomTheme = () => {
    if (!editingTheme || !customColors) return;

    const updatedTheme: Theme = {
      ...editingTheme,
      colors: customColors.light,
      darkColors: customColors.dark
    };

    // Save to localStorage
    saveCustomTheme(updatedTheme);
    
    // Clear editing state
    setEditingTheme(null);
    setCustomColors(null);
    
    // Force refresh the theme to load the new colors
    setTimeout(() => {
      refreshTheme();
    }, 100);
  };

  const handleResetTheme = (themeId: string) => {
    const resetTheme = resetCustomTheme(themeId);
    setTheme(resetTheme.id);
    setEditingTheme(null);
    setCustomColors(null);
  };

  const colorLabels: Record<string, string> = {
    primary: 'Primary Color',
    primaryLight: 'Primary Light',
    primaryDark: 'Primary Dark',
    secondary: 'Secondary Color',
    accent: 'Accent Color',
    success: 'Success Color',
    warning: 'Warning Color',
    danger: 'Danger Color',
    info: 'Info Color',
    background: 'Background',
    surface: 'Surface/Card',
    text: 'Text Primary',
    textSecondary: 'Text Secondary',
    border: 'Border Color',
    // Card specific
    cardBackground: 'Card Background',
    cardText: 'Card Text',
    cardTextSecondary: 'Card Text Secondary',
    cardBorder: 'Card Border',
    cardHover: 'Card Hover',
    // Chart colors (skip - array)
    // Platform UI
    appBackground: 'App Background',
    sidebarBackground: 'Sidebar Background',
    sidebarText: 'Sidebar Text',
    sidebarTextActive: 'Sidebar Active Text',
    sidebarHover: 'Sidebar Hover',
    menuBackground: 'Menu Background',
    menuText: 'Menu Text',
    menuHover: 'Menu Hover',
    // Modal/Dialog
    modalBackground: 'Modal Background',
    modalOverlay: 'Modal Overlay',
    modalBorder: 'Modal Border',
    // Input fields
    inputBackground: 'Input Background',
    inputBorder: 'Input Border',
    inputText: 'Input Text',
    inputFocus: 'Input Focus',
    // States
    hover: 'Hover State',
    disabled: 'Disabled State',
    disabledText: 'Disabled Text'
  };

  return (
    <div className={`space-y-6 ${isDark ? 'dark' : ''}`}>
      {/* Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="size-5 text-blue-400" /> : <Sun className="size-5 text-amber-500" />}
            <div>
              <h3 className="text-gray-900 dark:text-white">Display Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose between light and dark mode</p>
            </div>
          </div>
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Current mode: <span className="font-medium text-gray-900 dark:text-white">{isDark ? 'Dark' : 'Light'} Mode</span>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="size-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-gray-900 dark:text-white">Color Themes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select a theme or customize your own - {themes.length} available themes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-lg ${
                (pendingThemeId === theme.id || currentTheme.id === theme.id)
                  ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 hover:border-emerald-400 dark:hover:border-emerald-500'
              }`}
              onClick={() => !editingTheme && handleThemeSelect(theme.id)}
            >
              {/* Selected Badge */}
              {currentTheme.id === theme.id && !pendingThemeId && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-xs">
                    <Check className="size-3" />
                    <span className="text-xs">Active</span>
                  </div>
                </div>
              )}

              {/* Theme Preview */}
              <div
                className="h-14 rounded-lg mb-2 shadow-inner"
                style={{ background: theme.preview.gradient }}
              />

              {/* Theme Info */}
              <div className="mb-2">
                <h4 className="text-sm text-gray-900 dark:text-white mb-0.5">{theme.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{theme.description}</p>
              </div>

              {/* Color Palette Preview */}
              <div className="grid grid-cols-7 gap-0.5 mb-2">
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.primary : theme.colors.primary }}
                  title="Primary"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.secondary : theme.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.accent : theme.colors.accent }}
                  title="Accent"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.success : theme.colors.success }}
                  title="Success"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.warning : theme.colors.warning }}
                  title="Warning"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.danger : theme.colors.danger }}
                  title="Danger"
                />
                <div
                  className="h-5 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDark ? theme.darkColors.info : theme.colors.info }}
                  title="Info"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                {theme.isCustomizable && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTheme(theme);
                      }}
                      className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                    >
                      Customize
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetTheme(theme.id);
                      }}
                      className="w-full px-2 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-xs flex items-center justify-center gap-1"
                      title="Reset to default"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                  </>
                )}
                {!theme.isCustomizable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme.id);
                    }}
                    className="w-full px-2 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs"
                  >
                    Apply Theme
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Save Changes Button */}
        {pendingThemeId && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Color Customization Panel */}
      {editingTheme && customColors && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 dark:text-white">Customize {editingTheme.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adjust colors for light and dark modes</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingTheme(null);
                  setCustomColors(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomTheme}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save & Apply
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Light Mode Colors */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="size-5 text-amber-500" />
                <h4 className="text-gray-900 dark:text-white">Light Mode Colors</h4>
              </div>
              <div className="space-y-3">
                {Object.keys(customColors.light).map((colorKey) => {
                  // Skip array properties like chartColors
                  if (Array.isArray(customColors.light[colorKey])) return null;
                  
                  return (
                    <div key={`light-${colorKey}`} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {colorLabels[colorKey] || colorKey}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customColors.light[colorKey]}
                            onChange={(e) => handleColorChange('light', colorKey, e.target.value)}
                            className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customColors.light[colorKey]}
                            onChange={(e) => handleColorChange('light', colorKey, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dark Mode Colors */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Moon className="size-5 text-blue-400" />
                <h4 className="text-gray-900 dark:text-white">Dark Mode Colors</h4>
              </div>
              <div className="space-y-3">
                {Object.keys(customColors.dark).map((colorKey) => {
                  // Skip array properties like chartColors
                  if (Array.isArray(customColors.dark[colorKey])) return null;
                  
                  return (
                    <div key={`dark-${colorKey}`} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {colorLabels[colorKey] || colorKey}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customColors.dark[colorKey]}
                            onChange={(e) => handleColorChange('dark', colorKey, e.target.value)}
                            className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customColors.dark[colorKey]}
                            onChange={(e) => handleColorChange('dark', colorKey, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Live Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg shadow" style={{ backgroundColor: isDark ? customColors.dark.surface : customColors.light.surface }}>
                <div className="text-xs mb-1" style={{ color: isDark ? customColors.dark.textSecondary : customColors.light.textSecondary }}>
                  Card Surface
                </div>
                <div className="text-sm" style={{ color: isDark ? customColors.dark.text : customColors.light.text }}>
                  Sample Text
                </div>
              </div>
              <button className="p-3 rounded-lg text-white text-sm" style={{ backgroundColor: isDark ? customColors.dark.primary : customColors.light.primary }}>
                Primary Button
              </button>
              <button className="p-3 rounded-lg text-white text-sm" style={{ backgroundColor: isDark ? customColors.dark.success : customColors.light.success }}>
                Success
              </button>
              <button className="p-3 rounded-lg text-white text-sm" style={{ backgroundColor: isDark ? customColors.dark.danger : customColors.light.danger }}>
                Danger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}