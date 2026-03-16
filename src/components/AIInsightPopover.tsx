import { X, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useRef } from 'react';

interface Insight {
  icon: string;
  title: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface AIInsightPopoverProps {
  insights: Insight[];
  onClose: () => void;
  targetRef?: React.RefObject<HTMLDivElement>;
  cardTitle: string;
}

export function AIInsightPopover({ insights, onClose, targetRef, cardTitle }: AIInsightPopoverProps) {
  const { isDark } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          targetRef?.current && !targetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, targetRef]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="size-3 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="size-3 text-red-500" />;
    return <Minus className="size-3 text-gray-400" />;
  };

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 w-64 rounded-lg shadow-xl border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1 duration-150 ${
        isDark 
          ? 'bg-gray-800/98 border-gray-700/60 shadow-black/40' 
          : 'bg-white/98 border-gray-300 shadow-gray-900/20'
      }`}
      style={{
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Arrow pointing up */}
      <div 
        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t ${
          isDark ? 'bg-gray-800/98 border-gray-700/60' : 'bg-white/98 border-gray-300'
        }`}
      />

      {/* Header - Compact */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        isDark ? 'border-gray-700/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-1.5">
          <Sparkles className={`size-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <h3 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Insights
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-md transition-colors ${
            isDark 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Insights - Compact */}
      <div className="p-2.5 space-y-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg border transition-all duration-150 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-700/40 hover:border-gray-600/60' 
                : 'bg-gray-50/50 border-gray-200/70 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="text-base flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {insight.title}
                  </h4>
                  {getTrendIcon(insight.trend)}
                </div>
                <p className={`text-[10px] leading-snug ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
