import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

/**
 * Props for the MonthlyIncomeChart component
 *
 * @property data - Array of data points with month name and income value
 * @property className - Optional additional class names
 * @property title - Optional chart title (defaults to "Monthly Income")
 * @property description - Optional chart description (defaults to "January - June dynamic year")
 */
interface MonthlyIncomeChartProps {
  data: {
    name: string;
    income: number;
  }[];
  className?: string;
  title?: string;
  description?: string;
}

/**
 * MonthlyIncomeChart - A component for displaying monthly income data
 *
 * This component uses the ChartContainer from the UI library to ensure
 * proper theming and responsive behavior. The chart is optimized to fit
 * properly in its container and follows modern React best practices.
 *
 * @param props - Component props
 * @returns A React component
 */
const MonthlyIncomeChart: React.FC<MonthlyIncomeChartProps> = ({
  data,
  className,
  title = "Monthly Income",
  description = `January - December 2025`
}) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Memoize chart configuration to prevent unnecessary re-renders
  const chartConfig = useMemo<ChartConfig>(() => ({
    income: {
      label: "Expected Monthly Income",
      theme: {
        light: "hsl(var(--primary))", // Use the primary green color from theme
        dark: "hsl(var(--primary))",  // Same for dark mode
      },
    },
  }), []);

  // Memoize the formatter function to prevent unnecessary re-renders
  const currencyFormatter = useMemo(() => (
    (value: number): string => formatCurrency(value)
  ), []);

  // Error handling for empty data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("shadow-md", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Use a responsive container that adapts to its parent */}
        <div className="w-full h-[300px]">
          {/* Override the aspect-video class that's causing the fitting issue */}
          <ChartContainer
            config={chartConfig}
            className="!aspect-auto h-full w-full overflow-visible"
          >
            <BarChart
              data={data}
              // Adjust margins to ensure chart fits properly
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              barSize={90}
              barGap={1}
              barCategoryGap={1}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // Format month names to show only first 3 characters
                tickFormatter={(value) => value.slice(0, 3)}
                // Ensure X-axis fits properly
                padding={{ left: 10, right: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={currencyFormatter}
                    hideLabel={false}
                  />
                }
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[8, 8, 0, 0]}
                // Add accessibility attributes
                role="graphics-symbol"
                aria-label="Monthly income data"
                // Ensure bars are properly sized
                maxBarSize={80}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(MonthlyIncomeChart);
