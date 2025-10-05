// filepath: /src/pages/admin/Owners.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Building2, 
  DollarSign, 
  Users, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  TrendingUp,
  Calendar,
  AlertCircle,
  Activity,
  Download
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useOwners } from '@/hooks/useOwners';
import { Owner } from '@/types/admin';
import OwnerFormDialog from '@/components/owner/OwnerFormDialog';

/**
 * AdminOwners - Enhanced owners management page for administrators
 * Features: Owner listing, advanced filtering, status management
 */
const AdminOwners: React.FC = () => {
  
  // Modal states
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
  
  const {
    owners,
    stats,
    uniqueLocations,
    filters,
    loading,
    error,
    pagination,
    updateFilters,
    clearFilters,
    deleteOwner,
    fetchOwners,
    setPagination
  } = useOwners();

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calculate occupancy rate
  const getOccupancyRate = (occupied: number, total: number) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  // Get verification status
  const getVerificationStatus = (documents: { aadhar: boolean; pan: boolean; agreement: boolean }) => {
    const total = Object.keys(documents).length;
    const verified = Object.values(documents).filter(Boolean).length;
    return { verified, total, percentage: Math.round((verified / total) * 100) };
  };

  // Export owners to CSV
  const handleExportOwners = async () => {
    try {
      if (!owners || owners.length === 0) {
        toast.warning('No owners to export');
        return;
      }

      // Create CSV content
      const headers = [
        'Owner ID',
        'Name',
        'Email',
        'Phone',
        'Total Properties',
        'Total Rooms',
        'Occupied Rooms',
        'Monthly Revenue',
        'Occupancy Rate',
        'Status',
        'Join Date'
      ];

      const csvContent = [
        headers.join(','),
        ...owners.map(owner => [
          owner.id,
          `"${owner.firstName} ${owner.lastName}"`,
          owner.email,
          owner.mobileNo,
          owner.totalProperties,
          owner.totalRooms,
          owner.occupiedRooms,
          owner.monthlyRevenue,
          `${getOccupancyRate(owner.occupiedRooms, owner.totalRooms)}%`,
          owner.status,
          new Date().toLocaleDateString() // Using current date as we don't have join date in the owner object
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `owners-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${owners.length} owners successfully`);
    } catch (error) {
      toast.error('Failed to export owners');
      console.error('Export error:', error);
    }
  };

  const handleSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy: column, sortOrder: newSortOrder });
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Owner Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage property owners, track performance, and monitor portfolios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExportOwners}
              disabled={!owners || owners.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddOwnerModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Owner
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOwners}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stats.activeOwners}</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                Across all owners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                Total platform revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageOccupancy}%</div>
              <p className="text-xs text-muted-foreground">
                Platform average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search owners by name, email, or phone..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading owners...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Owner Directory Table */}
        {!loading && !error && (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      Owner Name
                      {filters.sortBy === 'name' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Total Rooms</TableHead>
                    <TableHead>Occupied Rooms</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('revenue')}>
                      Revenue
                      {filters.sortBy === 'revenue' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <div className="font-medium">{owner.firstName} {owner.lastName}</div>
                      </TableCell>
                      <TableCell>
                        <div>{owner.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{owner.mobileNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{owner.totalProperties}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{owner.totalRooms}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{owner.occupiedRooms}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">₹{(owner.monthlyRevenue / 1000).toFixed(0)}K</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getOccupancyRate(owner.occupiedRooms, owner.totalRooms)}%</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(owner.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditOwner(owner)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Owner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && owners.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No owners found</h3>
              <p className="text-muted-foreground mb-4">
                No owners match your current filters. Try adjusting your search criteria.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && !error && owners.length > 0 && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} owners
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Owner Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Owner</DialogTitle>
            <DialogDescription>
              Update owner information
            </DialogDescription>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue={selectedOwner.firstName} />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue={selectedOwner.lastName} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" defaultValue={selectedOwner.email} />
              </div>
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input defaultValue={selectedOwner.mobileNo} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Owner Modal */}
      <OwnerFormDialog
        isOpen={isAddOwnerModalOpen}
        onClose={() => setIsAddOwnerModalOpen(false)}
        onSuccess={() => {
          // Refresh the owners list and stats after successful creation
          fetchOwners();
        }}
      />

    </DashboardLayout>
  );
};

export default AdminOwners;
