import React, { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  badge?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * DashboardCard - A reusable card component for dashboard pages
 * 
 * This component is memoized for better performance when used in lists or grids.
 */
const DashboardCard = memo(({
  title,
  description,
  icon,
  className,
  onClick,
  badge,
  footer,
  children
}: DashboardCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-[hsl(var(--background-light-dark))] p-6 rounded-lg shadow",
        "transition-all duration-200 ease-in-out",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {badge && <div>{badge}</div>}
      </div>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
      )}
      
      {children}
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
});

DashboardCard.displayName = 'DashboardCard';

export default DashboardCard;
