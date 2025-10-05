import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Building, ChevronRight, Home, Loader2, BedDouble, RefreshCw, ArrowLeftRight, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Room components
import AddRoomModal from '@/components/room/AddRoomModal';
import EditRoomModal from '@/components/room/EditRoomModal';
import RoomCard from '@/components/room/RoomCard';
import RoomCardSkeleton from '@/components/room/RoomCardSkeleton';
import RoomDetailsModal from '@/components/room/RoomDetailsModal';
import DeleteRoomDialog from '@/components/room/DeleteRoomDialog';

// Layout components
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// API and services
import { roomService, Room } from '@/lib/api/services/roomService';
import { isApiSuccessResponse } from '@/lib/types/api';

/**
 * Rooms - Owner's room management page for a specific property
 *
 * This page allows property owners to view, add, edit, and delete rooms for a specific property.
 * Enhanced with interactive room cards and status management.
 */
const Rooms: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("Available");
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isRoomDetailsModalOpen, setIsRoomDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rooms for the property
  const {
    data: roomsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['rooms', propertyId, page, limit, statusFilter],
    queryFn: async () => {
      if (!propertyId) throw new Error('Property ID is required');

      const filters = statusFilter ? { status: statusFilter } : undefined;

      const response = await roomService.getRooms({
        propertyId: Number(propertyId),
        page,
        limit,
        filters
      });

      if (isApiSuccessResponse(response)) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to load rooms');
    },
    enabled: !!propertyId
  });

  // Mutation for updating room status
  const updateRoomStatusMutation = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number; status: string }) => {
      const response = await roomService.updateRoomStatus(roomId, status);
      if (!isApiSuccessResponse(response)) {
        throw new Error(response.message || 'Failed to update room status');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch rooms data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: 'Status Updated',
        description: 'Room status has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update room status',
        variant: 'destructive',
      });
    }
  });

  // Mutation for deleting a room
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await roomService.deleteRoom(roomId);
      if (!isApiSuccessResponse(response)) {
        throw new Error(response.message || 'Failed to delete room');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch rooms data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: 'Room Deleted',
        description: 'The room has been deleted successfully.',
        variant: 'success',
      });

      // Close the delete dialog
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete room',
        variant: 'destructive',
      });
    }
  });

  // Handle room view details
  const handleViewRoom = async (room: Room) => {
    try {
      // Fetch detailed room data including tenant information
      const response = await roomService.getRoom(room.id);

      if (isApiSuccessResponse(response)) {
        setSelectedRoom(response.data);
      } else {
        // If API call fails, fall back to the room data we already have
        setSelectedRoom(room);
        toast({
          title: 'Warning',
          description: 'Could not fetch the latest room details. Some information may be outdated.',
          variant: 'warning',
        });
      }
    } catch (error) {
      // If there's an error, fall back to the room data we already have
      console.error('Error fetching room details:', error);
      setSelectedRoom(room);
      toast({
        title: 'Warning',
        description: 'Could not fetch the latest room details. Some information may be outdated.',
        variant: 'warning',
      });
    } finally {
      setIsRoomDetailsModalOpen(true);
    }
  };

  // Handle room edit
  const handleEditRoom = (room: Room) => {
    // Close details modal if open
    setIsRoomDetailsModalOpen(false);

    // Set selected room and open edit modal
    setSelectedRoom(room);
    setIsEditRoomModalOpen(true);
  };

  // Handle room delete - opens confirmation dialog
  const handleDeleteRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete - actually performs the deletion
  const handleConfirmDelete = () => {
    if (selectedRoom) {
      deleteRoomMutation.mutate(selectedRoom.id);
    }
  };

  // Handle room status change
  const handleRoomStatusChange = (room: Room, newStatus: string) => {
    updateRoomStatusMutation.mutate({ roomId: room.id, status: newStatus });
  };

  // Handle toggling between Available and Occupied
  const handleClearFilters = () => {
    // Toggle between Available and Occupied
    setStatusFilter(statusFilter === "Available" ? "Occupied" : "Available");
    setPage(1);
  };

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Breadcrumb and Action Bar */}
        <div className="flex justify-between items-center gap-4 mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center text-sm overflow-x-auto py-1">
            <Link
              to="/owner/properties"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center whitespace-nowrap"
            >
              <Building className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              Properties
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-foreground font-medium whitespace-nowrap">Rooms</span>
          </nav>

          <Button
            className="bg-primary hover:bg-primary/90 whitespace-nowrap flex-shrink-0 shadow-sm hover:shadow transition-all"
            disabled={isLoading}
            onClick={() => setIsAddRoomModalOpen(true)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </>
            )}
          </Button>
        </div>

        {/* Property Details Card */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle>Property Details</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building className="h-3.5 w-3.5" />
              Manage rooms for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">
                This page displays rooms for the selected property. You can add, edit, and manage rooms from here.
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Note:</span> Changes made to rooms will be automatically reflected in tenant views.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Rooms</h2>
              {/* Status indicator badge */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                statusFilter === "Available"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
              }`}>
                {statusFilter}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">
                  Status:
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger id="status-filter" className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>

                {/* Switch Status Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearFilters}
                  className="h-9 w-9"
                  title={`Switch to ${statusFilter === "Available" ? "Occupied" : "Available"} status`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Total Rooms Counter */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Total Rooms:</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                    {roomsData?.meta?.total || 0}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            // Loading state with RoomCardSkeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, index) => (
                <RoomCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            // Error state
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mb-4">
                    <Building className="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Error Loading Rooms</h3>
                  <p className="text-red-500 dark:text-red-300 mb-4 max-w-md">
                    {error instanceof Error ? error.message : 'An unknown error occurred'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : roomsData?.data && roomsData.data.length > 0 ? (
            // Rooms grid with interactive RoomCard components - 4 columns layout
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {roomsData.data.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={handleViewRoom} // Use view function for the main card click
                  onDelete={handleDeleteRoom}
                  onStatusChange={handleRoomStatusChange}
                />
              ))}
            </div>
          ) : (
            // Empty state - different message based on whether filters are applied
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Building className="h-10 w-10 text-primary" />
                </div>
                <>
                  <h3 className="text-xl font-semibold mb-2">No {statusFilter} Rooms</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    No rooms with status "{statusFilter}" found. Try switching to {statusFilter === "Available" ? "Occupied" : "Available"} status or add new rooms.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="transition-colors"
                    >
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Show {statusFilter === "Available" ? "Occupied" : "Available"} Rooms
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 transition-colors"
                      onClick={() => setIsAddRoomModalOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </div>
                </>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {propertyId && (
        <AddRoomModal
          isOpen={isAddRoomModalOpen}
          onClose={() => setIsAddRoomModalOpen(false)}
          propertyId={Number(propertyId)}
        />
      )}

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          isOpen={isRoomDetailsModalOpen}
          onClose={() => setIsRoomDetailsModalOpen(false)}
          onEdit={handleEditRoom}
        />
      )}

      {/* Edit Room Modal */}
      {selectedRoom && propertyId && (
        <EditRoomModal
          room={selectedRoom}
          isOpen={isEditRoomModalOpen}
          onClose={() => setIsEditRoomModalOpen(false)}
          propertyId={Number(propertyId)}
        />
      )}

      {/* Delete Room Dialog */}
      {selectedRoom && (
        <DeleteRoomDialog
          roomNo={selectedRoom.roomNo}
          isOpen={isDeleteDialogOpen}
          isDeleting={deleteRoomMutation.isPending}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default Rooms;
