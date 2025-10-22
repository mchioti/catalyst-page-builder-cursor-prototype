import React from 'react';

// Inline type definition to avoid module resolution issues
type WidgetIcon = {
  enabled?: boolean;
  position?: 'left' | 'right';
  emoji?: string;
}

interface IconSelectorProps {
  icon?: WidgetIcon;
  onChange: (icon: WidgetIcon) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ icon, onChange }) => {
  const handleToggle = (enabled: boolean) => {
    onChange({
      ...icon,
      enabled,
      // Set defaults when enabling
      ...(enabled && !icon?.emoji && { emoji: '🎯' }),
      ...(enabled && !icon?.position && { position: 'left' })
    });
  };

  const handleEmojiChange = (emoji: string) => {
    onChange({
      ...icon,
      emoji
    });
  };

  const handlePositionChange = (position: 'left' | 'right') => {
    onChange({
      ...icon,
      position
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">Icon</label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={icon?.enabled ?? false}
            onChange={(e) => handleToggle(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Enable Icon</span>
        </label>
      </div>
      
      {icon?.enabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon Emoji</label>
            <input
              type="text"
              value={icon?.emoji || '🎯'}
              onChange={(e) => handleEmojiChange(e.target.value)}
              placeholder="🎯"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
              maxLength={2}
            />
            <p className="text-xs text-gray-500 mt-1">Enter any emoji</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={icon?.position || 'left'}
              onChange={(e) => handlePositionChange(e.target.value as 'left' | 'right')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
