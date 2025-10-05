import React, { useState, useEffect } from 'react';
import { tenantService } from '@/lib/api/services/tenantService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { UserMinus, CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RoomTenant } from '@/lib/api/services/roomService';

interface Tenant {
  id: number;
  userId: number;
  username: string;
}

interface RoomTenantsListProps {
  propertyId: number;
  roomId: number;
  initialEditMode?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  onTenantUnassigned?: () => void;
  initialTenants?: RoomTenant[]; // New prop to accept tenants directly from room object
}

/**
 * RoomTenantsList - A component to display and manage tenants assigned to a room
 */
const RoomTenantsList = React.forwardRef<
  { handleBulkUpdateTenants: () => Promise<void> },
  RoomTenantsListProps
>(({
  propertyId,
  roomId,
  initialEditMode = false,
  onEditModeChange,
  onTenantUnassigned,
  initialTenants,
}, ref) => {
  // Convert initialTenants to the format expected by the component
  const convertInitialTenants = (): Tenant[] => {
    if (!initialTenants || initialTenants.length === 0) return [];

    return initialTenants.map((tenant, index) => ({
      id: index, // Use index as temporary id since we don't have tenant.id in the new API
      userId: tenant.user.id,
      username: `${tenant.user.firstName} ${tenant.user.lastName}`,
    }));
  };

  const [tenants, setTenants] = useState<Tenant[]>(convertInitialTenants());
  const [isLoading, setIsLoading] = useState(!initialTenants);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch tenants assigned to this room
  const fetchTenants = async () => {
    if (initialTenants && !isRefreshing) {
      // If initialTenants is provided and we're not explicitly refreshing, use it
      setTenants(convertInitialTenants());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);

    try {
      const response = await tenantService.getTenantsByRoom(propertyId, roomId);

      if (response.statusCode === 200) {
        setTenants(response.data || []);
      } else {
        setError('Failed to load tenants');
        toast({
          title: 'Error',
          description: 'Failed to load tenants',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenants');
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load tenants when component mounts or when initialTenants changes
  useEffect(() => {
    if (initialTenants) {
      setTenants(convertInitialTenants());
      setIsLoading(false);
    } else {
      fetchTenants();
    }
  }, [propertyId, roomId, initialTenants]);

  // Update edit mode when initialEditMode changes
  useEffect(() => {
    toggleEditMode(initialEditMode);
  }, [initialEditMode]);

  // Expose the handleBulkUpdateTenants function via ref
  React.useImperativeHandle(ref, () => ({
    handleBulkUpdateTenants
  }));

  // Handle unassign tenant
  const handleUnassignTenant = async () => {
    if (!selectedTenant) return;

    setIsUnassigning(true);

    try {
      // Get all tenant IDs except the one being unassigned (keep the others)
      const tenantsToKeep = tenants
        .filter(t => t.id !== selectedTenant.id)
        .map(t => t.id);
      
      // Call the tenant update API
      const response = await tenantService.updateTenant({
        ids: tenantsToKeep, // IDs of tenants to keep
        userIds: [], // Empty array - no new tenants to add
        propertyId,
        roomId,
      });

      if (response.statusCode === 200) {
        toast({
          title: 'Success',
          description: 'Tenant unassigned successfully',
        });

        // Refresh the tenants list
        fetchTenants();

        // Call the callback if provided
        if (onTenantUnassigned) {
          onTenantUnassigned();
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to unassign tenant',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error unassigning tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign tenant',
        variant: 'destructive',
      });
    } finally {
      setIsUnassigning(false);
      setIsUnassignDialogOpen(false);
      setSelectedTenant(null);
    }
  };

  // Open unassign dialog
  const openUnassignDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsUnassignDialogOpen(true);
  };

  // Toggle edit mode
  const toggleEditMode = (newEditMode: boolean) => {
    setIsEditMode(newEditMode);

    // Reset selections when exiting edit mode
    if (!newEditMode) {
      setSelectedTenants([]);
    }

    // Call the onEditModeChange callback if provided
    if (onEditModeChange) {
      onEditModeChange(newEditMode);
    }
  };

  // Handle select all tenants
  const handleSelectAll = () => {
    if (selectedTenants.length === tenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(tenants.map(tenant => tenant.id));
    }
  };

  // Handle select individual tenant
  const handleSelectTenant = (tenantId: number) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    } else {
      setSelectedTenants([...selectedTenants, tenantId]);
    }
  };

  // Handle bulk update of tenants
  const handleBulkUpdateTenants = async () => {
    if (selectedTenants.length === 0) {
      toast({
        title: 'No tenants selected',
        description: 'Please select at least one tenant to update',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get the tenant IDs that should be KEPT (not selected for removal)
      const tenantsToKeep = tenants
        .filter(tenant => !selectedTenants.includes(tenant.id))
        .map(tenant => tenant.id);

      // Call the bulk update API
      const response = await tenantService.bulkUpdateTenants({
        userIds: [], // Empty array - no new tenants to add
        ids: tenantsToKeep, // IDs of tenants to keep (not remove)
        propertyId,
        roomId,
      });

      if (response.statusCode === 200) {
        toast({
          title: 'Success',
          description: 'Tenants updated successfully',
        });

        // Refresh the tenants list
        fetchTenants();

        // Exit edit mode
        toggleEditMode(false);

        // Call the callback if provided
        if (onTenantUnassigned) {
          onTenantUnassigned();
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update tenants',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating tenants:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tenants',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Assigned Tenants</h3>
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Saving...</span>
            </div>
          )}
          <Badge variant="outline" className="bg-gradient-to-r from-primary/90 to-primary dark:from-primary/70 dark:to-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            {tenants.length} {tenants.length === 1 ? 'Tenant' : 'Tenants'}
          </Badge>
        </div>
      </div>

      {isEditMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 whitespace-nowrap border-green-500 dark:border-green-600 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 font-medium"
            >
              {selectedTenants.length === tenants.length && tenants.length > 0 ? (
                <>
                  <Square className="h-4 w-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Select All
                </>
              )}
            </Button>
          </div>

          {selectedTenants.length > 0 && (
            <div className="flex items-center justify-end">
              <span className="text-sm text-muted-foreground">
                {selectedTenants.length} of {tenants.length} selected
              </span>
            </div>
          )}

          <Separator className="bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {isLoading ? (
        // Loading state
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-pulse">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      ) : tenants.length === 0 ? (
        // Empty state
        <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="bg-gradient-to-br from-primary/80 to-primary p-4 rounded-full mb-4 text-white shadow-sm">
            <UserMinus className="h-6 w-6" />
          </div>
          <h4 className="font-medium text-lg mb-2">No Tenants Assigned</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            This room doesn't have any tenants assigned yet. Click the "Assign Tenant" button below to assign tenants to this room.
          </p>
        </div>
      ) : (
        // Tenants list
        <div className="space-y-2">
          {tenants.map(tenant => (
            <div
              key={tenant.id}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 shadow-sm ${
                isEditMode
                  ? selectedTenants.includes(tenant.id)
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-700 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-green-50/50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={isEditMode ? () => handleSelectTenant(tenant.id) : undefined}
            >
              <div className="flex items-center gap-3 w-full">
                {isEditMode && (
                  <Checkbox
                    checked={selectedTenants.includes(tenant.id)}
                    onCheckedChange={() => handleSelectTenant(tenant.id)}
                    className="h-5 w-5 border-2 border-green-500 dark:border-green-600 data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-600 data-[state=checked]:text-white hover:border-green-600 dark:hover:border-green-500"
                  />
                )}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium">{getInitials(tenant.username)}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{tenant.username}</p>
                  <p className="text-xs text-muted-foreground">Tenant</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              Unassign Tenant
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign <span className="font-medium">{selectedTenant?.username}</span> from this room?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnassigning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnassignTenant}
              disabled={isUnassigning}
              className="bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 hover:shadow-md"
            >
              {isUnassigning ? 'Unassigning...' : 'Unassign Tenant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default RoomTenantsList;
