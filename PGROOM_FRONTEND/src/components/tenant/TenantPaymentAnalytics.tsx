/**
 * TenantPaymentAnalytics Component
 *
 * A comprehensive payment analytics component for tenant dashboard displaying
 * payment insights, trends, and summaries using charts and visual indicators.
 * Built following the existing design patterns and maintaining UX consistency.
 */

import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantPayments } from '@/hooks/useTenantPayments';
import { Payment } from '@/lib/types/payment';

interface TenantPaymentAnalyticsProps {
  className?: string;
}

interface PaymentTrend {
  month: string;
  amount: number;
  count: number;
  status: 'Captured' | 'Pending' | 'Failed';
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}



/**
 * TenantPaymentAnalytics - Payment analytics dashboard component for tenants
 * 
 * Features:
 * - Payment trends visualization
 * - Status distribution pie chart
 * - Monthly payment progress
 * - Payment insights cards
 * - Real-time data updates
 */
const TenantPaymentAnalytics: React.FC<TenantPaymentAnalyticsProps> = ({
  className
}) => {
  const {
    payments,
    stats,
    roomDetails,
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

  // Process payment data for analytics
  const analyticsData = useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        monthlyTrends: [],
        statusDistribution: [],
        insights: {
          totalPaid: 0,
          averagePayment: 0,
          onTimePayments: 0,
          paymentStreak: 0
        }
      };
    }

    // Generate monthly trends (last 6 months)
    const monthlyData: { [key: string]: PaymentTrend } = {};
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        amount: 0,
        count: 0,
        status: 'Captured'
      };
    }

    // Process payments
    const successfulPayments = payments.filter(p => p.status === 'Captured');
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const failedPayments = payments.filter(p => p.status === 'Failed');

    // Populate monthly data
    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = paymentDate.toISOString().slice(0, 7);
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].amount += payment.amount;
        monthlyData[monthKey].count += 1;
      }
    });

    const monthlyTrends = Object.values(monthlyData);

    // Status distribution
    const statusDistribution: PaymentStatusData[] = [
      {
        name: 'Successful',
        value: successfulPayments.length,
        color: '#10b981' // Green
      },
      {
        name: 'Pending',
        value: pendingPayments.length,
        color: '#f59e0b' // Yellow
      },
      {
        name: 'Failed',
        value: failedPayments.length,
        color: '#ef4444' // Red
      }
    ].filter(item => item.value > 0);

    // Calculate insights
    const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const averagePayment = successfulPayments.length > 0 ? totalPaid / successfulPayments.length : 0;
    
    // Calculate on-time payments (payments made by 5th of the month)
    const onTimePayments = successfulPayments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate.getDate() <= 5;
    }).length;

    // Calculate payment streak (consecutive months with payments)
    let paymentStreak = 0;
    const currentMonth = new Date().getMonth();
    const currentMonthYear = new Date().getFullYear();

    for (let i = 0; i < 12; i++) {
      const checkMonth = currentMonth - i;
      const checkYear = checkMonth < 0 ? currentMonthYear - 1 : currentMonthYear;
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

    return {
      monthlyTrends,
      statusDistribution,
      insights: {
        totalPaid,
        averagePayment,
        onTimePayments,
        paymentStreak
      }
    };
  }, [payments]);

  // Chart configurations
  const trendChartConfig: ChartConfig = {
    amount: {
      label: "Payment Amount",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))",
      },
    },
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </Card>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load payment analytics</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // No data state
  if (!payments || payments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Payment Data</h3>
            <p className="text-muted-foreground text-sm">
              Start making payments to see your analytics here
            </p>
          </div>
        </div>
      </Card>
    );
  }

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
            <h2 className="text-2xl font-bold text-foreground">Payment Performance</h2>
            <p className="text-muted-foreground">
              Detailed payment history and financial trends
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Payment Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 6 months payment activity
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer 
                  config={trendChartConfig}
                  className="!aspect-auto h-full w-full overflow-visible"
                >
                  <AreaChart 
                    data={analyticsData.monthlyTrends}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false}
                      axisLine={false}
                      className="text-sm"
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      tickLine={false}
                      axisLine={false}
                      className="text-sm"
                      width={60}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "Amount"
                          ]}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Payment Status
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of payment statuses
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analyticsData.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: data.color }}
                                    />
                                    <span className="font-medium">{data.name}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {data.value} payments
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No status data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(TenantPaymentAnalytics);
