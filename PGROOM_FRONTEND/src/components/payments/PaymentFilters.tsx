/**
 * PaymentFilters Component
 *
 * Advanced filtering component for payment management with modern UI,
 * including status filters, date range, search, property/tenant filters,
 * and smooth animations for enhanced user experience.
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Search, FilterX } from 'lucide-react';
import {
  Form,
  FormField,
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
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PaymentStatus, PaymentListParams } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

// Filter form schema
const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  propertyId: z.string().optional(),
  tenantId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

// Props interface
interface PaymentFiltersProps {
  onFiltersChange: (filters: PaymentListParams) => void;
  isLoading?: boolean;
  className?: string;
}

// Status options
const statusOptions: { value: PaymentStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Payments', color: 'bg-gray-100 text-gray-800' },
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Captured', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'Failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'Refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
];

// Main PaymentFilters Component
export const PaymentFilters = memo<PaymentFiltersProps>(({
  onFiltersChange,
  isLoading = false,
  className
}) => {
  const [activeFilters, setActiveFilters] = useState<PaymentListParams>({});
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const isClearingRef = useRef(false);

  // Form setup
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: '',
      status: 'all',
      propertyId: '',
      tenantId: '',
      limit: 10,
      page: 1,
    }
  });

  // Handle form submission
  const onSubmit = useCallback((values: FilterFormValues) => {
    const filters: PaymentListParams = {
      page: 1, // Reset to first page when filtering
      limit: values.limit || 10, // Include limit value
    };

    if (values.search?.trim()) {
      filters.search = values.search.trim();
    }

    if (values.status && values.status !== 'all') {
      filters.status = values.status as PaymentStatus;
    }

    if (values.propertyId) {
      filters.propertyId = parseInt(values.propertyId);
    }

    if (values.tenantId) {
      filters.tenantId = parseInt(values.tenantId);
    }

    // Handle date filters with proper validation
    if (values.startDate) {
      filters.startDate = format(values.startDate, 'yyyy-MM-dd');
    }

    // Only include endDate if startDate is also provided to avoid backend validation error
    if (values.endDate && values.startDate) {
      filters.endDate = format(values.endDate, 'yyyy-MM-dd');
    }

    setActiveFilters(filters);
    onFiltersChange(filters);
  }, [onFiltersChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    // Set flag to prevent debounced watcher from interfering
    isClearingRef.current = true;

    // Preserve current limit value
    const currentLimit = form.getValues('limit') || 10;

    const resetValues = {
      search: '',
      status: 'all',
      propertyId: '',
      tenantId: '',
      startDate: undefined,
      endDate: undefined,
      limit: currentLimit, // Preserve limit
      page: 1,
    };

    // Reset form values
    form.reset(resetValues);

    // Clear active filters state
    setActiveFilters({});

    // Close any open popovers
    setStartDateOpen(false);
    setEndDateOpen(false);

    // Immediately call onFiltersChange with page and limit preserved
    const clearedFilters: PaymentListParams = { page: 1, limit: currentLimit };
    onFiltersChange(clearedFilters);

    // Reset the flag after a short delay
    setTimeout(() => {
      isClearingRef.current = false;
    }, 100);
  }, [form, onFiltersChange]);

  // Handle date changes with validation
  const handleDateChange = useCallback((field: 'startDate' | 'endDate', date: Date | undefined) => {
    form.setValue(field, date);

    // If clearing start date, also clear end date
    if (field === 'startDate' && !date) {
      form.setValue('endDate', undefined);
    }

    // Close the respective popover when date is selected
    if (field === 'startDate') {
      setStartDateOpen(false);
    } else if (field === 'endDate') {
      setEndDateOpen(false);
    }

    // Trigger validation for both date fields
    form.trigger(['startDate', 'endDate']);
  }, [form]);

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).filter(
    key => key !== 'page' && activeFilters[key as keyof PaymentListParams] !== undefined
  ).length;

  // Auto-submit on form changes (debounced)
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Skip if we're currently clearing filters
      if (isClearingRef.current) {
        return;
      }

      const timer = setTimeout(() => {
        // Double-check the flag before submitting
        if (!isClearingRef.current) {
          onSubmit(values as FilterFormValues);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Filter Grid - Matching tenant page layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Search - Takes 3 columns on md screens */}
              <div className="relative md:col-span-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tenant name, property, room, or payment ID"
                  className="pl-10 h-10"
                  {...form.register('search')}
                  disabled={isLoading}
                />
              </div>

              {/* Filters - Takes 6 columns on md screens */}
              <div className="flex flex-wrap gap-3 md:col-span-6">
                {/* Status Filter */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10 w-[180px] h-10 [&>span]:truncate [&>span]:min-w-0">
                      <SelectValue placeholder="All Payments" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Filter */}
                <div className="relative flex-1 min-w-[150px]">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-10 justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'MMM dd, yyyy') : 'Start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateChange('startDate', date)}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* End Date Filter */}
                <div className="relative flex-1 min-w-[150px]">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => {
                      const startDate = form.watch('startDate');
                      const isEndDateDisabled = !startDate || isLoading;

                      return (
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full h-10 justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground',
                                isEndDateDisabled && 'opacity-50 cursor-not-allowed'
                              )}
                              disabled={isEndDateDisabled}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'MMM dd, yyyy') :
                               !startDate ? 'Select start date first' : 'End date'}
                            </Button>
                          </PopoverTrigger>
                          {!isEndDateDisabled && (
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => handleDateChange('endDate', date)}
                                disabled={(date) => {
                                  return date > new Date() ||
                                         date < new Date('1900-01-01') ||
                                         (startDate && date < startDate);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          )}
                        </Popover>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Actions - Takes 3 columns on md screens */}
              <div className="flex items-center justify-end gap-3 md:col-span-3">
                {/* Reset Filters Button */}
                {activeFilterCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={clearFilters}
                          className="h-10 w-10"
                          disabled={isLoading}
                        >
                          <FilterX className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear filters</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                  <Select
                    value={String(form.watch('limit') || 10)}
                    onValueChange={(value) => {
                      form.setValue('limit', Number(value));
                      form.setValue('page', 1);
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-10">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

PaymentFilters.displayName = 'PaymentFilters';

export default PaymentFilters;
