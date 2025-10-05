import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PropertyCardSkeletonProps {
  className?: string;
}

/**
 * PropertyCardSkeleton - A skeleton loading state for property cards
 *
 * This component mimics the structure of the PropertyCard component
 * but displays skeleton loaders instead of actual content.
 */
const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ className }) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border",
        "group relative flex flex-col h-full",
        "bg-card",
        className
      )}
    >
      {/* Property Image Skeleton */}
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16/9} className="bg-muted/20">
          <Skeleton className="w-full h-full" />
        </AspectRatio>


      </div>

      {/* Property Title and Address Skeleton */}
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardHeader>

      {/* Property Details Skeleton */}
      <CardContent className="pt-4 pb-0 flex-grow">
        <Separator className="mb-4 bg-border/50" />

        {/* Property Information List Skeleton */}
        <div className="space-y-3">
          {/* Location Skeleton */}
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Contact Skeleton */}
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>

      {/* Action Buttons Skeleton */}
      <CardFooter className="pt-4 pb-4 flex justify-between gap-2 mt-auto">
        <div className="flex gap-2 flex-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <Skeleton className="h-9 w-10 rounded-full" />
      </CardFooter>
    </Card>
  );
};

export default PropertyCardSkeleton;
