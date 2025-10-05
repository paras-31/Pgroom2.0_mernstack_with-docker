/**
 * TenantInteractiveMonitoringCards Component
 *
 * Modern, animated monitoring cards for tenant dashboard that display payment analytics
 * and room information with a consistent design matching the Payment Analytics section.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  CreditCard,
  IndianRupee,
  Activity,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTenantPayments } from '@/hooks/useTenantPayments';

interface TenantInteractiveMonitoringCardsProps {
  className?: string;
}

interface CardStatus {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface MonitoringCard {
  id: string;
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  additionalInfo?: string | null;
  status?: CardStatus;
}

/**
 * TenantInteractiveMonitoringCards - Modern monitoring cards with analytics
 * 
 * Features:
 * - Elegant cards displaying key tenant information
 * - Integrated payment analytics data
 * - Animated transitions and visual feedback
 * - Consistent design with Payment Analytics
 * - Real-time data updates
 */
const TenantInteractiveMonitoringCards: React.FC<TenantInteractiveMonitoringCardsProps> = ({
  className
}) => {
  const {
    roomDetails,
    stats,
    payments,
    isLoading,
    error
  } = useTenantPayments();

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get last payment information
  const getLastPaymentInfo = () => {
    if (!payments || payments.length === 0) return null;
    const successfulPayments = payments.filter(payment => payment.status === 'Captured');
    return successfulPayments.length > 0 ? successfulPayments[0] : null;
  };

  // Calculate payment streak
  const calculatePaymentStreak = () => {
    if (!payments || payments.length === 0) return 0;
    
    let streak = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

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
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const lastPayment = getLastPaymentInfo();
  const paymentStreak = calculatePaymentStreak();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6 border-l-4 border-l-gray-300 h-[140px] flex items-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const cards: MonitoringCard[] = [
    {
      id: 'room',
      title: 'My Room',
      value: roomDetails?.roomNo ? `Room ${roomDetails.roomNo}` : '-',
      description: '',
      icon: <Home className="w-8 h-8" />,
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      additionalInfo: null
    },
    {
      id: 'rent',
      title: 'Monthly Rent',
      value: roomDetails ? formatCurrency(parseFloat(roomDetails.rent.toString())) : '-',
      description: stats?.currentMonthPaid ? 'Paid this month' : 'Payment pending',
      icon: <IndianRupee className="w-8 h-8" />,
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      additionalInfo: null
    },
    {
      id: 'payment',
      title: 'Last Payment',
      value: lastPayment ? formatCurrency(lastPayment.amount) : '-',
      description: lastPayment ? `Paid on ${formatDate(lastPayment.createdAt)}` : 'No payments yet',
      icon: <CreditCard className="w-8 h-8" />,
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
      additionalInfo: null
    },
    {
      id: 'due',
      title: 'Next Due Date',
      value: stats?.nextDueDate ? formatDate(stats.nextDueDate) : '-',
      description: stats?.isOverdue ? 'Payment overdue' : 'Upcoming payment',
      icon: <Calendar className="w-8 h-8" />,
      iconColor: stats?.isOverdue ? 'text-red-600' : 'text-orange-600',
      borderColor: stats?.isOverdue ? 'border-l-red-500' : 'border-l-orange-500',
      additionalInfo: null
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Key metrics for your accommodation and payments
            </p>
          </div>
        </div>
      </motion.div>

      {/* Interactive Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
          >
            <Card className={cn("p-6 border-l-4 h-[140px] flex items-center", card.borderColor)}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    {card.status && (
                      <Badge variant={card.status.variant} className="text-xs">
                        {card.status.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                  {card.description && (
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  )}
                  {card.additionalInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.additionalInfo}
                    </p>
                  )}
                </div>
                <div className={card.iconColor}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TenantInteractiveMonitoringCards;
