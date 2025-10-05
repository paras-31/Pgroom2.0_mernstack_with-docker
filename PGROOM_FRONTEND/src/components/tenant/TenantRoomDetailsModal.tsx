import React, { useState } from 'react';
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
  Building,
  Users,
  Phone,
  Eye,
  Star,
  MapPin,
} from 'lucide-react';

interface TenantRoomDetailsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onContactOwner?: (room: Room) => void;
  propertyName?: string;
  propertyAddress?: string;
}

/**
 * TenantRoomDetailsModal - A modal component for tenants to view detailed room information
 */
const TenantRoomDetailsModal: React.FC<TenantRoomDetailsModalProps> = ({
  room,
  isOpen,
  onClose,
  onContactOwner,
  propertyName,
  propertyAddress,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Reset state when modal is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state
      setCurrentImageIndex(0);
      setImageLoading(true);
      setImageError(false);
      onClose();
    }
  };

  // Format rent display
  const formatRent = (rent: string | number) => {
    const rentValue = typeof rent === 'string' ? parseFloat(rent) : rent;
    return isNaN(rentValue) ? 'N/A' : rentValue.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            Room {room.roomNo}
            <Badge className={cn("ml-2", getStatusColor(room.status))}>
              {room.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this room
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          {(propertyName || propertyAddress) && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Property Information
                </span>
              </div>
              {propertyName && (
                <p className="font-medium">{propertyName}</p>
              )}
              {propertyAddress && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{propertyAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Room Image Gallery */}
          <div className="relative overflow-hidden rounded-lg">
            <AspectRatio ratio={16/9} className="bg-muted/20">
              {roomImages.length > 0 ? (
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
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image counter for multiple images */}
              {roomImages.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md z-10">
                  {currentImageIndex + 1} / {roomImages.length}
                </div>
              )}
            </AspectRatio>
          </div>

          {/* Room Details */}
          <div className="space-y-4">
            {/* Price and Type */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-xl">Room {room.roomNo}</h3>
                <p className="text-muted-foreground text-sm">
                  {room.totalBed ? `${room.totalBed} Bed${room.totalBed > 1 ? 's' : ''} Room` : 'Standard Room'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                  <IndianRupee className="h-6 w-6" />
                  {formatRent(room.rent)}
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>

            <Separator />

            {/* Room Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Beds */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-md">
                  <BedDouble className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="font-medium">
                    {room.totalBed || 1}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </div>

              {/* Added Date */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added On</p>
                  <p className="font-medium text-sm">
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
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Room Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                    {room.description}
                  </p>
                </div>
              </>
            )}

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-6">
          {/* Contact Owner button */}
          {onContactOwner && (
            <Button
              variant="default"
              onClick={() => {
                onClose();
                onContactOwner(room);
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact Owner
            </Button>
          )}

          {/* Close button */}
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="flex-1"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantRoomDetailsModal;
