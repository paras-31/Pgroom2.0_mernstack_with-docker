// filepath: /src/pages/admin/Tenants.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Edit, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  TrendingUp,
  AlertCircle,
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
import { useTenants } from '@/hooks/useTenants';
import { Tenant } from '@/types/admin';
import TenantFormDialog from '@/components/tenant/TenantFormDialog';

/**
 * AdminTenants - Enhanced tenants management page for administrators
 * Features: Tenant listing, advanced filtering, status management
 */
const AdminTenants: React.FC = () => {
  
  // Modal states
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  
  const {
    tenants,
    stats,
    uniqueProperties,
    filters,
    loading,
    error,
    pagination,
    updateFilters,
    clearFilters,
    fetchTenants,
    setPagination
  } = useTenants();

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.active}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Payment status badge styling
  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get verification status
  const getVerificationStatus = (documents: { aadhar: boolean; pan: boolean; agreement: boolean }) => {
    const total = Object.keys(documents).length;
    const verified = Object.values(documents).filter(Boolean).length;
    return { verified, total, percentage: Math.round((verified / total) * 100) };
  };

  // Export tenants to CSV
  const handleExportTenants = async () => {
    try {
      if (!tenants || tenants.length === 0) {
        toast.warning('No tenants to export');
        return;
      }

      // Create CSV content
      const headers = [
        'Tenant ID',
        'Name',
        'Email',
        'Phone',
        'Property',
        'Room',
        'Rent Amount',
        'Status',
        'Payment Status',
        'Join Date',
        'Documents Verified'
      ];

      const csvContent = [
        headers.join(','),
        ...tenants.map(tenant => [
          tenant.id,
          `"${tenant.firstName} ${tenant.lastName}"`,
          tenant.email,
          tenant.mobileNo,
          `"${tenant.property}"`,
          tenant.roomNumber,
          tenant.rentAmount,
          tenant.status,
          tenant.paymentStatus,
          new Date(tenant.joinDate).toLocaleDateString(),
          `${Object.values(tenant.documents).filter(Boolean).length}/${Object.keys(tenant.documents).length}`
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tenants-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${tenants.length} tenants successfully`);
    } catch (error) {
      toast.error('Failed to export tenants');
      console.error('Export error:', error);
    }
  };

  const handleSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy: column, sortOrder: newSortOrder });
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tenant Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage tenants, track payments, and monitor occupancy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportTenants}
              disabled={!tenants || tenants.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddTenantModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stats.activeTenants}</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rent Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalRentCollected / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
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
                Current occupancy
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
                  placeholder="Search tenants by name, email, phone, or room..."
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
              <p className="text-muted-foreground">Loading tenants...</p>
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

        {/* Tenant Directory Table */}
        {!loading && !error && (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      Tenant Name
                      {filters.sortBy === 'name' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('rentAmount')}>
                      Rent Amount
                      {filters.sortBy === 'rentAmount' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                        <div className="text-sm text-muted-foreground">{tenant.occupation}</div>
                      </TableCell>
                      <TableCell>
                        <div>{tenant.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{tenant.mobileNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tenant.property}</div>
                        <div className="text-sm text-muted-foreground">{tenant.propertyLocation}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tenant.roomNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">₹{(tenant.rentAmount / 1000).toFixed(0)}K</div>
                      </TableCell>
                      <TableCell>
                        {getPaymentBadge(tenant.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tenant.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTenant(tenant)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Tenant
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
        {!loading && !error && tenants.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
              <p className="text-muted-foreground mb-4">
                No tenants match your current filters. Try adjusting your search criteria.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && !error && tenants.length > 0 && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tenants
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

      {/* Edit Tenant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue={selectedTenant.firstName} />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue={selectedTenant.lastName} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" defaultValue={selectedTenant.email} />
              </div>
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input defaultValue={selectedTenant.mobileNo} />
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

      {/* Add Tenant Modal */}
      <TenantFormDialog
        isOpen={isAddTenantModalOpen}
        onClose={() => setIsAddTenantModalOpen(false)}
        onSuccess={() => {
          // Refresh the tenants list and stats after successful creation
          fetchTenants();
        }}
      />

    </DashboardLayout>
  );
};

export default AdminTenants;
