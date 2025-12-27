import { useThemeStyles } from '../hooks/useThemeStyles';
import { ReactNode } from 'react';

interface ThemeCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function ThemeCard({ children, className = '', onClick, hover = false }: ThemeCardProps) {
  const theme = useThemeStyles();
  
  return (
    <div 
      className={`${theme.card} border rounded-lg ${hover ? theme.cardHover : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
