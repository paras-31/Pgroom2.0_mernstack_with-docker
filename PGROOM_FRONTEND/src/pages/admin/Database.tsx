// filepath: /src/pages/admin/Database.tsx
import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, Check, X, Activity, HardDrive, Clock, Users } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for database status
const mockDatabaseStats = {
  totalSize: '2.4 GB',
  availableSpace: '15.6 GB',
  totalConnections: 45,
  activeConnections: 12,
  uptime: '15 days, 6 hours',
  lastBackup: '2023-12-05 03:00:00',
  backupSize: '2.1 GB',
  avgResponseTime: '45ms'
};

// Mock data for backup history
const mockBackups = [
  {
    id: 1,
    filename: 'pgroom_backup_2023_12_05.sql',
    size: '2.1 GB',
    createdAt: '2023-12-05 03:00:00',
    type: 'scheduled',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 2,
    filename: 'pgroom_backup_2023_12_04.sql',
    size: '2.0 GB',
    createdAt: '2023-12-04 03:00:00',
    type: 'scheduled',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 3,
    filename: 'pgroom_backup_2023_12_03.sql',
    size: '1.9 GB',
    createdAt: '2023-12-03 03:00:00',
    type: 'manual',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 4,
    filename: 'pgroom_backup_2023_12_02.sql',
    size: '1.8 GB',
    createdAt: '2023-12-02 03:00:00',
    type: 'scheduled',
    status: 'failed',
    downloadUrl: null
  }
];

// Mock data for table statistics
const mockTableStats = [
  { name: 'users', rowCount: 1250, size: '125 MB', lastUpdated: '2023-12-05 14:30:00' },
  { name: 'properties', rowCount: 180, size: '45 MB', lastUpdated: '2023-12-05 12:15:00' },
  { name: 'rooms', rowCount: 3240, size: '280 MB', lastUpdated: '2023-12-05 11:45:00' },
  { name: 'payments', rowCount: 8950, size: '680 MB', lastUpdated: '2023-12-05 10:20:00' },
  { name: 'bookings', rowCount: 4520, size: '320 MB', lastUpdated: '2023-12-05 09:30:00' },
  { name: 'reviews', rowCount: 2180, size: '85 MB', lastUpdated: '2023-12-05 08:15:00' }
];

/**
 * AdminDatabase - Database management and monitoring page for administrators
 * Features: Database stats, backup management, table monitoring, maintenance tools
 */
const AdminDatabase: React.FC = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // Simulate backup creation
    setTimeout(() => {
      setIsCreatingBackup(false);
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.completed}>
        {status === 'completed' && <Check className="w-3 h-3 mr-1" />}
        {status === 'failed' && <X className="w-3 h-3 mr-1" />}
        {status === 'running' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <Badge variant="outline" className={styles[type as keyof typeof styles] || styles.scheduled}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Calculate database usage percentage
  const totalSizeGB = parseFloat(mockDatabaseStats.totalSize.replace(' GB', ''));
  const availableSizeGB = parseFloat(mockDatabaseStats.availableSpace.replace(' GB', ''));
  const usedPercentage = Math.round((totalSizeGB / (totalSizeGB + availableSizeGB)) * 100);

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Database Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor database health, manage backups, and perform maintenance
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateBackup} 
              disabled={isCreatingBackup}
              className="flex items-center gap-2"
            >
              {isCreatingBackup ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </Button>
          </div>
        </div>

        {/* Database Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDatabaseStats.totalSize}</div>
              <div className="mt-2">
                <Progress value={usedPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {usedPercentage}% used, {mockDatabaseStats.availableSpace} available
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDatabaseStats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                of {mockDatabaseStats.totalConnections} total connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15d</div>
              <p className="text-xs text-muted-foreground">
                {mockDatabaseStats.uptime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockDatabaseStats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Database Management Tabs */}
        <Tabs defaultValue="backups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Backup Management */}
          <TabsContent value="backups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Backup Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Last Backup</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(mockDatabaseStats.lastBackup).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Size: {mockDatabaseStats.backupSize}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBackups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-medium">{backup.filename}</TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>{getTypeBadge(backup.type)}</TableCell>
                          <TableCell>{getStatusBadge(backup.status)}</TableCell>
                          <TableCell>
                            {new Date(backup.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {backup.downloadUrl && (
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this backup? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table Statistics */}
          <TabsContent value="tables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Table Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table Name</TableHead>
                        <TableHead>Row Count</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTableStats.map((table) => (
                        <TableRow key={table.name}>
                          <TableCell className="font-medium">{table.name}</TableCell>
                          <TableCell>{table.rowCount.toLocaleString()}</TableCell>
                          <TableCell>{table.size}</TableCell>
                          <TableCell>
                            {new Date(table.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tools */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Database Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Optimize Tables
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Optimize database tables to improve performance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Rebuild Indexes
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Rebuild database indexes for better query performance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Clean Orphaned Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Remove orphaned records and clean up database
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Restore from Backup
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Restore database from a previous backup
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Export specific data sets for analysis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Reset Database
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Database</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will completely reset the database and remove all data. 
                            This action cannot be undone. Are you sure you want to proceed?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Reset Database</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-sm text-muted-foreground">
                      ⚠️ This will permanently delete all data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDatabase;
