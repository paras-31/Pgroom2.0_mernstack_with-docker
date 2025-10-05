import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface RoomCardSkeletonProps {
  className?: string;
}

/**
 * RoomCardSkeleton - A skeleton loading state for room cards
 *
 * This component mimics the structure of the RoomCard component
 * but displays skeleton loaders instead of actual content.
 */
const RoomCardSkeleton: React.FC<RoomCardSkeletonProps> = ({ className }) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border",
        "group relative flex flex-col h-full",
        "bg-card",
        className
      )}
    >
      {/* Room Image Skeleton */}
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16/9} className="bg-muted/20">
          <Skeleton className="w-full h-full" />
        </AspectRatio>
        
        {/* Status Badge Skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Room Title and Type Skeleton */}
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>

      {/* Room Details Skeleton */}
      <CardContent className="pt-4 pb-0 flex-grow">
        <Separator className="mb-4 bg-border/50" />

        {/* Room Information List Skeleton */}
        <div className="space-y-3">
          {/* Price Skeleton */}
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Beds Skeleton */}
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Availability Skeleton */}
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>

      {/* Action Buttons Skeleton */}
      <CardFooter className="pt-4 pb-4 flex justify-between gap-2 mt-auto">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-10 rounded-full" />
      </CardFooter>
    </Card>
  );
};

export default RoomCardSkeleton;
