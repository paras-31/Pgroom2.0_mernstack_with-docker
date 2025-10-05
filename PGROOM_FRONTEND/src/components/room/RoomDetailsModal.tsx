import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '@/lib/api/services/roomService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  BedDouble,
  IndianRupee,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Building,
  Users,
  CalendarClock,
  UserCircle,
  CheckSquare,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomTenantsList from './RoomTenantsList';

interface RoomDetailsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (room: Room) => void;
}

/**
 * RoomDetailsModal - A modal component for displaying detailed room information
 */
const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  isOpen,
  onClose,
  onEdit,
}) => {
  const navigate = useNavigate();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [roomTenantsListRef, setRoomTenantsListRef] = useState<React.RefObject<any>>(React.createRef());

  // Check if there are any tenants assigned to this room
  const hasTenants = room.Tenant && room.Tenant.length > 0;

  // Reset edit mode when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If switching away from tenants tab, reset edit mode
    if (value !== 'tenants') {
      setIsEditMode(false);
    }
  };

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle image error event
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Get status color based on room status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case 'occupied':
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
      case 'maintenance':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case 'inactive':
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Get room images from the API response
  const getRoomImages = () => {
    if (!room.roomImage) return [];

    // If roomImage is already an array, use it
    if (Array.isArray(room.roomImage)) {
      // Make sure we have valid URLs
      return room.roomImage.filter(img => typeof img === 'string' && img.trim() !== '');
    }

    // If it's a string, return it as a single-item array
    return [room.roomImage];
  };

  const roomImages = getRoomImages();

  // Log images for debugging
  console.log('Room images:', roomImages);
  console.log('Current image index:', currentImageIndex);

  // Reset state when modal is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state
      setActiveTab('details');
      setIsEditMode(false);
      setCurrentImageIndex(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            Room {room.roomNo}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this room
          </DialogDescription>
        </DialogHeader>

        {/* Tabs Navigation */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              Tenants
            </TabsTrigger>
          </TabsList>

          {/* Details Tab Content */}
          <TabsContent value="details" className="space-y-4 min-h-[400px]">
            {/* Room Image Gallery */}
            <div className="relative overflow-hidden rounded-md">
              <AspectRatio ratio={16/9} className="bg-muted/20">
                {room.roomImage ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 z-10">
                        <Skeleton className="w-full h-full animate-pulse" />
                      </div>
                    )}
                    <img
                      src={roomImages[currentImageIndex]}
                      alt={`Room ${room.roomNo}`}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-300",
                        imageLoading && "opacity-0"
                      )}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </>
                ) : imageError ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BedDouble className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BedDouble className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
              </AspectRatio>

              {/* Navigation arrows for multiple images */}
              {roomImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full h-8 w-8 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = currentImageIndex === 0 ? roomImages.length - 1 : currentImageIndex - 1;
                      console.log('Navigating to previous image, new index:', newIndex);
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full h-8 w-8 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = currentImageIndex === roomImages.length - 1 ? 0 : currentImageIndex + 1;
                      console.log('Navigating to next image, new index:', newIndex);
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md z-10">
                    {currentImageIndex + 1} / {roomImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Room Details */}
            <div className="space-y-4">
              {/* Price and Type */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">Room {room.roomNo}</h3>
                  <p className="text-muted-foreground text-sm">{room.totalBed ? `${room.totalBed} Bed Room` : 'Standard Room'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <IndianRupee className="h-4 w-4" />
                    {room.rent}
                  </div>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>

              <Separator />

              {/* Room Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Beds */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Beds</p>
                    <p className="font-medium">
                      {room.totalBed || 1}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Added On</p>
                    <p className="font-medium">
                      {room.createdAt
                        ? new Date(room.createdAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {room.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Tenants Tab Content */}
          <TabsContent value="tenants" className="min-h-[400px]">
            <RoomTenantsList
              ref={roomTenantsListRef}
              propertyId={room.propertyId}
              roomId={room.id}
              initialEditMode={isEditMode}
              onEditModeChange={setIsEditMode}
              initialTenants={room.Tenant}
              onTenantUnassigned={() => {
                // Close the modal to trigger a refresh of the room data
                onClose();
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 mt-4">
          {/* Details tab - Edit Room button */}
          {activeTab === 'details' && onEdit && (
            <Button
              variant="default"
              onClick={() => {
                onClose();
                onEdit(room);
              }}
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Room
            </Button>
          )}

          {/* Tenants tab - Edit Tenants button (when not in edit mode and has tenants) */}
          {activeTab === 'tenants' && !isEditMode && hasTenants && (
            <Button
              variant="default"
              onClick={() => setIsEditMode(true)}
              className="flex-1"
            >
              <Users className="mr-2 h-4 w-4" />
              Edit Tenants
            </Button>
          )}

          {/* Tenants tab - Assign Tenant button (when not in edit mode and has no tenants) */}
          {activeTab === 'tenants' && !isEditMode && !hasTenants && (
            <Button
              variant="default"
              onClick={() => {
                onClose(); // Close the modal first
                navigate('/owner/tenants'); // Navigate to the tenants page
              }}
              className="flex-1"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Tenant
            </Button>
          )}

          {/* Tenants tab - Update button (when in edit mode) */}
          {activeTab === 'tenants' && isEditMode && (
            <Button
              variant="default"
              onClick={async () => {
                if (roomTenantsListRef.current) {
                  setIsUpdating(true);
                  try {
                    await roomTenantsListRef.current.handleBulkUpdateTenants();
                  } finally {
                    setIsUpdating(false);
                  }
                }
              }}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Update
                </>
              )}
            </Button>
          )}

          {/* Close/Cancel button */}
          <Button
            variant="outline"
            onClick={isEditMode ? () => setIsEditMode(false) : onClose}
            className="flex-1"
          >
            {isEditMode ? "Close" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsModal;
