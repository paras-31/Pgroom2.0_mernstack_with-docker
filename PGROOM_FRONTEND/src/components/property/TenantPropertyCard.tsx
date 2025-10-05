import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, MapPin, Phone, Building, Info } from 'lucide-react';
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
 * TenantPropertyCard - A card component for displaying property information for tenants
 *
 * This component displays key information about a property and provides
 * tenant-specific actions like viewing rooms and booking.
 *
 * Enhanced with modern UI matching the owner PropertyCard design.
 */
const TenantPropertyCard: React.FC<TenantPropertyCardProps> = ({
  property,
  className
}) => {
  const navigate = useNavigate();

  // State for image loading
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="absolute top-3 left-3">
          <Badge 
            variant={property.propertyStatus === 'Active' ? 'default' : 'secondary'}
            className={cn(
              "font-medium shadow-sm",
              property.propertyStatus === 'Active' 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-gray-500 hover:bg-gray-600 text-white"
            )}
          >
            {property.propertyStatus}
          </Badge>
        </div>

        {/* Hover Overlay for Rooms - Only on the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="text-center p-4 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 scale-90 group-hover/image:scale-100">
            <p className="text-white text-sm mb-3 font-medium">Available Rooms</p>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/80 backdrop-blur-sm border-primary/30 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tenant/properties/${property.id}/rooms`);
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
      <CardContent className="pt-4 pb-6 flex-grow">
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
      <CardFooter className="pt-0 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setIsModalOpen(true)}
        >
          <Info className="w-4 h-4 mr-2" />
          View Property Details
        </Button>
      </CardFooter>

      {/* Property Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {property.propertyName}
            </DialogTitle>
            <DialogDescription>
              Complete property information and details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Property Image */}
            {property.propertyImage && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={property.propertyImage}
                  alt={property.propertyName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={property.propertyStatus === 'Active' ? 'default' : 'secondary'}
                    className={cn(
                      "font-medium shadow-sm",
                      property.propertyStatus === 'Active' 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-500 text-white"
                    )}
                  >
                    {property.propertyStatus}
                  </Badge>
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Property Information
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <span className="text-sm text-right">{property.propertyAddress}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <span className="text-sm">{property.city}, {property.state}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Contact</span>
                    </div>
                    <span className="text-sm">{property.propertyContact}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/20 rounded-lg">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/tenant/properties/${property.id}/rooms`);
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Available Rooms
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TenantPropertyCard;