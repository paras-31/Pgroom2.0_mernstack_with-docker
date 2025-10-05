import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  change?: number;
  changeTimeframe?: string;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

/**
 * StatsCard - A card component for displaying statistics with optional change indicators
 *
 * @param title - The title of the statistic
 * @param value - The value of the statistic
 * @param icon - The icon to display
 * @param description - Optional description text
 * @param change - Optional percentage change value
 * @param changeTimeframe - Optional timeframe for the change (e.g., "since last month")
 * @param className - Optional additional class names
 * @param iconClassName - Optional additional class names for the icon
 * @param valueClassName - Optional additional class names for the value
 * @param changeDirection - Direction of change: 'up' (positive), 'down' (negative), or 'neutral'
 */
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  change,
  changeTimeframe = 'since last month',
  className,
  iconClassName,
  valueClassName,
  changeDirection = 'neutral',
  isLoading = false,
}) => {
  // Determine the color for the change indicator
  const getChangeColor = () => {
    if (changeDirection === 'up') return 'text-green-500 dark:text-green-400';
    if (changeDirection === 'down') return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Determine the icon for the change indicator
  const getChangeIcon = () => {
    if (changeDirection === 'up') return <ArrowUp className="w-3 h-3" />;
    if (changeDirection === 'down') return <ArrowDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className={cn(
      "bg-white dark:bg-[hsl(var(--background-light-dark))] p-6 rounded-lg shadow",
      "transition-all duration-200 ease-in-out",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {isLoading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
          <div className={cn(
            "p-2 rounded-full",
            "bg-primary/10 text-primary",
            iconClassName
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            {description && <Skeleton className="h-4 w-32" />}
          </>
        ) : (
          <>
            <p className={cn(
              "text-2xl font-bold text-gray-900 dark:text-white",
              valueClassName
            )}>
              {value}
            </p>

            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}

            {typeof change !== 'undefined' && (
              <div className="flex items-center mt-2 text-sm">
                <span className={cn("flex items-center gap-1", getChangeColor())}>
                  {getChangeIcon()}
                  {change}%
                </span>
                {changeTimeframe && (
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    {changeTimeframe}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
