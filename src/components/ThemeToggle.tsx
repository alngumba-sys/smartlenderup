import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { mode, toggleMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="size-5 text-yellow-500" />
      ) : (
        <Moon className="size-5 text-gray-700" />
      )}
    </button>
  );
}
