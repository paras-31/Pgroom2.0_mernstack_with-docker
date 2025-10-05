import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Phone, Building, Loader2, ShieldCheck, ShieldX, Eye } from 'lucide-react';
import { Property } from '@/lib/types/property';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';


interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onStatusChange?: (property: Property, newStatus: string) => void;
  className?: string;
}

/**
 * PropertyCard - A card component for displaying property information
 *
 * This component displays key information about a property and provides
 * edit and delete actions.
 *
 * Enhanced with modern UI inspired by the reference design.
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
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

  // Handle status toggle
  const handleStatusToggle = () => {
    if (onStatusChange) {
      const newStatus = property.propertyStatus === 'Active' ? 'Inactive' : 'Active';
      onStatusChange(property, newStatus);
    }
  };

  // Handle image area click to navigate to rooms
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/owner/properties/${property.id}/rooms`);
  };

  // Handle title click to navigate to rooms
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/owner/properties/${property.id}/rooms`);
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

        {/* Hover Overlay for Rooms - Only on the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="text-center p-4 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 scale-90 group-hover/image:scale-100">
            <p className="text-white text-sm mb-3 font-medium">Property Rooms</p>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/80 backdrop-blur-sm border-primary/30 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/owner/properties/${property.id}/rooms`);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Rooms
            </Button>
          </div>
        </div>
      </div>

      {/* Property Title and Address */}
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 w-full">
            <CardTitle
              className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300 cursor-pointer flex items-center gap-1"
              onClick={handleTitleClick}
            >
              {property.propertyName}
              <Eye className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mr-1 inline flex-shrink-0" />
              <span className="line-clamp-1">{property.propertyAddress}</span>
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
            onClick={() => onEdit(property)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>

          {onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md",
                property.propertyStatus === 'Active'
                  ? "border border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400"
                  : "border border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400"
              )}
              onClick={handleStatusToggle}
              title={property.propertyStatus === 'Active' ? 'Set Property as Inactive' : 'Set Property as Active'}
            >
              {property.propertyStatus === 'Active' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">Status: Active</span>
                </>
              ) : (
                <>
                  <ShieldX className="w-4 h-4" />
                  <span className="text-xs font-medium">Status: Inactive</span>
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 rounded-full bg-background border-border hover:border-red-500 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => onDelete(property)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>


    </Card>
  );
};

export default PropertyCard;
