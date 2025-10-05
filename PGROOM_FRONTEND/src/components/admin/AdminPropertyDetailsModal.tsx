import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  IndianRupee,
  Calendar,
  Eye,
  BedDouble,
  Home,
  Star,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';

import { propertyService } from '@/lib/api/services';
import { AdminProperty } from '@/lib/types/property';
import { isApiSuccessResponse } from '@/lib/types/api';
import { toast } from 'sonner';
import ContactOwnerModal from './ContactOwnerModal';

interface AdminPropertyDetailsModalProps {
  property: AdminProperty;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AdminPropertyDetailsModal - A comprehensive modal for viewing property details in admin panel
 */
const AdminPropertyDetailsModal: React.FC<AdminPropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [isContactOwnerModalOpen, setIsContactOwnerModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fetch detailed property information
  const {
    data: propertyDetails,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-property-details', property.id],
    queryFn: async () => {
      const response = await propertyService.getProperty(property.id);
      if (isApiSuccessResponse(response)) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch property details');
    },
    enabled: isOpen,
    retry: 2,
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsContactOwnerModalOpen(false);
      setCopiedField(null);
      setImageError(false);
    }
  }, [isOpen]);

  // Handle copy to clipboard
  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Get status color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if contact information is available
  const hasContactInfo = property.ownerContact || property.ownerEmail;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {property.name}
              <Badge className={cn("ml-2", getStatusBadgeColor(property.status))}>
                {property.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Comprehensive property information and management details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading property details...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load property details. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Property Details */}
            {propertyDetails && (
              <>
                {/* Property Image */}
                {propertyDetails.propertyImage && (
                  <div className="relative overflow-hidden rounded-lg">
                    <AspectRatio ratio={16 / 9} className="bg-muted/20">
                      {!imageError ? (
                        <img
                          src={propertyDetails.propertyImage}
                          alt={property.name}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Building className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                      )}
                    </AspectRatio>
                    <div className="absolute top-3 right-3">
                      <Badge className={cn("shadow-sm font-medium", getStatusBadgeColor(property.status))}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Property Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Property Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Name</span>
                          <span className="font-medium">{property.name}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Address</span>
                          <div className="text-right max-w-[200px]">
                            <span className="font-medium text-sm">{property.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Location</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{property.city}, {property.state}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Total Rooms</span>
                          <div className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{property.totalRooms}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Monthly Revenue</span>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-green-600">{formatCurrency(property.monthlyRevenue)}</span>
                          </div>
                        </div>
                        {propertyDetails.propertyContact && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Contact</span>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{propertyDetails.propertyContact}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyToClipboard(propertyDetails.propertyContact, 'Phone')}
                              >
                                {copiedField === 'Phone' ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Owner Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Owner Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Name</span>
                          <span className="font-medium">{property.ownerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Email</span>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-sm">{property.ownerEmail}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopyToClipboard(property.ownerEmail, 'Email')}
                            >
                              {copiedField === 'Email' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {property.ownerContact && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Contact</span>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{property.ownerContact}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyToClipboard(property.ownerContact!, 'Owner Contact')}
                              >
                                {copiedField === 'Owner Contact' ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Created</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatDate(property.createdDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatDate(property.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Owner Modal */}
      {isContactOwnerModalOpen && (
        <ContactOwnerModal
          property={property}
          isOpen={isContactOwnerModalOpen}
          onClose={() => setIsContactOwnerModalOpen(false)}
        />
      )}
    </>
  );
};

export default AdminPropertyDetailsModal;
