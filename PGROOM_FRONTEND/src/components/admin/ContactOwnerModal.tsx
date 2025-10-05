/**
 * ContactOwnerModal - A modal component for contacting property owners from the admin panel
 * 
 * This component provides admin users with multiple ways to contact property owners,
 * including phone calls, email, and WhatsApp messaging. It follows the same design
 * patterns as the tenant Contact Owner functionality.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  Copy,
  MessageCircle,
  User,
  Building,
  MapPin
} from 'lucide-react';
import { AdminProperty } from '@/lib/types/property';

interface ContactOwnerModalProps {
  property: AdminProperty;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ContactOwnerModal - Modern contact owner modal for admin panel
 * 
 * Features:
 * - Multiple contact methods (phone, email, WhatsApp)
 * - Copy to clipboard functionality
 * - Pre-formatted WhatsApp messages
 * - Property context information
 * - Consistent styling with the application theme
 */
const ContactOwnerModal = memo<ContactOwnerModalProps>(({
  property,
  isOpen,
  onClose
}) => {
  // Handle copy phone number to clipboard
  const handleCopyPhone = async () => {
    if (property.ownerContact) {
      try {
        await navigator.clipboard.writeText(property.ownerContact);
        toast.success("Phone number copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy phone number");
      }
    }
  };

  // Handle copy email to clipboard
  const handleCopyEmail = async () => {
    if (property.ownerEmail) {
      try {
        await navigator.clipboard.writeText(property.ownerEmail);
        toast.success("Email address copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy email address");
      }
    }
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (property.ownerContact) {
      const message = `Hi ${property.ownerName}! This is regarding your property "${property.name}" located at ${property.address}. Could you please get in touch with us at your earliest convenience?`;
      const whatsappUrl = `https://wa.me/91${property.ownerContact}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast.success("Opening WhatsApp");
      onClose();
    }
  };

  // Handle direct phone call
  const handlePhoneCall = () => {
    if (property.ownerContact) {
      window.open(`tel:${property.ownerContact}`, '_self');
      toast.success("Initiating phone call");
    }
  };

  // Handle email
  const handleEmail = () => {
    if (property.ownerEmail) {
      const subject = `Regarding Property: ${property.name}`;
      const body = `Dear ${property.ownerName},\n\nI hope this email finds you well. This is regarding your property "${property.name}" located at ${property.address}.\n\nBest regards,\nProperty Management Team`;
      window.open(`mailto:${property.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
      toast.success("Opening email client");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <DialogTitle className="text-xl font-bold text-white mb-1">
              Contact Property Owner
            </DialogTitle>
            <DialogDescription className="text-green-100 opacity-90">
              Get in touch with {property.ownerName} about {property.name}
            </DialogDescription>

            {/* Owner info card */}
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">
                  {property.ownerName}
                </div>
                <div className="text-xs text-green-100 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {property.totalRooms} rooms
                </div>
              </div>
            </div>
          </div>

          {/* Contact options */}
          <div className="p-6 space-y-4">
            {/* Property context */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{property.name}</span>
                <Badge className="text-xs">
                  {property.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {property.address}, {property.city}, {property.state}
              </div>
            </div>

            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contact Options
            </h4>
            
            {/* No contact information available */}
            {!property.ownerContact && !property.ownerEmail && (
              <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Phone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No Contact Information</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact information for this owner is not available.
                  </p>
                </div>
              </div>
            )}
            
            {/* Phone Contact */}
            {property.ownerContact && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">{property.ownerContact}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyPhone} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={handlePhoneCall} variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Contact */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Send a message</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleWhatsAppContact}
                    variant="outline" 
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* Email Contact */}
            {property.ownerEmail && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{property.ownerEmail}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyEmail} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleEmail} variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Admin Contact Tips
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    When contacting the property owner, clearly identify yourself as the platform administrator and mention the specific property details.
                  </p>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});

ContactOwnerModal.displayName = 'ContactOwnerModal';

export default ContactOwnerModal;
