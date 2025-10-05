import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MapPin, 
  Phone, 
  Building, 
  User, 
  Users, 
  Mail,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminProperty } from '@/lib/types/property';
import ContactOwnerModal from '@/components/admin/ContactOwnerModal';
import AdminPropertyDetailsModal from '@/components/admin/AdminPropertyDetailsModal';

interface AdminPropertyCardProps {
  property: AdminProperty;
  onImageLoad: () => void;
  onImageError: () => void;
  isImageLoading: boolean;
  getStatusBadgeColor: (status: string) => string;
  className?: string;
}

/**
 * AdminPropertyCard - A card component for displaying property information in admin panel
 *
 * This component displays comprehensive property information for admin management
 * including owner details and occupancy statistics.
 */
const AdminPropertyCard: React.FC<AdminPropertyCardProps> = ({
  property,
  onImageLoad,
  onImageError,
  isImageLoading,
  getStatusBadgeColor,
  className
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isContactOwnerModalOpen, setIsContactOwnerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Handle image error event
  const handleImageError = () => {
    setImageError(true);
    onImageError();
  };

  // Handle image load event
  const handleImageLoad = () => {
    onImageLoad();
  };

  // Handle view details click
  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  // Handle contact owner click
  const handleContactOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsContactOwnerModalOpen(true);
  };

  // Check if contact information is available
  const hasContactInfo = property.ownerContact || property.ownerEmail;

  // Mock property image (since admin properties may not have images)
  const defaultImageUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  
  // Use property image if available, otherwise use default
  const imageUrl = property.propertyImage || defaultImageUrl;

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-xl border-border",
          "group relative flex flex-col h-full",
          "bg-card hover:border-primary/50",
          className
        )}
      >
        {/* Property Image with AspectRatio for consistent sizing */}
        <div className="relative overflow-hidden group/image cursor-pointer" onClick={handleViewDetails}>
          <AspectRatio ratio={16/9} className="bg-muted/20">
            {!imageError ? (
              <>
                {isImageLoading && (
                  <div className="absolute inset-0 z-10">
                    <Skeleton className="w-full h-full animate-pulse" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={property.name}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                    isImageLoading && "opacity-0"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Building className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </AspectRatio>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn("shadow-sm font-medium", getStatusBadgeColor(property.status))}>
              {property.status}
            </Badge>
          </div>


        </div>

        {/* Property Title and Address */}
        <CardHeader className="pb-0 pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 w-full">
              <CardTitle 
                className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300 cursor-pointer"
                onClick={handleViewDetails}
              >
                {property.name}
              </CardTitle>
              <CardDescription className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1 inline flex-shrink-0" />
                <span className="line-clamp-1">{property.address}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Property Details */}
        <CardContent className="pt-4 pb-0 flex-grow">
          <Separator className="mb-4 bg-border/50" />

          {/* Property Information List */}
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
              <div className="text-muted-foreground flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>Location</span>
              </div>
              <div className="font-medium">{property.city}, {property.state}</div>
            </div>

            {/* Owner Info */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex items-center justify-between text-sm group/item p-1.5 rounded-md transition-colors duration-300",
                    hasContactInfo 
                      ? "hover:bg-muted/40 cursor-pointer" 
                      : "cursor-default opacity-75"
                  )}
                  onClick={hasContactInfo ? handleContactOwner : undefined}
                >
                  <div className="text-muted-foreground flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>Owner</span>
                  </div>
                  <div className="font-medium truncate max-w-[120px]">{property.ownerName}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hasContactInfo ? "Click to contact owner" : "Owner information (no contact details)"}</p>
                <p className="text-xs text-muted-foreground">{property.ownerEmail}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className="pt-4 pb-4 flex justify-between gap-2 mt-auto">
          <div className="flex gap-2 flex-1">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-medium"
              onClick={handleViewDetails}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "px-3 transition-all duration-300",
                    hasContactInfo 
                      ? "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20" 
                      : "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-800 dark:text-gray-600"
                  )}
                  onClick={hasContactInfo ? handleContactOwner : undefined}
                  disabled={!hasContactInfo}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hasContactInfo ? "Contact Owner" : "No contact information available"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>

      {/* Contact Owner Modal */}
      {isContactOwnerModalOpen && (
        <ContactOwnerModal
          property={property}
          isOpen={isContactOwnerModalOpen}
          onClose={() => setIsContactOwnerModalOpen(false)}
        />
      )}

      {/* Property Details Modal */}
      {isDetailsModalOpen && (
        <AdminPropertyDetailsModal
          property={property}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </TooltipProvider>
  );
};

export default AdminPropertyCard;
