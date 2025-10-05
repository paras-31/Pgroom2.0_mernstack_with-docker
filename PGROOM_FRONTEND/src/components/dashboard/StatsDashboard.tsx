import React, { useEffect, useState } from 'react';
import { Home, Users, DoorOpen, Wallet } from 'lucide-react';
import StatsCard from './StatsCard';
import TenantsList from './TenantsList';
import OccupancyChart from './OccupancyChart';
import MonthlyIncomeChart from './MonthlyIncomeChart';
import { cn } from '@/lib/utils';
import { dashboardService, MonitoringCardsResponse, RecentTenant } from '@/lib/api/services/dashboardService';
import { paymentService } from '@/lib/api/services/paymentService';

interface StatsDashboardProps {
  className?: string;
}

/**
 * StatsDashboard - A dashboard component displaying key statistics, charts, and tenant list
 *
 * This component is designed to be used in the owner dashboard page.
 * It displays key metrics, a monthly income chart, a room occupancy chart,
 * and a list of recent tenants.
 */
const StatsDashboard: React.FC<StatsDashboardProps> = ({
  className,
}) => {
  // State for dashboard data
  const [monitoringData, setMonitoringData] = useState<MonitoringCardsResponse | null>(null);
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<{ name: string; income: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTenantsLoading, setIsTenantsLoading] = useState<boolean>(true);
  const [isMonthlyDataLoading, setIsMonthlyDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use data from API only
  const propertyCount = monitoringData?.totalProperties ?? 0;
  const roomCount = monitoringData?.totalRooms ?? 0;
  const assignedRoomCount = monitoringData?.totalAssignedTenants ?? 0;
  const expectedMonthlyIncome = monitoringData?.expectedMonthlyIncome ?? 0;

  // Fetch monitoring cards data
  useEffect(() => {
    const fetchMonitoringCards = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardService.getMonitoringCards();
        if (response.statusCode === 200) {
          setMonitoringData(response.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('An error occurred while fetching dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitoringCards();
  }, []);

  // Fetch recent tenants data
  useEffect(() => {
    const fetchRecentTenants = async () => {
      try {
        setIsTenantsLoading(true);
        const response = await dashboardService.getRecentTenants();
        if (response.statusCode === 200) {
          setRecentTenants(response.data);
        } else {
          console.error('Failed to fetch recent tenants data');
        }
      } catch (err) {
        console.error('Recent tenants fetch error:', err);
      } finally {
        setIsTenantsLoading(false);
      }
    };

    fetchRecentTenants();
  }, []);

  // Fetch monthly income data
  useEffect(() => {
    const fetchMonthlyIncomeData = async () => {
      try {
        setIsMonthlyDataLoading(true);
        const response = await paymentService.getMonthlyAnalytics();

        // Transform the analytics data to match the chart format
        const chartData = response.map(item => ({
          name: item.month,
          income: item.totalAmount
        }));

        setMonthlyIncomeData(chartData);
      } catch (err) {
        console.error('Monthly income data fetch error:', err);
        // Set empty data on error
        setMonthlyIncomeData([]);
      } finally {
        setIsMonthlyDataLoading(false);
      }
    };

    fetchMonthlyIncomeData();
  }, []);

  // Calculate occupancy rate
  const occupancyRate = roomCount > 0 ? Math.round((assignedRoomCount / roomCount) * 100) : 0;

  // Generate occupancy data based on room counts and assigned tenants
  const generatedOccupancyData = [
    { name: 'Occupied', value: assignedRoomCount, color: 'hsl(var(--primary))', total: roomCount },
    { name: 'Available', value: roomCount - assignedRoomCount, color: '#f59e0b', total: roomCount },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Properties"
          value={propertyCount}
          icon={<Home className="w-5 h-5" />}
          description="Properties managed"
          isLoading={isLoading}
        />

        <StatsCard
          title="Total Rooms"
          value={roomCount}
          icon={<DoorOpen className="w-5 h-5" />}
          description="Available rooms"
          isLoading={isLoading}
        />

        <StatsCard
          title="Total Assigned Tenants"
          value={assignedRoomCount}
          icon={<Users className="w-5 h-5" />}
          description="Active tenants"
          isLoading={isLoading}
        />

        <StatsCard
          title="Expected Monthly Income"
          value={new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(expectedMonthlyIncome)}
          icon={<Wallet className="w-5 h-5" />}
          description="Monthly rental revenue"
          isLoading={isLoading}
        />
      </div>

      {/* Monthly Income Chart - Full width */}
      <div className="mt-8 mb-8">
        <MonthlyIncomeChart data={monthlyIncomeData} />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart - Takes up 1/2 of the width on large screens */}
        <div className="lg:col-span-1 h-full">
          <OccupancyChart
            data={generatedOccupancyData}
            className="h-full"
            isLoading={isLoading}
          />
        </div>

        {/* Tenants List - Takes up 1/2 of the width on large screens */}
        <div className="lg:col-span-1 h-full">
          <TenantsList
            tenants={recentTenants}
            className="h-full"
            isLoading={isTenantsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
