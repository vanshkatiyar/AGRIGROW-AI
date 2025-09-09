import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'poor' | 'unknown';
  isReconnecting?: boolean;
  className?: string;
  showText?: boolean;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  isReconnecting = false,
  className,
  showText = true
}) => {
  const getQualityConfig = () => {
    if (isReconnecting) {
      return {
        icon: RefreshCw,
        text: 'Reconnecting',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        animate: 'animate-spin'
      };
    }

    switch (quality) {
      case 'excellent':
        return {
          icon: Wifi,
          text: 'Excellent',
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          animate: ''
        };
      case 'good':
        return {
          icon: Wifi,
          text: 'Good',
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          animate: ''
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          text: 'Poor',
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          animate: 'animate-pulse'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Unknown',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          animate: ''
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center space-x-2 px-2 py-1 rounded-full',
      config.bgColor,
      className
    )}>
      <Icon className={cn(
        'h-3 w-3',
        config.color,
        config.animate
      )} />
      {showText && (
        <span className={cn(
          'text-xs font-medium',
          config.color
        )}>
          {config.text}
        </span>
      )}
    </div>
  );
};

// Connection metrics display component
interface ConnectionMetricsProps {
  metrics: {
    packetLoss?: number;
    roundTripTime?: number;
    bandwidth?: number;
    jitter?: number;
  };
  className?: string;
}

export const ConnectionMetrics: React.FC<ConnectionMetricsProps> = ({
  metrics,
  className
}) => {
  const formatMetric = (value: number | undefined, unit: string, decimals: number = 1) => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getPacketLossColor = (loss: number | undefined) => {
    if (loss === undefined) return 'text-gray-500';
    if (loss < 0.02) return 'text-green-500';
    if (loss < 0.05) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRttColor = (rtt: number | undefined) => {
    if (rtt === undefined) return 'text-gray-500';
    if (rtt < 0.1) return 'text-green-500';
    if (rtt < 0.2) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={cn(
      'grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-xs',
      className
    )}>
      <div className="flex justify-between">
        <span className="text-gray-600">Packet Loss:</span>
        <span className={getPacketLossColor(metrics.packetLoss)}>
          {formatMetric(metrics.packetLoss ? metrics.packetLoss * 100 : undefined, '%', 2)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">RTT:</span>
        <span className={getRttColor(metrics.roundTripTime)}>
          {formatMetric(metrics.roundTripTime ? metrics.roundTripTime * 1000 : undefined, 'ms', 0)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Bandwidth:</span>
        <span className="text-gray-700">
          {formatMetric(metrics.bandwidth ? metrics.bandwidth / 1000 : undefined, 'kbps', 0)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Jitter:</span>
        <span className="text-gray-700">
          {formatMetric(metrics.jitter ? metrics.jitter * 1000 : undefined, 'ms', 1)}
        </span>
      </div>
    </div>
  );
};