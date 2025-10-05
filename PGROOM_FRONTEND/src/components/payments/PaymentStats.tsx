/**
 * PaymentStats Component
 *
 * Displays payment statistics and key metrics in a modern card layout
 * with proper formatting, visual indicators, and smooth animations.
 * Enhanced with micro-interactions and accessibility improvements.
 */

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Stats data interface
interface PaymentStatsData {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  successRate: number;
  currency?: string;
}

// Props interface
interface PaymentStatsProps {
  stats: PaymentStatsData | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Individual stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

// Animated counter hook for smooth number transitions
const useAnimatedCounter = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (end > 0) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return count;
};

const StatCard = memo<StatCardProps>(({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract numeric value for animation if it's a number
  const numericValue = typeof value === 'number' ? value :
    typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0 : 0;

  const animatedValue = useAnimatedCounter(numericValue, 1200);

  // Format the animated value back to the original format
  const displayValue = typeof value === 'number' ? animatedValue.toLocaleString() :
    typeof value === 'string' && value.includes('₹') ?
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(animatedValue) :
    typeof value === 'string' && value.includes('%') ? `${animatedValue}%` :
    value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn(
        'transition-all duration-300 hover:shadow-lg border-l-4',
        'group cursor-default',
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {title}
          </CardTitle>
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon className={cn(
              'h-4 w-4 transition-colors duration-300',
              'text-muted-foreground group-hover:text-primary',
              iconClassName
            )} />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-2xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {displayValue}
          </motion.div>
          {subtitle && (
            <motion.p
              className="text-xs text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {subtitle}
            </motion.p>
          )}
          {trend && (
            <motion.div
              className="flex items-center mt-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Badge
                variant={trend.isPositive ? 'default' : 'destructive'}
                className="text-xs transition-all duration-200 hover:scale-105"
              >
                <motion.div
                  animate={{ rotate: trend.isPositive ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                </motion.div>
                {Math.abs(trend.value)}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">
                vs last month
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

// Enhanced loading skeleton component with staggered animations
const StatCardSkeleton = memo<{ index?: number }>(({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay: index * 0.1,
      ease: "easeOut"
    }}
  >
    <Card className="border-l-4 border-l-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <motion.div
          className="h-4 w-24 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="h-4 w-4 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
      </CardHeader>
      <CardContent>
        <motion.div
          className="h-8 w-16 bg-muted rounded mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div
          className="h-3 w-32 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </CardContent>
    </Card>
  </motion.div>
));

StatCardSkeleton.displayName = 'StatCardSkeleton';

// Main PaymentStats Component
export const PaymentStats = memo<PaymentStatsProps>(({
  stats,
  isLoading = false,
  error = null,
  className
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: stats?.currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Loading state with staggered animations
  if (isLoading) {
    return (
      <motion.div
        className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} index={index} />
        ))}
      </motion.div>
    );
  }

  // Error state or no data
  if (error || !stats) {
    const isAuthError = error?.includes('Unauthorized') || error?.includes('401');
    const message = isAuthError
      ? 'Please log in to view payment statistics'
      : error || 'No payment data available';

    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {/* Total Revenue */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">--%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalAmount)}
          subtitle="From all successful payments"
          icon={IndianRupee}
          iconClassName="text-green-600"
          className="border-l-4 border-l-green-500"
        />
      </motion.div>

      {/* Total Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          subtitle="All payment transactions"
          icon={CreditCard}
          iconClassName="text-blue-600"
          className="border-l-4 border-l-blue-500"
        />
      </motion.div>

      {/* Success Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <StatCard
          title="Success Rate"
          value={formatPercentage(stats.successRate)}
          subtitle={`${stats.successfulPayments} successful payments`}
          icon={CheckCircle}
          iconClassName="text-green-600"
          className="border-l-4 border-l-green-500"
        />
      </motion.div>

      {/* Pending Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle="Awaiting completion"
          icon={Clock}
          iconClassName="text-yellow-600"
          className="border-l-4 border-l-yellow-500"
        />
      </motion.div>
    </motion.div>
  );
});

PaymentStats.displayName = 'PaymentStats';

// Additional detailed stats component
interface DetailedStatsProps {
  stats: PaymentStatsData;
  isLoading?: boolean;
  className?: string;
}

export const DetailedPaymentStats = memo<DetailedStatsProps>(({
  stats,
  isLoading = false,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {/* Successful Payments */}
      <StatCard
        title="Successful Payments"
        value={stats.successfulPayments.toLocaleString()}
        subtitle="Completed transactions"
        icon={CheckCircle}
        iconClassName="text-green-600"
      />

      {/* Failed Payments */}
      <StatCard
        title="Failed Payments"
        value={stats.failedPayments.toLocaleString()}
        subtitle="Unsuccessful transactions"
        icon={XCircle}
        iconClassName="text-red-600"
      />

      {/* Refunded Payments */}
      <StatCard
        title="Refunded Payments"
        value={stats.refundedPayments.toLocaleString()}
        subtitle="Refund transactions"
        icon={RefreshCw}
        iconClassName="text-gray-600"
      />
    </div>
  );
});

DetailedPaymentStats.displayName = 'DetailedPaymentStats';

export default PaymentStats;
