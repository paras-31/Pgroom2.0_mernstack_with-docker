import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RecentTenant } from '@/lib/api/services/dashboardService';

interface TenantsListProps {
  tenants: RecentTenant[];
  className?: string;
  isLoading?: boolean;
}

/**
 * TenantsList - A component for displaying a list of recent tenants
 *
 * @param tenants - Array of tenant objects
 * @param className - Optional additional class names
 * @param isLoading - Whether the data is currently loading
 */
const TenantsList: React.FC<TenantsListProps> = ({ tenants, className, isLoading = false }) => {
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to get full name from first and last name
  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Recent Tenants</CardTitle>
      </CardHeader>
      <CardContent className="px-2 h-full">
        <div className="space-y-4">
          {isLoading ? (
            // Loading state - show skeleton loaders
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-center p-2 rounded-lg animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : (
            // Actual content
            tenants.map(tenant => {
              const fullName = getFullName(tenant.firstName, tenant.lastName);
              const isActive = tenant.status.toLowerCase() === 'active';

              return (
                <div key={tenant.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Initials */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">{getInitials(fullName)}</span>
                  </div>

                  {/* Tenant Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {tenant.email}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end ml-2">
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                      )}
                    >
                      {tenant.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}

          {!isLoading && tenants.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No tenants found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantsList;
