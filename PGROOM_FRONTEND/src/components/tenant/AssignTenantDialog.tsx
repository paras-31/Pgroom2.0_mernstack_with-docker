import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// API and types
import { TenantUser, tenantService } from '@/lib/api/services/tenantService';
import { propertyService, Property, PropertyListResponse } from '@/lib/api/services/propertyService';
import { roomService, Room, RoomListResponse } from '@/lib/api/services/roomService';

// Room creation component
import AddRoomModal from '@/components/room/AddRoomModal';

interface AssignTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantUser | null;
  onSuccess?: () => void;
}

/**
 * AssignTenantDialog - Dialog for assigning a tenant to a property and room
 */
const AssignTenantDialog: React.FC<AssignTenantDialogProps> = ({
  isOpen,
  onClose,
  tenant,
  onSuccess
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPropertyId('');
      setSelectedRoomId('');
      setError(null);
    } else {
      // Fetch properties when dialog opens
      fetchProperties();
    }
  }, [isOpen]);

  // Fetch properties from API
  const fetchProperties = async () => {
    setIsLoadingProperties(true);
    setError(null);

    try {
      const response = await propertyService.getProperties({
        page: 1,
        limit: 100, // Fetch a large number to avoid pagination in the dropdown
        filters: {
          status: 'Active' // Only fetch active properties
        }
      });

      if (response.statusCode === 200 && response.data) {
        setProperties(response.data.data || []);
      } else {
        setError('Failed to load properties');
        toast.error('Failed to load properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
      toast.error('Failed to load properties');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // Fetch rooms when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      fetchRooms(parseInt(selectedPropertyId));
    } else {
      setRooms([]);
    }
  }, [selectedPropertyId]);

  // Fetch rooms from API
  const fetchRooms = async (propertyId: number) => {
    setIsLoadingRooms(true);
    setError(null);
    setSelectedRoomId(''); // Reset room selection when property changes

    try {
      const response = await roomService.getRooms({
        propertyId,
        page: 1,
        limit: 100, // Fetch a large number to avoid pagination in the dropdown
        filters: {
          status: 'Available' // Only fetch available rooms
        }
      });

      if (response.statusCode === 200 && response.data) {
        setRooms(response.data.data || []);
      } else {
        setError('Failed to load rooms');
        toast.error('Failed to load rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Assign tenant to property and room
  const handleAssignTenant = async () => {
    if (!tenant || !selectedPropertyId || !selectedRoomId) {
      toast.error('Missing required fields');
      return false;
    }

    try {
      // Call the tenant assignment API
      const response = await tenantService.assignTenant({
        userIds: [tenant.user.id], // Array of user IDs to assign
        propertyId: parseInt(selectedPropertyId),
        roomId: parseInt(selectedRoomId)
      });

      // Check if the assignment was successful
      if (response.statusCode === 200) {
        return true;
      } else {
        toast.error(response.message || 'Failed to assign tenant');
        return false;
      }
    } catch (error) {
      console.error('Error assigning tenant:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPropertyId) {
      toast.error('Please select a property');
      return;
    }

    if (!selectedRoomId) {
      toast.error('Please select a room');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await handleAssignTenant();
      if (success) {
        toast.success('Tenant assigned successfully');
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      toast.error('Failed to assign tenant');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle room creation success
  const handleRoomCreated = () => {
    console.log("Room created successfully, refreshing rooms list");

    // Close the add room modal
    setIsAddRoomModalOpen(false);

    // Refresh the rooms list for the selected property
    if (selectedPropertyId) {
      console.log("Fetching rooms for property ID:", selectedPropertyId);
      fetchRooms(parseInt(selectedPropertyId));
    }

    // Show success message
    toast.success('Room added successfully');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <DialogTitle className="text-xl font-bold text-white mb-1">
              Assign Tenant to Room
            </DialogTitle>
            <DialogDescription className="text-green-100 opacity-90">
              {tenant ?
                `Assign ${tenant.user.firstName || ''} ${tenant.user.lastName || ''} to a property and room.`
                : 'Loading tenant details...'}
            </DialogDescription>

            {/* Tenant info card - only show if we have tenant data */}
            {tenant && tenant.user && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                {tenant.user.profileImage ? (
                  <img
                    src={tenant.user.profileImage}
                    alt={`${tenant.user.firstName} ${tenant.user.lastName}`}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-white">
                    {tenant.user.firstName} {tenant.user.lastName}
                  </div>
                  {tenant.user.email && (
                    <div className="text-xs text-green-100">
                      {tenant.user.email}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property" className="text-sm font-medium">Property</Label>
              <Select
                value={selectedPropertyId}
                onValueChange={(value) => {
                  setSelectedPropertyId(value);
                  setSelectedRoomId(''); // Reset room selection when property changes
                }}
                disabled={isLoadingProperties || isSubmitting}
              >
                <SelectTrigger id="property" className="h-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  <AnimatePresence mode="wait">
                    {isLoadingProperties ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center p-4"
                      >
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                        <span>Loading properties...</span>
                      </motion.div>
                    ) : properties.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 text-center text-sm text-gray-500"
                      >
                        No properties available
                      </motion.div>
                    ) : (
                      properties.map((property) => (
                        <SelectItem key={property.id} value={String(property.id)}>
                          {property.propertyName}
                        </SelectItem>
                      ))
                    )}
                  </AnimatePresence>
                </SelectContent>
              </Select>
            </div>

            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="room" className="text-sm font-medium">Room</Label>
              <Select
                value={selectedRoomId}
                onValueChange={setSelectedRoomId}
                disabled={!selectedPropertyId || isLoadingRooms || isSubmitting}
              >
                <SelectTrigger id="room" className="h-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <SelectValue placeholder={!selectedPropertyId ? "Select a property first" : "Select a room"} />
                </SelectTrigger>
                <SelectContent>
                  <AnimatePresence mode="wait">
                    {isLoadingRooms ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center p-4"
                      >
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                        <span>Loading rooms...</span>
                      </motion.div>
                    ) : rooms.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 flex flex-col items-center justify-center gap-2"
                      >
                        <p className="text-center text-sm text-gray-500">
                          No rooms available for this property
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-2 flex items-center gap-1 text-primary hover:text-primary hover:bg-primary/5"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Add Room button clicked");
                            // Close the select dropdown first
                            document.body.click(); // This will close any open dropdowns
                            // Then open the modal with a slight delay to ensure the dropdown is closed
                            setTimeout(() => {
                              setIsAddRoomModalOpen(true);
                            }, 100);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Room
                        </Button>
                      </motion.div>
                    ) : (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={String(room.id)}>
                          Room {room.roomNo}
                        </SelectItem>
                      ))
                    )}
                  </AnimatePresence>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-gray-200 dark:border-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedPropertyId || !selectedRoomId || isSubmitting}
                className={`relative group ${!selectedPropertyId || !selectedRoomId || isSubmitting ? '' : 'bg-primary/90 hover:bg-primary'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Assign Tenant</span>
                    {/* Animated background for enabled button */}
                    {!(!selectedPropertyId || !selectedRoomId) && (
                      <span className="absolute inset-0 rounded-md overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></span>
                        <span className="absolute top-0 left-0 right-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></span>
                      </span>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen && !!selectedPropertyId}
        onClose={() => setIsAddRoomModalOpen(false)}
        propertyId={selectedPropertyId ? parseInt(selectedPropertyId) : 0}
        onSuccess={handleRoomCreated}
      />
    </>
  );
};

export default AssignTenantDialog;
