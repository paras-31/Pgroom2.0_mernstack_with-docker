import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Building, Eye, Info } from 'lucide-react';
import { Property } from '@/lib/types/property';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface TenantPropertyCardProps {
  property: Property;
  className?: string;
}

/**
 * TenantPropertyCard - A card component for displaying property information to tenants
 *
 * This component displays key information about a property for tenant browsing
 * with the same UI design as owner PropertyCard but without owner-specific actions.
 */
const TenantPropertyCard: React.FC<TenantPropertyCardProps> = ({
  property,
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

  // Handle image area click to navigate to rooms
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/tenant/properties/${property.id}/rooms`);
  };

  // Handle title click to navigate to rooms
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/tenant/properties/${property.id}/rooms`);
  };

  // Handle view available rooms - navigate to property rooms page
  const handleViewDetails = () => {
    navigate(`/tenant/properties/${property.id}/rooms`);
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
      {/* Property Image with AspectRatio for consistent sizing */}
      <div
        className="relative overflow-hidden group/image cursor-pointer"
        onClick={handleImageClick}>
        <AspectRatio ratio={16/9} className="bg-muted/20">
          {property.propertyImage ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 z-10">
                  <Skeleton className="w-full h-full animate-pulse" />
                </div>
              )}
              <img
                src={property.propertyImage}
                alt={property.propertyName}
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
              <Building className="w-12 h-12 text-muted-foreground/50" />
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Building className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </AspectRatio>

        {/* Property Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={property.propertyStatus === 'Active' ? 'default' : 'secondary'}
            className={cn(
              "shadow-sm",
              property.propertyStatus === 'Active' 
                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
            )}
          >
            {property.propertyStatus}
          </Badge>
        </div>

        {/* Hover Overlay for Details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="text-center p-4 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 scale-90 group-hover/image:scale-100">
            <p className="text-white text-sm mb-3 font-medium">Property Details</p>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/80 backdrop-blur-sm border-primary/30 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={handleViewDetails}
            >
              <Info className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Property Title and Address */}
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 w-full">
            <CardTitle 
              className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300 cursor-pointer"
              onClick={handleTitleClick}
            >
              {property.propertyName}
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mr-1 inline flex-shrink-0" />
              <span className="line-clamp-1">{property.propertyAddress}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Property Details */}
      <CardContent className="pt-4 pb-6 flex-grow">
        <Separator className="mb-4 bg-border/50" />

        {/* Property Information List */}
        <div className="space-y-3">
          {/* Property Type */}
          <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                <Building className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Type</span>
            </div>
            <div className="font-medium">{property.type}</div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Location</span>
            </div>
            <div className="font-medium">{property.state}, {property.city}</div>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-between text-sm group/item hover:bg-muted/40 p-1.5 rounded-md transition-colors duration-300">
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md group-hover/item:bg-primary/20 transition-colors duration-300">
                <Phone className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Contact</span>
            </div>
            <div className="font-medium">{property.propertyContact}</div>
          </div>
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
            View Available Rooms
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TenantPropertyCard;
