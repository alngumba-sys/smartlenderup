import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'tile' | 'list';
  onViewModeChange: (mode: 'tile' | 'list') => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => onViewModeChange('tile')}
        className={`px-3 py-2 transition-colors ${
          viewMode === 'tile'
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="Tile View"
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-3 py-2 transition-colors ${
          viewMode === 'list'
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="List View"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
