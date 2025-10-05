import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, MapPin, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, State, City } from '@/contexts/LocationContext';

// Layout components
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Property components
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import PropertyDialog from '@/components/property/PropertyDialog';
import DeletePropertyDialog from '@/components/property/DeletePropertyDialog';

// API and types
import { propertyService } from '@/lib/api/services';
import { Property, PropertyCreateData, PropertyUpdateData, PropertyStatusUpdateData } from '@/lib/types/property';
import { isApiSuccessResponse } from '@/lib/types/api';

/**
 * Properties - Owner's property management page
 *
 * This page allows property owners to view, add, edit, and delete their properties.
 */
const Properties: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // State for location filters
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // State for status filter
  const [selectedStatus, setSelectedStatus] = useState<string>('Active'); // Default to 'Active'

  // Get location data
  const { states, getCitiesByStateId, loadCities } = useLocation();

  // State for property dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Invalidate query when limit changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }, [limit, queryClient]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      setIsLoadingCities(true);
      setSelectedCityId(null); // Reset city selection when state changes

      // First check if we already have the cities for this state
      const existingCities = getCitiesByStateId(selectedStateId);
      if (existingCities.length > 0) {
        setStateCities(existingCities);
        setIsLoadingCities(false);

        // If there are no cities (only the placeholder), show a toast
        if (existingCities.length === 1 && existingCities[0].id === 0) {
          toast.info('No cities available for the selected state');
        }
      } else {
        // If not, load them
        loadCities(selectedStateId).then(cityData => {
          setStateCities(cityData);
          setIsLoadingCities(false);

          // If there are no cities, show a toast
          if (cityData.length === 1 && cityData[0].id === 0) {
            toast.info('No cities available for the selected state');
          }
        }).catch(() => {
          setIsLoadingCities(false);
          toast.error('Failed to load cities');
        });
      }
    } else {
      setStateCities([]);
      setSelectedCityId(null);
    }
  }, [selectedStateId, getCitiesByStateId, loadCities]);

  // Fetch properties
  const {
    data: propertiesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['properties', page, limit, debouncedSearchQuery, selectedStateId, selectedCityId, selectedStatus],
    queryFn: async () => {
      const filters = {
        ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
        ...(selectedStateId ? { state: selectedStateId } : {}),
        ...(selectedCityId ? { city: selectedCityId } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {})
      };

      const response = await propertyService.getProperties({
        page,
        limit,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });

      if (isApiSuccessResponse(response)) {
        setTotalPages(response.data.meta.totalPages);
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch properties');
    }
  });

  // Create property mutation
  const createMutation = useMutation({
    mutationFn: (data: PropertyCreateData) => {
      console.log('Mutation function called with data:', data);
      return propertyService.createProperty(data);
    },
    onSuccess: (response) => {
      console.log('Mutation succeeded with response:', response);
      if (isApiSuccessResponse(response)) {
        toast.success(response.message || 'Property created successfully');
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setIsAddDialogOpen(false);
      } else {
        // Handle validation errors
        const errorMessage = response.message || 'Failed to create property';
        toast.error(errorMessage);

        // If it's the specific image validation error, show a more helpful message
        if (errorMessage.includes('image is required')) {
          toast.error('Please upload at least one property image', {
            description: 'The image is required to create a property listing',
            duration: 5000
          });
        }
      }
    },
    onError: (error: any) => {
      console.error('Mutation failed with error:', error);
      toast.error(error.message || 'An error occurred while creating the property');
    }
  });

  // Update property mutation
  const updateMutation = useMutation({
    mutationFn: (data: PropertyUpdateData) => {
      return propertyService.updateProperty(data);
    },
    onSuccess: (response) => {
      if (isApiSuccessResponse(response)) {
        toast.success(response.message || 'Property updated successfully');
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setIsEditDialogOpen(false);
        setSelectedProperty(null);
      } else {
        // Handle validation errors
        const errorMessage = response.message || 'Failed to update property';
        toast.error(errorMessage);

        // If it's the specific image validation error, show a more helpful message
        if (errorMessage.includes('image is required')) {
          toast.error('Please upload at least one property image', {
            description: 'The image is required to update a property listing',
            duration: 5000
          });
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating the property');
    }
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => propertyService.deleteProperty(id),
    onSuccess: (response) => {
      if (isApiSuccessResponse(response)) {
        toast.success(response.message || 'Property deleted successfully');

        // Force refetch the properties data
        queryClient.invalidateQueries({ queryKey: ['properties'] });

        // Optimistically update the UI by removing the deleted property
        if (propertiesData && propertiesData.data) {
          const updatedProperties = propertiesData.data.filter(p => p.id !== selectedProperty?.id);

          // If this was the last item on the page and not the first page, go to previous page
          if (updatedProperties.length === 0 && page > 1) {
            setPage(page - 1);
          }

          // Update the cache directly for immediate UI update
          queryClient.setQueryData(['properties', page, limit, debouncedSearchQuery], {
            ...propertiesData,
            data: updatedProperties
          });
        }

        setIsDeleteDialogOpen(false);
        setSelectedProperty(null);
      } else {
        toast.error(response.message || 'Failed to delete property');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while deleting the property');
    }
  });

  // Update property status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: PropertyStatusUpdateData) => propertyService.updatePropertyStatus(data),
    onSuccess: (response) => {
      if (isApiSuccessResponse(response)) {
        const statusText = response.data.propertyStatus === 'Active' ? 'activated' : 'deactivated';
        toast.success(response.message || `Property ${statusText} successfully`);

        // Force refetch the properties data
        queryClient.invalidateQueries({ queryKey: ['properties'] });

        // Optimistically update the UI by updating the property status
        if (propertiesData && propertiesData.data) {
          const updatedProperties = propertiesData.data.map(p =>
            p.id === response.data.id ? { ...p, propertyStatus: response.data.propertyStatus } : p
          );

          // Update the cache directly for immediate UI update
          queryClient.setQueryData(['properties', page, limit, debouncedSearchQuery, selectedStateId, selectedCityId, selectedStatus], {
            ...propertiesData,
            data: updatedProperties
          });
        }
      } else {
        toast.error(response.message || 'Failed to update property status');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating property status');
    }
  });

  // Handle property creation
  const handleCreateProperty = (data: PropertyCreateData) => {
    createMutation.mutate(data);
  };

  // Handle property update
  const handleUpdateProperty = (data: PropertyCreateData) => {
    if (selectedProperty) {
      // Create the update data with the property ID and form data
      const updateData: PropertyUpdateData = {
        id: selectedProperty.id,
        propertyName: data.propertyName,
        propertyAddress: data.propertyAddress,
        propertyContact: data.propertyContact,
        state: data.state,
        city: data.city,
        images: data.images // This can be either a File object or a string path
      };

      updateMutation.mutate(updateData);
    }
  };

  // Handle property deletion
  const handleDeleteProperty = () => {
    if (selectedProperty) {
      deleteMutation.mutate(selectedProperty.id);
    }
  };

  // Handle edit button click
  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  };

  // Handle state change
  const handleStateChange = (value: string) => {
    const stateId = value === "0" ? null : Number(value);
    setSelectedStateId(stateId);
    setPage(1); // Reset to first page when changing state
  };

  // Handle city change
  const handleCityChange = (value: string) => {
    const cityId = value === "0" ? null : Number(value);
    setSelectedCityId(cityId);
    setPage(1); // Reset to first page when changing city
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedStateId(null);
    setSelectedCityId(null);
    setSelectedStatus('Active'); // Reset to default 'Active' status
    setSearchQuery('');
    setDebouncedSearchQuery(''); // Also reset the debounced search query for immediate effect
    setPage(1);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPage(1); // Reset to first page when changing status
  };

  // Handle delete button click
  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  };

  // Handle property status toggle
  const handlePropertyStatusToggle = (property: Property, newStatus: string) => {
    updateStatusMutation.mutate({
      id: property.id,
      status: newStatus
    });
  };

  // Generate pagination items
  const renderPaginationItems = useCallback(() => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={page === 1}
          onClick={() => setPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }, [page, totalPages]);

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Properties
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by property name, address, or location"
                className="pl-10 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* State Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Select
                  value={selectedStateId ? String(selectedStateId) : '0'}
                  onValueChange={handleStateChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="pl-10 w-[150px] h-10">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state.id} value={String(state.id)}>
                        {state.stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Select
                  value={selectedCityId ? String(selectedCityId) : '0'}
                  onValueChange={handleCityChange}
                  disabled={isLoading || !selectedStateId || stateCities.length === 0 || isLoadingCities}
                >
                  <SelectTrigger className="pl-10 w-[150px] h-10">
                    {isLoadingCities ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={!selectedStateId ? "Select state first" : stateCities.length === 0 ? "No cities" : "Select city"} />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Cities</SelectItem>
                    {stateCities.map(city => (
                      // Skip the placeholder city with ID 0
                      city.id !== 0 ? (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.cityName}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 flex items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="pl-10 w-[150px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters Button - Only show when filters are applied */}
              {(selectedStateId || selectedCityId || selectedStatus !== 'Active' || searchQuery) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetFilters}
                  className="h-10 w-10"
                  title="Reset filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}

              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1); // Reset to first page when changing limit
                  }}
                  disabled={isLoading || limit === 10}
                >
                  <SelectTrigger className="w-[120px] h-10">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50, 60].filter(value => {
                      const totalCount = propertiesData?.meta.total || 10;
                      // Always show at least the 10 option
                      if (value === 10) return true;
                      // Show options up to the next increment above the total count
                      // For example, if total is 25, show options up to 30
                      return value <= Math.ceil(totalCount / 10) * 10;
                    }).map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {value}{value === 10 ? ' (Default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <>
            {/* Skeleton Loading State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {Array(8).fill(0).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-center">
            <div>
              <p className="text-red-500 mb-2">Failed to load properties</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['properties'] })}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : propertiesData?.data.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            {debouncedSearchQuery || selectedStateId || selectedCityId || selectedStatus !== 'Active' ? (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No properties match your filter criteria
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't added any properties yet
              </p>
            )}
            {/* Only show the Add Your First Property button when not filtering by Inactive status */}
            {selectedStatus !== 'Inactive' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {propertiesData?.data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusChange={handlePropertyStatusToggle}
                />
              ))}
            </div>

            {/* Pagination Info */}
            <div className="flex justify-between items-center mt-4 mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Records: {propertiesData?.meta.total || 0}
              </p>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                      tabIndex={page === 1 ? -1 : 0}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      aria-disabled={page === totalPages}
                      tabIndex={page === totalPages ? -1 : 0}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Add Property Dialog */}
      <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800 rounded">Error loading the property form. Please try again.</div>}>
        <PropertyDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleCreateProperty}
          isSubmitting={createMutation.isPending}
        />
      </ErrorBoundary>

      {/* Edit Property Dialog */}
      {selectedProperty && (
        <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800 rounded">Error loading the property form. Please try again.</div>}>
          <PropertyDialog
            property={selectedProperty}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateProperty}
            isSubmitting={updateMutation.isPending}
          />
        </ErrorBoundary>
      )}

      {/* Delete Confirmation Dialog */}
      <DeletePropertyDialog
        property={selectedProperty}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProperty}
        isDeleting={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default Properties;
