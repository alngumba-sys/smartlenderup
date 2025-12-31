import { Palette, Check, RefreshCw, Download, Upload } from 'lucide-react';
import { themes } from '../../data/themes';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

export function ThemeSettingsTab() {
  const { currentTheme, setTheme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abc-theme-${currentTheme.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Brand Theme Management</h2>
          <p className="text-gray-600">Customize the platform appearance and maintain brand consistency</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportTheme}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="size-4" />
            <span>Export Theme</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            style={{
              backgroundColor: `var(--color-primary)`,
              color: 'white'
            }}
          >
            <Palette className="size-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
        </div>
      </div>

      {/* Current Theme Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="size-16 rounded-lg"
            style={{ background: currentTheme.preview.gradient }}
          ></div>
          <div>
            <h3 className="text-gray-900">{currentTheme.name}</h3>
            <p className="text-gray-600 text-sm">{currentTheme.description}</p>
            <p className="text-gray-500 text-xs mt-1">Currently Active Theme</p>
          </div>
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <div className="text-center">
            <div 
              className="size-12 rounded-lg mx-auto mb-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            ></div>
            <p className="text-xs text-gray-600">Primary</p>
            <p className="text-xs text-gray-400 font-mono">{currentTheme.colors.primary}</p>
          </div>
          <div className="text-center">
            <div 
              className="size-12 rounded-lg mx-auto mb-2"
              style={{ backgroundColor: currentTheme.colors.secondary }}
            ></div>
            <p className="text-xs text-gray-600">Secondary</p>
            <p className="text-xs text-gray-400 font-mono">{currentTheme.colors.secondary}</p>
          </div>
          <div className="text-center">
            <div 
              className="size-12 rounded-lg mx-auto mb-2"
              style={{ backgroundColor: currentTheme.colors.success }}
            ></div>
            <p className="text-xs text-gray-600">Success</p>
            <p className="text-xs text-gray-400 font-mono">{currentTheme.colors.success}</p>
          </div>
          <div className="text-center">
            <div 
              className="size-12 rounded-lg mx-auto mb-2"
              style={{ backgroundColor: currentTheme.colors.warning }}
            ></div>
            <p className="text-xs text-gray-600">Warning</p>
            <p className="text-xs text-gray-400 font-mono">{currentTheme.colors.warning}</p>
          </div>
          <div className="text-center">
            <div 
              className="size-12 rounded-lg mx-auto mb-2"
              style={{ backgroundColor: currentTheme.colors.danger }}
            ></div>
            <p className="text-xs text-gray-600">Danger</p>
            <p className="text-xs text-gray-400 font-mono">{currentTheme.colors.danger}</p>
          </div>
        </div>
      </div>

      {/* Available Themes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-gray-900 mb-4">Available Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((theme) => {
            const isActive = theme.id === currentTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                style={isActive ? {
                  borderColor: currentTheme.colors.primary,
                  backgroundColor: currentTheme.colors.primaryLight
                } : {}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="size-12 rounded-lg"
                    style={{ background: theme.preview.gradient }}
                  ></div>
                  {isActive && (
                    <div 
                      className="size-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      <Check className="size-4 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="text-gray-900 mb-1">{theme.name}</h4>
                <p className="text-gray-600 text-xs">{theme.description}</p>
                
                {/* Mini Color Palette */}
                <div className="flex gap-1 mt-3">
                  <div className="size-4 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                  <div className="size-4 rounded" style={{ backgroundColor: theme.colors.success }}></div>
                  <div className="size-4 rounded" style={{ backgroundColor: theme.colors.warning }}></div>
                  <div className="size-4 rounded" style={{ backgroundColor: theme.colors.danger }}></div>
                  <div className="size-4 rounded" style={{ backgroundColor: theme.colors.info }}></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Preview */}
      {showPreview && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Live Preview</h3>
          <div className="space-y-4">
            {/* Buttons Preview */}
            <div>
              <p className="text-gray-600 text-sm mb-2">Buttons</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: currentTheme.colors.success }}
                >
                  Success Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: currentTheme.colors.warning }}
                >
                  Warning Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: currentTheme.colors.danger }}
                >
                  Danger Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: currentTheme.colors.info }}
                >
                  Info Button
                </button>
              </div>
            </div>

            {/* Cards Preview */}
            <div>
              <p className="text-gray-600 text-sm mb-2">Cards & Badges</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: currentTheme.colors.primaryLight }}
                >
                  <h4 style={{ color: currentTheme.colors.primaryDark }}>Primary Card</h4>
                  <p className="text-gray-600 text-sm">Sample card content</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h4 className="text-gray-900">Neutral Card</h4>
                  <p className="text-gray-600 text-sm">Sample card content</p>
                </div>
                <div className="p-4 rounded-lg border-2" style={{ borderColor: currentTheme.colors.primary }}>
                  <h4 style={{ color: currentTheme.colors.primary }}>Bordered Card</h4>
                  <p className="text-gray-600 text-sm">Sample card content</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div>
              <p className="text-gray-600 text-sm mb-2">Stats Cards</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-600 text-sm">Total Clients</p>
                  <p className="text-2xl mt-1" style={{ color: currentTheme.colors.primary }}>1,234</p>
                </div>
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-600 text-sm">Active Loans</p>
                  <p className="text-2xl mt-1" style={{ color: currentTheme.colors.success }}>567</p>
                </div>
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-2xl mt-1" style={{ color: currentTheme.colors.warning }}>89</p>
                </div>
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-600 text-sm">Overdue</p>
                  <p className="text-2xl mt-1" style={{ color: currentTheme.colors.danger }}>23</p>
                </div>
              </div>
            </div>

            {/* Alerts Preview */}
            <div>
              <p className="text-gray-600 text-sm mb-2">Alerts & Notifications</p>
              <div className="space-y-2">
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: currentTheme.colors.primaryLight,
                    borderLeft: `4px solid ${currentTheme.colors.primary}`
                  }}
                >
                  <p style={{ color: currentTheme.colors.primaryDark }}>Primary alert message</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <p className="text-green-800">Success alert message</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border-l-4 border-amber-500">
                  <p className="text-amber-800">Warning alert message</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
                  <p className="text-red-800">Danger alert message</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Palette className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-2">Brand Consistency Guidelines</h3>
            <ul className="space-y-1 text-gray-700 text-sm">
              <li>• <strong>Primary Color:</strong> Used for main actions, navigation, and brand elements</li>
              <li>• <strong>Success Color:</strong> Indicates successful operations, approvals, and positive metrics</li>
              <li>• <strong>Warning Color:</strong> Alerts for attention-needed items and pending approvals</li>
              <li>• <strong>Danger Color:</strong> Critical alerts, overdue items, and destructive actions</li>
              <li>• <strong>Info Color:</strong> Informational messages and secondary highlights</li>
              <li>• All theme changes apply instantly across the entire platform</li>
              <li>• Themes are saved automatically and persist across sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
