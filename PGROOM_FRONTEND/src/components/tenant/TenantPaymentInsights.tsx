/**
 * TenantPaymentInsights Component
 *
 * A compact payment insights component for tenant dashboard displaying
 * quick payment highlights and key metrics with visual indicators.
 * Designed to complement the main payment analytics component.
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTenantPayments } from '@/hooks/useTenantPayments';

interface TenantPaymentInsightsProps {
  className?: string;
  variant?: 'full' | 'compact';
}

/**
 * TenantPaymentInsights - Compact payment insights component
 * 
 * Features:
 * - Payment streak counter
 * - On-time payment rate
 * - Monthly progress indicator
 * - Payment health score
 * - Quick stats with animations
 */
const TenantPaymentInsights: React.FC<TenantPaymentInsightsProps> = ({
  className,
  variant = 'full'
}) => {
  const {
    payments,
    stats,
    roomDetails,
    isLoading
  } = useTenantPayments();

  // Calculate insights
  const insights = useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        paymentStreak: 0,
        onTimeRate: 0,
        monthlyProgress: 0,
        healthScore: 0,
        totalPaid: 0,
        avgDaysEarly: 0
      };
    }

    const successfulPayments = payments.filter(p => p.status === 'Captured');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate payment streak
    let paymentStreak = 0;
    for (let i = 0; i < 12; i++) {
      const checkMonth = currentMonth - i;
      const checkYear = checkMonth < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = checkMonth < 0 ? checkMonth + 12 : checkMonth;
      
      const monthKey = `${checkYear}-${(adjustedMonth + 1).toString().padStart(2, '0')}`;
      const hasPayment = payments.some(p => {
        const paymentMonth = new Date(p.createdAt).toISOString().slice(0, 7);
        return paymentMonth === monthKey && p.status === 'Captured';
      });

      if (hasPayment) {
        paymentStreak++;
      } else {
        break;
      }
    }

    // Calculate on-time payment rate
    const onTimePayments = successfulPayments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate.getDate() <= 5; // On-time if paid by 5th
    });
    const onTimeRate = successfulPayments.length > 0 
      ? Math.round((onTimePayments.length / successfulPayments.length) * 100)
      : 0;

    // Calculate monthly progress (current month)
    const monthlyRent = roomDetails ? parseFloat(roomDetails.rent.toString()) : 0;
    const currentMonthKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    const currentMonthPayments = payments.filter(p => {
      const paymentMonth = new Date(p.createdAt).toISOString().slice(0, 7);
      return paymentMonth === currentMonthKey && p.status === 'Captured';
    });
    const currentMonthPaid = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyProgress = monthlyRent > 0 ? Math.min((currentMonthPaid / monthlyRent) * 100, 100) : 0;

    // Calculate health score (combination of streak, on-time rate, and consistency)
    const healthScore = Math.round((
      (Math.min(paymentStreak, 12) / 12) * 40 + // Streak contributes 40%
      (onTimeRate / 100) * 40 + // On-time rate contributes 40%
      (successfulPayments.length >= 3 ? 20 : (successfulPayments.length / 3) * 20) // Payment history contributes 20%
    ));

    // Calculate total paid
    const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate average days early
    const daysEarly = onTimePayments.map(payment => {
      const paymentDate = new Date(payment.createdAt);
      return 5 - paymentDate.getDate(); // Days before the 5th
    });
    const avgDaysEarly = daysEarly.length > 0 
      ? Math.round(daysEarly.reduce((sum, days) => sum + Math.max(days, 0), 0) / daysEarly.length)
      : 0;

    return {
      paymentStreak,
      onTimeRate,
      monthlyProgress,
      healthScore,
      totalPaid,
      avgDaysEarly
    };
  }, [payments, roomDetails]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get health score color and icon
  const getHealthScoreDetails = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle,
        label: 'Excellent'
      };
    } else if (score >= 60) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: Clock,
        label: 'Good'
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle,
        label: 'Needs Improvement'
      };
    }
  };

  const healthDetails = getHealthScoreDetails(insights.healthScore);
  const HealthIcon = healthDetails.icon;

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", variant === 'compact' ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: variant === 'compact' ? 2 : 4 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("grid grid-cols-2 gap-4", className)}>
        {/* Payment Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {insights.paymentStreak}
                </p>
                <p className="text-xs text-muted-foreground">months</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </motion.div>

        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={cn("p-4 hover:shadow-lg transition-all duration-300", healthDetails.bgColor)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className={cn("text-2xl font-bold", healthDetails.color)}>
                  {insights.healthScore}%
                </p>
                <p className={cn("text-xs", healthDetails.color)}>{healthDetails.label}</p>
              </div>
              <HealthIcon className={cn("h-8 w-8", healthDetails.color)} />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4", className)}>
      {/* Payment Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-6 w-6 text-orange-600" />
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {insights.paymentStreak > 6 ? 'Hot Streak!' : 'Active'}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Streak</h3>
          <p className="text-3xl font-bold text-orange-600 mb-1">
            {insights.paymentStreak}
          </p>
          <p className="text-sm text-muted-foreground">
            consecutive months
          </p>
        </Card>
      </motion.div>

      {/* On-Time Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            {insights.onTimeRate >= 80 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Excellent
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">On-Time Rate</h3>
          <p className="text-3xl font-bold text-green-600 mb-1">
            {insights.onTimeRate}%
          </p>
          <p className="text-sm text-muted-foreground">
            paid by 5th of month
          </p>
        </Card>
      </motion.div>

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-6 w-6 text-blue-600" />
            {insights.monthlyProgress >= 100 && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Complete
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">This Month</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(insights.monthlyProgress)}%
          </p>
          <Progress 
            value={insights.monthlyProgress} 
            className="h-2 mb-1" 
          />
          <p className="text-sm text-muted-foreground">
            rent progress
          </p>
        </Card>
      </motion.div>

      {/* Payment Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className={cn("p-6 hover:shadow-lg transition-all duration-300 border-l-4", 
          insights.healthScore >= 80 ? 'border-l-green-500' : 
          insights.healthScore >= 60 ? 'border-l-yellow-500' : 'border-l-red-500')}>
          <div className="flex items-center justify-between mb-2">
            <HealthIcon className={cn("h-6 w-6", healthDetails.color)} />
            <Badge variant="outline" className={cn("border-opacity-30", healthDetails.color)}>
              {healthDetails.label}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Health Score</h3>
          <p className={cn("text-3xl font-bold mb-1", healthDetails.color)}>
            {insights.healthScore}%
          </p>
          <p className="text-sm text-muted-foreground">
            payment reliability
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default memo(TenantPaymentInsights);
