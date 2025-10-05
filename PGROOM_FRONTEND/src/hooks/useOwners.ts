// filepath: /src/hooks/useOwners.ts

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Owner, AdminStats, FilterOptions } from '@/types/admin';
import { ownerService, OwnerData, OwnerListResponse, OwnerStatistics } from '@/lib/api/services/ownerService';
import { isApiSuccessResponse } from '@/lib/types/api';

// Transform API data to match the Owner interface
const transformOwnerData = (apiOwner: OwnerData): Owner => ({
  id: apiOwner.id,
  firstName: apiOwner.firstName,
  lastName: apiOwner.lastName,
  email: apiOwner.email,
  mobileNo: apiOwner.mobileNo,
  address: apiOwner.address,
  stateId: apiOwner.stateId,
  cityId: apiOwner.cityId,
  status: apiOwner.status === 'inactive' ? 'pending' : apiOwner.status as 'active' | 'pending' | 'suspended',
  joinDate: apiOwner.joinDate,
  verified: apiOwner.verified,
  rating: apiOwner.rating,
  totalProperties: apiOwner.totalProperties,
  totalRooms: apiOwner.totalRooms,
  occupiedRooms: apiOwner.occupiedRooms,
  monthlyRevenue: apiOwner.monthlyRevenue,
  properties: [], // This would need to be populated separately if needed
  recentActivity: 'Active', // This would come from activity tracking
  documents: {
    aadhar: true,
    pan: true,
    agreement: true
  }
});

export const useOwners = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    locationFilter: 'all',
    sortBy: 'joinDate',
    sortOrder: 'asc'
  });

  const [owners, setOwners] = useState<Owner[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalOwners: 0,
    activeOwners: 0,
    totalProperties: 0,
    totalRevenue: 0,
    averageOccupancy: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });

  // Fetch owners data
  const fetchOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ownerService.getOwners({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          search: filters.searchTerm || undefined,
          status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
        }
      });

      if (isApiSuccessResponse(response)) {
        const transformedOwners = response.data.data.map(transformOwnerData);
        setOwners(transformedOwners);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.meta.totalPages,
          total: response.data.meta.total
        }));
      } else {
        setError(response.message || 'Failed to fetch owners');
        toast.error(response.message || 'Failed to fetch owners');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch owners';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters.searchTerm, filters.statusFilter, pagination.page, pagination.limit]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await ownerService.getOwnerStatistics();
      
      if (isApiSuccessResponse(response)) {
        setStats(response.data);
      } else {
        console.error('Failed to fetch owner statistics:', response.message);
      }
    } catch (err) {
      console.error('Failed to fetch owner statistics:', err);
    }
  }, []);

  // Filter and sort owners (client-side for search and location filters)
  const filteredOwners = useMemo(() => {
    let filtered = [...owners];

    // Location filter (client-side)
    if (filters.locationFilter !== 'all') {
      filtered = filtered.filter(owner => 
        owner.address.toLowerCase().includes(filters.locationFilter.toLowerCase())
      );
    }

    // Sort functionality
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate);
          bValue = new Date(b.joinDate);
          break;
        case 'revenue':
          aValue = a.monthlyRevenue;
          bValue = b.monthlyRevenue;
          break;
        case 'properties':
          aValue = a.totalProperties;
          bValue = b.totalProperties;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [owners, filters]);

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(owners.map(owner => 
      owner.address.split(',')[1]?.trim() || owner.address.split(',')[0]?.trim()
    )));
  }, [owners]);

  // Update filters
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Reset page when filters change
    if (newFilters.searchTerm !== undefined || newFilters.statusFilter !== undefined) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      locationFilter: 'all',
      sortBy: 'joinDate',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Owner status actions
  const suspendOwner = async (ownerId: number) => {
    setLoading(true);
    try {
      const response = await ownerService.updateOwnerStatus({
        ownerId,
        status: 'Suspended'
      });

      if (isApiSuccessResponse(response)) {
        toast.success('Owner suspended successfully');
        fetchOwners(); // Refresh the data
      } else {
        toast.error(response.message || 'Failed to suspend owner');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to suspend owner';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activateOwner = async (ownerId: number) => {
    setLoading(true);
    try {
      const response = await ownerService.updateOwnerStatus({
        ownerId,
        status: 'Active'
      });

      if (isApiSuccessResponse(response)) {
        toast.success('Owner activated successfully');
        fetchOwners(); // Refresh the data
      } else {
        toast.error(response.message || 'Failed to activate owner');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate owner';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteOwner = async (ownerId: number) => {
    setLoading(true);
    try {
      // For now, we'll treat delete as suspending the owner
      // In a real system, you might want a separate delete endpoint
      const response = await ownerService.updateOwnerStatus({
        ownerId,
        status: 'Inactive'
      });

      if (isApiSuccessResponse(response)) {
        toast.success('Owner deactivated successfully');
        fetchOwners(); // Refresh the data
      } else {
        toast.error(response.message || 'Failed to deactivate owner');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate owner';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOwners();
    fetchStats();
  }, [fetchOwners, fetchStats]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.searchTerm !== undefined) {
        fetchOwners();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.searchTerm, fetchOwners]);

  return {
    owners: filteredOwners,
    stats,
    uniqueLocations,
    filters,
    loading,
    error,
    pagination,
    updateFilters,
    clearFilters,
    suspendOwner,
    activateOwner,
    deleteOwner,
    fetchOwners,
    setPagination
  };
};
