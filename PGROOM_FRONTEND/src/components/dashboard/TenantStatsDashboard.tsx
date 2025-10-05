import React from 'react';
import TenantPaymentAnalytics from '@/components/tenant/TenantPaymentAnalytics';
import TenantInteractiveMonitoringCards from '@/components/tenant/TenantInteractiveMonitoringCards';
import { cn } from '@/lib/utils';

interface TenantStatsDashboardProps {
  className?: string;
}

/**
 * TenantStatsDashboard - A dashboard component displaying key statistics for tenants
 *
 * This component is designed to be used in the tenant dashboard page.
 * It displays key metrics relevant to tenants like rent payments, room details, etc.
 */
const TenantStatsDashboard: React.FC<TenantStatsDashboardProps> = ({
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Interactive Monitoring Cards */}
      <TenantInteractiveMonitoringCards />

      {/* Payment Analytics Section */}
      <TenantPaymentAnalytics className="mt-8" />
    </div>
  );
};

export default TenantStatsDashboard;
