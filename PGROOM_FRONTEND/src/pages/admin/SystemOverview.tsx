import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const AdminSystemOverview = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockMetrics: SystemMetric[] = [
      { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', trend: 'stable' },
      { name: 'Memory Usage', value: 68, unit: '%', status: 'warning', trend: 'up' },
      { name: 'Disk Usage', value: 23, unit: '%', status: 'healthy', trend: 'down' },
      { name: 'Network I/O', value: 156, unit: 'MB/s', status: 'healthy', trend: 'up' },
      { name: 'Database Connections', value: 42, unit: '', status: 'healthy', trend: 'stable' },
      { name: 'Response Time', value: 89, unit: 'ms', status: 'healthy', trend: 'down' },
    ];

    const mockAlerts: SystemAlert[] = [
      {
        id: 1,
        type: 'warning',
        message: 'Memory usage approaching 70% threshold',
        timestamp: '2024-07-04 10:30 AM',
        resolved: false,
      },
      {
        id: 2,
        type: 'info',
        message: 'Scheduled maintenance completed successfully',
        timestamp: '2024-07-04 09:15 AM',
        resolved: true,
      },
      {
        id: 3,
        type: 'error',
        message: 'Failed login attempts detected from suspicious IP',
        timestamp: '2024-07-04 08:45 AM',
        resolved: false,
      },
    ];

    setTimeout(() => {
      setSystemMetrics(mockMetrics);
      setSystemAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string, status: string) => {
    const colorClass = getStatusColor(status);
    switch (trend) {
      case 'up':
        return <TrendingUp className={cn("w-4 h-4", colorClass)} />;
      case 'down':
        return <TrendingUp className={cn("w-4 h-4 rotate-180", colorClass)} />;
      default:
        return <Activity className={cn("w-4 h-4", colorClass)} />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <DashboardLayout
      navbar={<AdminNavbar />}
      sidebar={<AdminSidebar />}
    >
      <div className="w-full px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              System Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor system health, performance metrics, and alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">System Online</span>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Status</p>
                  <p className="text-xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Database</p>
                  <p className="text-xl font-bold text-blue-600">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-xl font-bold">67</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-xl font-bold">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.name}</span>
                        {getTrendIcon(metric.trend, metric.status)}
                      </div>
                      <span className={cn("font-semibold", getStatusColor(metric.status))}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={metric.name === 'Network I/O' || metric.name === 'Response Time' ? 75 : metric.value} 
                        className="h-2"
                      />
                      <div 
                        className={cn(
                          "absolute top-0 left-0 h-2 rounded-full transition-all",
                          getProgressColor(metric.status)
                        )}
                        style={{ 
                          width: `${metric.name === 'Network I/O' || metric.name === 'Response Time' ? 75 : metric.value}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-0.5"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : systemAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent alerts
                  </div>
                ) : (
                  systemAlerts.map((alert) => (
                    <div key={alert.id} className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg",
                      alert.resolved ? "opacity-60" : ""
                    )}>
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium flex-1">{alert.message}</p>
                          <Badge className={cn("text-xs", getAlertBadgeColor(alert.type))}>
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Restart Services</p>
                      <p className="text-sm text-muted-foreground">Restart all system services</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Database Backup</p>
                      <p className="text-sm text-muted-foreground">Create manual backup</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">View Logs</p>
                      <p className="text-sm text-muted-foreground">Access system logs</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode</p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSystemOverview;
