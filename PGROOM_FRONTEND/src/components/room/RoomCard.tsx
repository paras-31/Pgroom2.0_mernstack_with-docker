import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  BedDouble,
  Loader2,
  ShieldCheck,
  ShieldX,
  Eye,
  IndianRupee,
  Users,
  CalendarClock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Room } from '@/lib/api/services/roomService';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onStatusChange?: (room: Room, newStatus: string) => void;
  className?: string;
}

/**
 * RoomCard - A card component for displaying room information
 *
 * This component displays key information about a room and provides
 * edit, delete, and status change actions.
 *
 * Enhanced with modern UI and interactive elements.
 */
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onDelete,
  onStatusChange,
  className
}) => {
  const navigate = useNavigate();

  // State for image loading
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle image error event
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Handle status toggle - only allow changing from Occupied to Available
  const handleStatusToggle = () => {
    // Only allow changing from Occupied to Available
    if (onStatusChange && room.status !== 'Available') {
      onStatusChange(room, 'Available');
    }
  };

  // Handle card click to view details
  const handleCardClick = () => {
    if (onEdit) {
      onEdit(room);
    }
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

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-xl border-border",
        "group relative flex flex-col h-full",
        "bg-card hover:border-primary/50",
        className
      )}
    >
      {/* Room Image with AspectRatio for consistent sizing */}
      <div
        className="relative overflow-hidden group/image cursor-pointer"
        onClick={handleCardClick}>
        <AspectRatio ratio={16/9} className="bg-muted/20">
          {room.roomImage && (Array.isArray(room.roomImage) ? room.roomImage.length > 0 : room.roomImage) ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 z-10">
                  <Skeleton className="w-full h-full animate-pulse" />
                </div>
              )}
              <img
                src={Array.isArray(room.roomImage) ? room.roomImage[0] : room.roomImage}
                alt={`Room ${room.roomNo}`}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
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

        {/* Hover Overlay for Room Details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="text-center p-4 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 scale-90 group-hover/image:scale-100">
            <p className="text-white text-sm mb-3 font-medium">Room Details</p>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/80 backdrop-blur-sm border-primary/30 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(room);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>

        {/* Status Badge removed as requested */}
      </div>

      {/* Room Title and Type */}
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 w-full">
            <CardTitle
              className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300 cursor-pointer flex items-center gap-1"
              onClick={handleCardClick}
            >
              Room {room.roomNo}
              <Eye className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <BedDouble className="w-3.5 h-3.5 mr-1 inline flex-shrink-0" />
              <span className="line-clamp-1">{room.totalBed ? `${room.totalBed} Bed Room` : 'Standard Room'}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Room Details */}
      <CardContent className="pt-4 pb-6 flex-grow">
        <Separator className="mb-4 bg-border/50" />

        {/* Room Information List */}
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                <IndianRupee className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Rent</span>
            </div>
            <div className="font-medium">{room.rent}/month</div>
          </div>

          {/* Beds */}
          <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Beds</span>
            </div>
            <HoverCard>
              <HoverCardTrigger>
                <div className="font-medium cursor-help">
                  {room.totalBed || 1} Bed(s)
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <p className="text-xs">Maximum occupancy for this room</p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Status section removed as requested */}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="pt-0 pb-4 flex justify-between gap-2 mt-auto">
        <div className="flex gap-2 flex-1">
          {/* Edit button removed as requested */}

          {onStatusChange && (
            room.status === 'Available' ? (
              // Non-clickable status indicator for Available
              <div
                className={cn(
                  "flex-1 flex items-center justify-center py-2 px-3 rounded-md border font-medium",
                  "border-green-200 text-green-700 bg-green-50/50 dark:border-green-900/30 dark:text-green-400 dark:bg-green-900/10"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Available</span>
              </div>
            ) : (
              // Clickable button for Occupied status
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 bg-background hover:bg-background/90 transition-all duration-300 font-medium",
                  "border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/10"
                )}
                onClick={handleStatusToggle}
                title="Set Room as Available"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span>Occupied</span>
              </Button>
            )
          )}
        </div>

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 p-0 rounded-full bg-background border-border hover:border-red-500 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => onDelete(room)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
