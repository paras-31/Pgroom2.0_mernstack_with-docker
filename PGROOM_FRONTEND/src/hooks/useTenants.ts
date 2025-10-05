// filepath: /src/hooks/useTenants.ts

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Tenant } from '@/types/admin';
import { adminTenantService, AdminTenantFilters } from '@/lib/api/services/adminTenantService';
import { isApiSuccessResponse } from '@/lib/types/api';

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  totalRentCollected: number;
  overduePayments: number;
  averageOccupancy: number;
}

export interface TenantFilterOptions {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  propertyFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface TenantPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useTenants = () => {
  const [filters, setFilters] = useState<TenantFilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    paymentFilter: 'all',
    propertyFilter: 'all',
    sortBy: 'joinDate',
    sortOrder: 'asc'
  });

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalRentCollected: 0,
    overduePayments: 0,
    averageOccupancy: 0
  });

  const [uniqueProperties, setUniqueProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<TenantPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch tenants data (using real API)
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare API filters
      const apiFilters: AdminTenantFilters = {
        search: filters.searchTerm || undefined,
        status: filters.statusFilter !== 'all' ? filters.statusFilter as 'active' | 'suspended' : undefined,
        paymentStatus: filters.paymentFilter !== 'all' ? filters.paymentFilter as 'paid' | 'pending' | 'overdue' : undefined,
        property: filters.propertyFilter !== 'all' ? filters.propertyFilter : undefined,
        sortBy: filters.sortBy as 'name' | 'email' | 'joinDate' | 'rentAmount',
        sortOrder: filters.sortOrder,
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Call the admin tenant service
      const response = await adminTenantService.getAllTenants(apiFilters);
      
      if (isApiSuccessResponse(response)) {
        const { data: tenantListResponse } = response;
        
        // Transform API data to frontend Tenant type
        const transformedTenants = tenantListResponse.data.map((apiTenant, index) => ({
          id: apiTenant.userId,
          firstName: apiTenant.user.firstName,
          lastName: apiTenant.user.lastName,
          email: apiTenant.user.email,
          mobileNo: apiTenant.user.mobileNo || '',
          age: 25, // Mock data - would need to calculate from DOB if availablex
          company: 'Tech Corp', // Mock data - would come from user profile
          joinDate: apiTenant.createdAt,
          status: apiTenant.status,
          property: apiTenant.property.name,
          propertyLocation: apiTenant.property.address,
          roomNumber: apiTenant.room.roomNo.toString(),
          rentAmount: parseInt(apiTenant.room.rent.toString()),
          depositAmount: parseInt(apiTenant.room.rent.toString()) * 2, // Mock - usually 2-3 months rent
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
          paymentStatus: (['paid', 'pending', 'overdue'] as const)[index % 3], // Mock payment status
          emergencyContact: {
            name: 'Emergency Contact', // Mock data
            relation: 'Parent',
            phone: '+91 9876543210'
          },
          documents: {
            aadhar: true, // Mock data
            pan: Math.random() > 0.5,
            agreement: true
          },
          rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // Mock rating
          issuesReported: Math.floor(Math.random() * 5), // Mock issues count
          lastPayment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
        }));
        
        setTenants(transformedTenants);
        setStats({
          totalTenants: tenantListResponse.stats.totalTenants,
          activeTenants: tenantListResponse.stats.activeTenants,
          totalRentCollected: tenantListResponse.stats.totalRentCollected,
          overduePayments: tenantListResponse.stats.overduePayments,
          averageOccupancy: tenantListResponse.stats.averageOccupancy
        });
        
        // Extract unique properties from the data
        const properties = Array.from(new Set(transformedTenants.map(t => t.property)));
        setUniqueProperties(properties);
        
        setPagination(prev => ({
          ...prev,
          total: tenantListResponse.meta.total,
          totalPages: tenantListResponse.meta.totalPages
        }));
        
      } else {
        // Handle API error response
        setError(response.message || 'Failed to fetch tenants data');
        toast.error(response.message || 'Failed to load tenants');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tenants data';
      setError(errorMessage);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Since filtering is now done on the API side, we just return the tenants
  // But we keep this for any client-side sorting that might be needed
  const filteredTenants = useMemo(() => {
    // The API already handles filtering and sorting, so we just return the tenants
    return tenants;
  }, [tenants]);

  // Update filters and trigger new API call
  const updateFilters = useCallback((newFilters: Partial<TenantFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change (except when just changing page)
    if (!('page' in newFilters)) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      paymentFilter: 'all',
      propertyFilter: 'all',
      sortBy: 'joinDate',
      sortOrder: 'asc'
    });
  }, []);

  // Delete tenant (using real API)
  const deleteTenant = useCallback(async (tenantId: number) => {
    try {
      const response = await adminTenantService.deleteTenant(tenantId);
      
      if (isApiSuccessResponse(response)) {
        // Remove tenant from local state
        setTenants(prev => prev.filter(t => t.id !== tenantId));
        toast.success('Tenant deleted successfully');
        
        // Refresh data to get updated stats
        fetchTenants();
      } else {
        toast.error(response.message || 'Failed to delete tenant');
      }
    } catch (err) {
      toast.error('Failed to delete tenant');
    }
  }, [fetchTenants]);

  // Update tenant status (using real API)
  const updateTenantStatus = useCallback(async (tenantId: number, status: 'active' | 'suspended') => {
    try {
      const response = await adminTenantService.updateTenantStatus(tenantId, status);
      
      if (isApiSuccessResponse(response)) {
        // Update tenant status in local state
        setTenants(prev => prev.map(t => 
          t.id === tenantId ? { ...t, status } : t
        ));
        toast.success(`Tenant ${status === 'active' ? 'activated' : 'suspended'} successfully`);
        
        // Refresh data to get updated stats
        fetchTenants();
      } else {
        toast.error(response.message || 'Failed to update tenant status');
      }
    } catch (err) {
      toast.error('Failed to update tenant status');
    }
  }, [fetchTenants]);

  // Initial data fetch
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants: filteredTenants,
    stats,
    uniqueProperties,
    filters,
    loading,
    error,
    pagination,
    updateFilters,
    clearFilters,
    deleteTenant,
    fetchTenants,
    setPagination,
    updateTenantStatus
  };
};
