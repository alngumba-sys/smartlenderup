import { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ModalWrapperProps {
  children: ReactNode;
  maxWidth?: string;
}

export function ModalWrapper({ children, maxWidth = 'max-w-5xl' }: ModalWrapperProps) {
  const { isDark } = useTheme();
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {children}
      </div>
    </div>
  );
}
