import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  BedDouble, 
  Users, 
  AlertCircle, 
  ImageIcon, 
  IndianRupee,
  MapPin,
  Calendar,
  Bed,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  Home,
  Star,
  Shield
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { tenantService, TenantRoomDetails } from '@/lib/api/services/tenantService';
import { useToast } from '@/hooks/use-toast';

const TenantRoom = () => {
  const [roomDetails, setRoomDetails] = useState<TenantRoomDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tenantService.getTenantRoomDetails();
        
        if (response.statusCode === 200 && response.data) {
          setRoomDetails(response.data);
        } else {
          // Check if the response message contains "Room assignment not found"
          const responseMessage = response.message || 'No room assignment found';
          setError('No room assignment found');
          
          // Don't show toaster for room assignment not found since functionality is being implemented
          if (!responseMessage.toLowerCase().includes('room assignment not found')) {
            toast({
              title: "Error",
              description: responseMessage,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room details';
        setError(errorMessage);
        
        // Only show toaster for actual errors, not for "Room assignment not found"
        if (!errorMessage.toLowerCase().includes('room assignment not found') && 
            !errorMessage.toLowerCase().includes('room assignment')) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [toast]);

  const nextImage = () => {
    if (roomDetails?.roomImage && roomDetails.roomImage.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === roomDetails.roomImage.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (roomDetails?.roomImage && roomDetails.roomImage.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? roomDetails.roomImage.length - 1 : prev - 1
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'occupied':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout
      navbar={<TenantNavbar />}
      sidebar={<TenantSidebar />}
    >
      <div className="w-full px-6 lg:px-8 space-y-6">
        {/* Modern Header Section - Full Width */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 dark:from-primary dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    My Room
                  </h1>
                  {roomDetails && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-green-200">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{roomDetails.property.name}</span>
                      </div>
                      <div className="flex items-start gap-2 text-green-200">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="text-xs leading-relaxed">{roomDetails.property.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {roomDetails && !isLoading && !error && (
                <div className="hidden lg:flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50/20 text-green-100 border-green-300/40 px-4 py-2 text-sm font-medium">
                    {roomDetails.property.type}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Quick Stats - Enhanced Grid */}
            {roomDetails && !isLoading && !error && (
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <BedDouble className="h-6 w-6 text-green-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Room Number</p>
                    <p className="text-white font-bold text-lg">{roomDetails.roomNo}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <IndianRupee className="h-6 w-6 text-emerald-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Monthly Rent</p>
                    <p className="text-white font-bold text-lg">₹{roomDetails.rent}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <Users className="h-6 w-6 text-green-300 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Occupancy</p>
                    <p className="text-white font-bold text-lg">
                      {roomDetails.occupancy.current}/{roomDetails.occupancy.total}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <Bed className="h-6 w-6 text-emerald-300 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Total Beds</p>
                    <p className="text-white font-bold text-lg">{roomDetails.totalBed}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <Building2 className="h-6 w-6 text-green-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Property</p>
                    <p className="text-white font-bold text-sm truncate">{roomDetails.property.type}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <UserCheck className="h-6 w-6 text-emerald-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Roommates</p>
                    <p className="text-white font-bold text-lg">{roomDetails.tenants.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading your room details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No Room Assignment</h3>
                <p className="text-muted-foreground mb-6">
                  You are not currently assigned to any room. Please contact the property manager for assistance.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Information Content */}
        {roomDetails && !isLoading && !error && (
          <>
            {/* Main Content Layout - Images, Room Info, and Roommates */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Room Images Gallery - Left Side */}
              {roomDetails.roomImage && roomDetails.roomImage.length > 0 && (
                <Card className="xl:col-span-2 overflow-hidden shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <ImageIcon className="h-6 w-6 text-primary" />
                        Room Gallery
                        <Badge variant="secondary" className="text-xs">
                          {roomDetails.roomImage.length} Photos
                        </Badge>
                      </CardTitle>
                      {roomDetails.roomImage.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevImage}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            {currentImageIndex + 1} / {roomDetails.roomImage.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextImage}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={roomDetails.roomImage[currentImageIndex]}
                        alt={`Room ${roomDetails.roomNo} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-room.jpg';
                        }}
                      />
                      {roomDetails.roomImage.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {roomDetails.roomImage.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={cn(
                                "w-3 h-3 rounded-full transition-all duration-200",
                                index === currentImageIndex 
                                  ? "bg-white scale-110 shadow-lg" 
                                  : "bg-white/60 hover:bg-white/80"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Information and Roommates - Right Side */}
              <div className="xl:col-span-1 space-y-6">
                {/* Room Information */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <BedDouble className="h-6 w-6 text-primary" />
                      Room Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Room Number</span>
                        </div>
                        <span className="font-semibold">{roomDetails.roomNo}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Monthly Rent</span>
                        </div>
                        <span className="font-semibold text-primary">₹{roomDetails.rent}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Total Beds</span>
                        </div>
                        <span className="font-semibold">{roomDetails.totalBed}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Occupancy</span>
                        </div>
                        <span className="font-semibold">
                          {roomDetails.occupancy.current}/{roomDetails.occupancy.total}
                        </span>
                      </div>

                      {roomDetails.description && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              Description
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                              {roomDetails.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Roommates */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <UserCheck className="h-6 w-6 text-primary" />
                      Roommates
                      <Badge variant="secondary" className="text-xs">
                        {roomDetails.tenants.length} 
                        {roomDetails.tenants.length === 1 ? ' Person' : ' People'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {roomDetails.tenants.length > 0 ? (
                        <>
                          {roomDetails.tenants.map((tenant, index) => (
                            <div
                              key={tenant.id}
                              className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30 hover:shadow-md transition-all duration-200"
                            >
                              <Avatar className="h-12 w-12 ring-2 ring-primary/30 dark:ring-primary/50">
                                <AvatarImage src="" alt={tenant.name} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-white font-semibold">
                                  {tenant.firstName[0]}{tenant.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">
                                  {tenant.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Roommate
                                </p>
                              </div>
                              {index === 0 && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                                  You
                                </Badge>
                              )}
                            </div>
                          ))}
                          
                          {roomDetails.occupancy.current < roomDetails.occupancy.total && (
                            <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl text-center">
                              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {roomDetails.occupancy.total - roomDetails.occupancy.current} more 
                                {roomDetails.occupancy.total - roomDetails.occupancy.current === 1 ? ' spot' : ' spots'} available
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">
                            No roommates assigned yet
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TenantRoom;
