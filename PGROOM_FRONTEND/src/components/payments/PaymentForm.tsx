/**
 * Payment Form Component
 *
 * A comprehensive form for creating payment orders with validation,
 * accessibility, Razorpay integration, and enhanced UI animations.
 * Features smooth transitions, interactive feedback, and improved UX.
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, User, Building, Home } from 'lucide-react';
import { CreatePaymentOrderRequest, PaymentFormData } from '@/lib/types/payment';
import { usePayment } from '@/hooks/usePayments';
import { propertyService, tenantService, roomService } from '@/lib/api/services';
import { cn } from '@/lib/utils';

// Validation schema - Updated order: Property → Room → Tenant
const paymentFormSchema = z.object({
  propertyId: z.number().min(1, 'Please select a property'),
  roomId: z.number().min(1, 'Please select a room'),
  tenantId: z.number().min(1, 'Please select a tenant'),
  amount: z.number().min(1, 'Amount must be greater than 0')
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Props interface
interface PaymentFormProps {
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<PaymentFormData>;
  className?: string;
}

// Option interfaces - Updated to match actual API responses
interface TenantOption {
  id: number;
  userId: number;
  username: string;
}

interface PropertyOption {
  id: number;
  propertyName: string;
  propertyAddress: string;
}

interface RoomOption {
  id: number;
  roomNo: number;
  rent: string;
}

// Main Payment Form Component
export const PaymentForm = memo<PaymentFormProps>(({
  onSuccess,
  onCancel,
  initialData,
  className
}) => {
  // State - Updated order: Property → Room → Tenant
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Hooks
  const { processPayment, isLoading } = usePayment();

  // Form setup - Updated order: Property → Room → Tenant
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      propertyId: initialData?.propertyId || 0,
      roomId: initialData?.roomId || 0,
      tenantId: initialData?.tenantId || 0,
      amount: initialData?.amount || 0
    }
  });

  const { watch, setValue, reset } = form;
  const selectedPropertyId = watch('propertyId');
  const selectedRoomId = watch('roomId');

  // Load properties
  const loadProperties = useCallback(async () => {
    setLoadingProperties(true);
    try {
      const response = await propertyService.getProperties({
        page: 1,
        limit: 100
      });

      if (response.statusCode === 200 && response.data) {
        const propertyOptions = response.data.data.map(property => ({
          id: property.id,
          propertyName: property.propertyName,
          propertyAddress: property.propertyAddress
        }));

        setProperties(propertyOptions);
      } else {
        throw new Error(response.message || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  // Load rooms for selected property
  const loadRooms = useCallback(async (propertyId: number) => {
    if (!propertyId) {
      setRooms([]);
      setTenants([]); // Clear tenants when property changes
      return;
    }

    setLoadingRooms(true);
    try {
      const response = await roomService.getRooms({
        propertyId,
        page: 1,
        limit: 100
      });

      if (response.statusCode === 200 && response.data) {
        // The response.data contains the RoomListResponse with data property
        const roomOptions = response.data.data.map(room => ({
          id: room.id,
          roomNo: parseInt(room.roomNo.toString()),
          rent: room.rent.toString()
        }));

        setRooms(roomOptions);
      } else {
        throw new Error(response.message || 'Failed to load rooms');
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Load tenants for selected property and room
  const loadTenants = useCallback(async (propertyId: number, roomId: number) => {
    if (!propertyId || !roomId) {
      setTenants([]);
      return;
    }

    setLoadingTenants(true);
    try {
      const response = await tenantService.getTenantsByRoom(propertyId, roomId);

      if (response.statusCode === 200 && response.data) {
        // The API returns an array of tenant objects with id, userId, and username
        const tenantOptions = response.data.map((tenant: any) => ({
          id: tenant.id,
          userId: tenant.userId,
          username: tenant.username
        }));

        setTenants(tenantOptions);
      } else {
        // If no tenants found, set empty array (not an error)
        setTenants([]);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
      setTenants([]);
      // Don't show error toast for no tenants found
      if (!error?.message?.includes('not found')) {
        toast.error('Failed to load tenants');
      }
    } finally {
      setLoadingTenants(false);
    }
  }, []);

  // Auto-fill amount when room is selected
  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      const selectedRoom = rooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        setValue('amount', parseFloat(selectedRoom.rent));
      }
    }
  }, [selectedRoomId, rooms, setValue]);

  // Load rooms when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      loadRooms(selectedPropertyId);
      // Reset room and tenant selection when property changes
      setValue('roomId', 0);
      setValue('tenantId', 0);
    }
  }, [selectedPropertyId, loadRooms, setValue]);

  // Load tenants when room changes
  useEffect(() => {
    if (selectedPropertyId && selectedRoomId) {
      loadTenants(selectedPropertyId, selectedRoomId);
      // Reset tenant selection when room changes
      setValue('tenantId', 0);
    }
  }, [selectedPropertyId, selectedRoomId, loadTenants, setValue]);

  // Load initial data
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Handle form submission
  const onSubmit = useCallback(async (values: PaymentFormValues) => {
    try {
      // Find the selected tenant to get the userId
      const selectedTenant = tenants.find(t => t.id === values.tenantId);
      if (!selectedTenant) {
        toast.error('Please select a valid tenant');
        return;
      }

      const orderData: CreatePaymentOrderRequest = {
        tenantId: selectedTenant.userId, // Use userId for the payment API
        propertyId: values.propertyId,
        roomId: values.roomId,
        amount: values.amount,
        description: 'Monthly rent payment' // Default description
      };

      // Get tenant details for prefill
      const userDetails = {
        name: selectedTenant.username,
        // Note: We don't have email from the tenant API, so we'll skip it
      };

      const response = await processPayment(orderData, userDetails);

      if (response.success) {
        reset();
        onSuccess?.(response.payment.razorpayPaymentId || '');
      }
    } catch (error) {
      // Error is already handled by the hook
      console.error('Payment processing failed:', error);
    }
  }, [tenants, processPayment, reset, onSuccess]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    reset();
    onCancel?.();
  }, [reset, onCancel]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Property Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <motion.div
                      animate={{
                        scale: field.value ? 1.1 : 1,
                        color: field.value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Building className="h-4 w-4" />
                    </motion.div>
                    Property
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ''}
                    disabled={loadingProperties}
                  >
                    <FormControl>
                      <SelectTrigger className={cn(
                        "transition-all duration-200",
                        fieldState.error && "border-destructive focus:ring-destructive",
                        field.value && "border-primary/50"
                      )}>
                        <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select a property'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <AnimatePresence>
                        {properties.map((property, index) => (
                          <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <SelectItem value={property.id.toString()}>
                              {property.propertyName}
                            </SelectItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Room Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="roomId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <motion.div
                      animate={{
                        scale: field.value ? 1.1 : 1,
                        color: field.value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Home className="h-4 w-4" />
                    </motion.div>
                    Room
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ''}
                    disabled={loadingRooms || !selectedPropertyId}
                  >
                    <FormControl>
                      <SelectTrigger className={cn(
                        "transition-all duration-200",
                        fieldState.error && "border-destructive focus:ring-destructive",
                        field.value && "border-primary/50",
                        (!selectedPropertyId || loadingRooms) && "opacity-60"
                      )}>
                        <SelectValue
                          placeholder={
                            !selectedPropertyId
                              ? 'Select a property first'
                              : loadingRooms
                                ? 'Loading rooms...'
                                : 'Select a room'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <AnimatePresence>
                        {rooms.map((room, index) => (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <SelectItem value={room.id.toString()}>
                              Room {room.roomNo}
                            </SelectItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Tenant Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <motion.div
                      animate={{
                        scale: field.value ? 1.1 : 1,
                        color: field.value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="h-4 w-4" />
                    </motion.div>
                    Tenant
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ''}
                    disabled={loadingTenants || !selectedRoomId}
                  >
                    <FormControl>
                      <SelectTrigger className={cn(
                        "transition-all duration-200",
                        fieldState.error && "border-destructive focus:ring-destructive",
                        field.value && "border-primary/50",
                        (!selectedRoomId || loadingTenants) && "opacity-60"
                      )}>
                        <SelectValue
                          placeholder={
                            !selectedRoomId
                              ? 'Select a room first'
                              : loadingTenants
                                ? 'Loading tenants...'
                                : tenants.length === 0
                                  ? 'No tenants assigned to this room'
                                  : 'Select a tenant'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <AnimatePresence>
                        {tenants.map((tenant, index) => (
                          <motion.div
                            key={tenant.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <SelectItem value={tenant.id.toString()}>
                              {tenant.username}
                            </SelectItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <motion.div
                      animate={{
                        scale: field.value ? 1.1 : 1,
                        color: field.value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <CreditCard className="h-4 w-4" />
                    </motion.div>
                    Amount (₹)
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="Enter amount"
                        className={cn(
                          "transition-all duration-200",
                          fieldState.error && "border-destructive focus:ring-destructive",
                          field.value && "border-primary/50"
                        )}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </motion.div>
                  </FormControl>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormMessage />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Payment
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
});

PaymentForm.displayName = 'PaymentForm';

export default PaymentForm;
