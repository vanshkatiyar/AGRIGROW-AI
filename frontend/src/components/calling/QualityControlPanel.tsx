import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Monitor, 
  Smartphone,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QualityControlPanelProps {
  currentQuality: 'high' | 'medium' | 'low' | 'auto';
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  onQualityChange: (quality: 'high' | 'medium' | 'low' | 'auto') => void;
  onSwitchToAudioOnly: () => void;
  isVideoCall: boolean;
  className?: string;
}

export const QualityControlPanel: React.FC<QualityControlPanelProps> = ({
  currentQuality,
  connectionQuality,
  onQualityChange,
  onSwitchToAudioOnly,
  isVideoCall,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const qualityOptions = [
    {
      value: 'auto' as const,
      label: 'Auto',
      description: 'Automatically adjust based on connection',
      icon: Wifi,
      recommended: true
    },
    {
      value: 'high' as const,
      label: 'High',
      description: '720p video, high bitrate',
      icon: Monitor,
      recommended: connectionQuality === 'excellent'
    },
    {
      value: 'medium' as const,
      label: 'Medium',
      description: '480p video, medium bitrate',
      icon: Smartphone,
      recommended: connectionQuality === 'good'
    },
    {
      value: 'low' as const,
      label: 'Low',
      description: '240p video, low bitrate',
      icon: WifiOff,
      recommended: connectionQuality === 'poor'
    }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'auto':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        title="Quality settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-lg border p-4 z-50">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Quality Settings</h3>
              <div className={cn('text-sm font-medium', getConnectionStatusColor())}>
                {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)} Connection
              </div>
            </div>

            {/* Current Quality Display */}
            <div className={cn(
              'p-3 rounded-lg border text-sm',
              getQualityColor(currentQuality)
            )}>
              <div className="font-medium">
                Current: {currentQuality.charAt(0).toUpperCase() + currentQuality.slice(1)} Quality
              </div>
              {currentQuality === 'auto' && (
                <div className="text-xs mt-1 opacity-75">
                  Automatically adjusting based on connection quality
                </div>
              )}
            </div>

            {/* Quality Options */}
            {isVideoCall && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Video Quality</h4>
                <div className="grid grid-cols-1 gap-2">
                  {qualityOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentQuality === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => onQualityChange(option.value)}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border text-left transition-colors',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <Icon className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{option.label}</span>
                            {option.recommended && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audio Only Option */}
            {isVideoCall && (
              <div className="pt-2 border-t">
                <button
                  onClick={onSwitchToAudioOnly}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Switch to Audio Only</div>
                    <div className="text-xs text-gray-600">
                      Disable video to improve connection stability
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-900 mb-1">Tips</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Auto quality adjusts automatically based on your connection</li>
                <li>• Lower quality uses less bandwidth and battery</li>
                <li>• Switch to audio-only if video quality is poor</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};