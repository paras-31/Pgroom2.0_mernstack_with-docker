import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface IncomeChartProps {
  data: {
    name: string;
    expected: number;
    actual: number;
  }[];
  className?: string;
}

/**
 * IncomeChart - A component for displaying expected vs actual income
 * 
 * @param data - Array of data points with name, expected, and actual values
 * @param className - Optional additional class names
 */
const IncomeChart: React.FC<IncomeChartProps> = ({ data, className }) => {
  // Chart configuration for colors
  const chartConfig = {
    expected: {
      label: "Expected Income",
      theme: {
        light: "#10b981", // Green color for expected income
        dark: "#34d399",
      },
    },
    actual: {
      label: "Actual Income",
      theme: {
        light: "#3b82f6", // Blue color for actual income
        dark: "#60a5fa",
      },
    },
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Income Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={12}
                stroke="#888888"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => `₹${value / 1000}k`}
                stroke="#888888"
              />
              <Bar
                dataKey="expected"
                fill="var(--color-expected)"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="actual"
                fill="var(--color-actual)"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => formatCurrency(value)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeChart;
