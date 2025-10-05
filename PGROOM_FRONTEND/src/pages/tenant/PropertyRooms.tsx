import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail,
  Bed, 
  Users,
  IndianRupee,
  Building,
  ChevronRight,
  Copy,
  ArrowLeftRight,
  Home,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { roomService, Room } from '@/lib/api/services/roomService';
import { propertyService } from '@/lib/api/services/propertyService';
import { Property } from '@/lib/types/property';
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import TenantRoomDetailsModal from '@/components/tenant/TenantRoomDetailsModal';

const PropertyRooms: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("Available");
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomDetailsModalOpen, setIsRoomDetailsModalOpen] = useState(false);

  // Fetch property details
  const {
    data: propertyData,
    isLoading: isPropertyLoading,
    error: propertyError
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) throw new Error('Property ID is required');
      const response = await propertyService.getProperty(parseInt(propertyId));
      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to fetch property details');
      }
      return response.data;
    },
    enabled: !!propertyId
  });

  // Fetch available rooms for this property
  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    error: roomsError,
    refetch: refetchRooms
  } = useQuery({
    queryKey: ['property-rooms', propertyId, currentPage, statusFilter],
    queryFn: async () => {
      if (!propertyId) throw new Error('Property ID is required');
      const filters = statusFilter ? { status: statusFilter } : undefined;
      
      const response = await roomService.getRooms({
        propertyId: parseInt(propertyId),
        page: currentPage,
        limit: 10,
        filters
      });
      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to fetch rooms');
      }
      return response.data;
    },
    enabled: !!propertyId
  });

  // Handle image loading states
  const handleImageLoad = (roomId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [roomId]: false }));
  };

  const handleImageError = (roomId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [roomId]: false }));
  };

  // Handle room interest/contact
  const handleContactOwner = (room: Room) => {
    setSelectedRoom(room);
    setIsContactModalOpen(true);
  };

  // Handle view room details
  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomDetailsModalOpen(true);
  };

  // Handle direct contact actions
  const handleCopyPhone = async () => {
    if (propertyData?.propertyContact) {
      try {
        await navigator.clipboard.writeText(propertyData.propertyContact);
        toast.success("Phone number copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy phone number");
      }
    }
  };

  // Handle toggling between Available and Occupied
  const handleClearFilters = () => {
    // Toggle between Available and Occupied
    setStatusFilter(statusFilter === "Available" ? "Occupied" : "Available");
    setCurrentPage(1);
  };

  // Format rent display
  const formatRent = (rent: string | number) => {
    const rentValue = typeof rent === 'string' ? parseFloat(rent) : rent;
    return isNaN(rentValue) ? 'N/A' : rentValue.toLocaleString();
  };

  // Get room image
  const getRoomImage = (room: Room) => {
    if (!room.roomImage) return null;
    if (Array.isArray(room.roomImage)) {
      return room.roomImage.length > 0 ? room.roomImage[0] : null;
    }
    return room.roomImage;
  };

  if (isPropertyLoading || isRoomsLoading) {
    return (
      <DashboardLayout
        navbar={<TenantNavbar />}
        sidebar={<TenantSidebar />}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (propertyError || roomsError) {
    return (
      <DashboardLayout
        navbar={<TenantNavbar />}
        sidebar={<TenantSidebar />}
      >
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              {propertyError?.message || roomsError?.message || 'Failed to load property or rooms'}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const rooms = roomsData?.data || [];
  const property = propertyData;

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
            <div className="flex items-start justify-between mb-6">
              {/* Left side - Main header content */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-1">
                      Rooms
                    </h1>
                    <p className="text-green-100 text-base font-medium">
                      Find your perfect room from available options
                    </p>
                  </div>
                  {property && (
                    <div className="flex items-center gap-3 text-green-200">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="text-sm font-medium">{property.propertyName}</span>
                      </div>
                      <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property.propertyAddress}, {property.city}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Navigation */}
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-xs text-green-200 mb-1 tracking-wider">NAVIGATION</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/tenant/properties')}
                      className="text-white hover:bg-white/20 hover:text-white border-white/30"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Properties
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-sm text-green-200">              <Link
                to="/tenant/properties"
                className="flex items-center hover:text-white transition-colors"
              >
                <Home className="h-4 w-4 mr-1" />
                Properties
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Rooms</span>
            </nav>
          </div>
        </div>



        {/* Rooms Content */}
        {rooms.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Building className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No {statusFilter} Rooms</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  No rooms with status "{statusFilter}" found in this property. 
                  {statusFilter === "Available" ? " Try switching to Occupied status or contact the owner for more information." : " Try switching to Available status."}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="transition-colors"
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Show {statusFilter === "Available" ? "Occupied" : "Available"} Rooms
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/tenant/properties')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Properties
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const roomImage = getRoomImage(room);
              const isImageLoading = imageLoadingStates[room.id] !== false;
              
              // Check if room is fully occupied
              const isFullyOccupied = room.Tenant && room.totalBed && room.Tenant.length >= room.totalBed;

              return (
                <Card 
                  key={room.id} 
                  className={`group overflow-hidden transition-all duration-300 border-2 ${
                    isFullyOccupied 
                      ? 'opacity-60 cursor-not-allowed border-gray-300 bg-gray-50/50 dark:bg-gray-900/30 dark:border-gray-700' 
                      : 'hover:shadow-lg hover:border-primary/20'
                  }`}
                >
                  {/* Room Image */}
                  <div className={`relative overflow-hidden w-full group/image ${
                    isFullyOccupied ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`} onClick={() => !isFullyOccupied && handleViewRoom(room)}>
                    <AspectRatio ratio={16/9} className="bg-muted">
                      {roomImage ? (
                        <>
                          {isImageLoading && (
                            <div className="absolute inset-0 z-10">
                              <Skeleton className="w-full h-full" />
                            </div>
                          )}
                          <img
                            src={roomImage}
                            alt={`Room ${room.roomNo}`}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => handleImageLoad(room.id)}
                            onError={() => handleImageError(room.id)}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Bed className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </AspectRatio>

                    {/* Hover Overlay for Room Details */}
                    {!isFullyOccupied && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <div className="text-center p-4 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 scale-90 group-hover/image:scale-100">
                          <p className="text-white text-sm mb-3 font-medium">Room Details</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-primary/80 backdrop-blur-sm border-primary/30 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRoom(room);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Room
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Fully Occupied Overlay */}
                    {isFullyOccupied && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="text-center p-4">
                          <div className="bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium mb-2 shadow-lg">
                            FULLY OCCUPIED
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`border-0 shadow-lg backdrop-blur-sm ${
                        isFullyOccupied 
                          ? 'bg-red-500/90 text-white' 
                          : room.status === 'Available' 
                            ? 'bg-green-500/90 text-white'
                            : 'bg-orange-500/90 text-white'
                      }`}>
                        {isFullyOccupied ? 'FULL' : room.status}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-black/70 text-white border-0 backdrop-blur-sm">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {formatRent(room.rent)}/month
                      </Badge>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className={`text-xl transition-colors ${
                            isFullyOccupied 
                              ? 'text-gray-500 line-through opacity-75' 
                              : 'group-hover:text-primary'
                          }`}>
                            Room {room.roomNo}
                          </CardTitle>
                          {room.roomType && (
                            <CardDescription className="font-medium">{room.roomType}</CardDescription>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold flex items-center ${
                            isFullyOccupied ? 'text-gray-400 line-through' : 'text-primary'
                          }`}>
                            <IndianRupee className="h-5 w-5" />
                            {formatRent(room.rent)}
                          </div>
                          <div className={`text-sm ${
                            isFullyOccupied ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            {isFullyOccupied ? 'Not Available' : 'per month'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      {/* Room Features */}
                      <div className="flex items-center gap-4 text-sm">
                        {room.totalBed && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span>{room.totalBed} Bed{room.totalBed > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {room.Tenant && (
                          <div className={`flex items-center gap-1 ${
                            isFullyOccupied ? 'text-red-600 font-semibold' : ''
                          }`}>
                            <Users className={`h-4 w-4 ${
                              isFullyOccupied ? 'text-red-600' : 'text-muted-foreground'
                            }`} />
                            <span>{room.Tenant.length}/{room.totalBed || 1} Occupied</span>
                            {isFullyOccupied && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                FULL
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {room.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      )}

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Amenities
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 4).map((amenity, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                              >
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{room.amenities.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className={`flex-1 group/btn transition-all duration-300 ${
                            isFullyOccupied 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500' 
                              : 'hover:bg-primary/5 hover:border-primary/30'
                          }`}
                          onClick={() => !isFullyOccupied && handleViewRoom(room)}
                          size="lg"
                          disabled={isFullyOccupied}
                        >
                          <Eye className={`h-4 w-4 mr-2 transition-colors ${
                            isFullyOccupied ? 'text-gray-400' : 'group-hover/btn:text-primary'
                          }`} />
                          View Room
                        </Button>
                        <Button
                          className={`flex-1 group/btn transition-all duration-300 ${
                            isFullyOccupied 
                              ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                              : 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl'
                          }`}
                          onClick={() => !isFullyOccupied && handleContactOwner(room)}
                          size="lg"
                          disabled={isFullyOccupied}
                        >
                          <Phone className={`h-4 w-4 mr-2 ${
                            isFullyOccupied ? 'text-gray-300' : 'group-hover/btn:animate-pulse'
                          }`} />
                          {isFullyOccupied ? 'Room Full' : 'Contact Owner'}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {roomsData?.meta && roomsData.meta.totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, roomsData.meta.total)} of {roomsData.meta.total} rooms
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, roomsData.meta.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === roomsData.meta.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Owner Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Property Owner
            </DialogTitle>
            <DialogDescription>
              Get in touch with the property owner for Room {selectedRoom?.roomNo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Property Info */}
            {property && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{property.propertyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{property.propertyAddress}, {property.city}</span>
                  </div>
                  {selectedRoom && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      <span>Room {selectedRoom.roomNo} - ₹{selectedRoom.rent}/month</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contact Options
              </h4>
              
              {/* Phone Contact */}
              {property?.propertyContact && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Phone Number</p>
                        <p className="text-sm text-muted-foreground">{property.propertyContact}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopyPhone} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Contact (if phone number available) */}
              {property?.propertyContact && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Send a message</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      const message = `Hi! I'm interested in Room ${selectedRoom?.roomNo} at ${property.propertyName}. Could you please provide more details?`;
                      window.open(`https://wa.me/91${property.propertyContact}?text=${encodeURIComponent(message)}`, '_blank');
                      toast.success("Opening WhatsApp");
                      setIsContactModalOpen(false);
                    }}
                    variant="outline" 
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    WhatsApp
                  </Button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Contact Tips
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Mention the room number and your preferred viewing time when contacting the owner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Details Modal */}
      {selectedRoom && (
        <TenantRoomDetailsModal
          room={selectedRoom}
          isOpen={isRoomDetailsModalOpen}
          onClose={() => setIsRoomDetailsModalOpen(false)}
          onContactOwner={handleContactOwner}
          propertyName={property?.propertyName}
          propertyAddress={property ? `${property.propertyAddress}, ${property.city}` : undefined}
        />
      )}
    </DashboardLayout>
  );
};

export default PropertyRooms;
