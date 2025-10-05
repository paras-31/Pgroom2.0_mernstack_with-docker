/**
 * PaymentPagination Component
 *
 * A modern pagination component for payment tables with proper navigation,
 * page size selection, and accessibility features.
 */

import React, { memo, useCallback } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { PaginationMeta } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

// Props interface
interface PaymentPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

// Generate pagination items matching other pages
const renderPaginationItems = (page: number, totalPages: number, onPageChange: (page: number) => void) => {
  const items = [];

  // Always show first page
  items.push(
    <PaginationItem key="first">
      <PaginationLink
        isActive={page === 1}
        onClick={() => {
          if (page !== 1) {
            onPageChange(1);
          }
        }}
      >
        1
      </PaginationLink>
    </PaginationItem>
  );

  // Show ellipsis if there are more than 5 pages and we're not at the beginning
  if (totalPages > 5 && page > 3) {
    items.push(
      <PaginationItem key="ellipsis-1">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  // Show current page and surrounding pages
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
    items.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={page === i}
          onClick={() => {
            if (page !== i) {
              onPageChange(i);
            }
          }}

        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  // Show ellipsis if there are more than 5 pages and we're not at the end
  if (totalPages > 5 && page < totalPages - 2) {
    items.push(
      <PaginationItem key="ellipsis-2">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    items.push(
      <PaginationItem key="last">
        <PaginationLink
          isActive={page === totalPages}
          onClick={() => {
            if (page !== totalPages) {
              onPageChange(totalPages);
            }
          }}
          className="h-8 w-8 text-sm"
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return items;
};

// Main PaymentPagination Component
export const PaymentPagination = memo<PaymentPaginationProps>(({
  pagination,
  onPageChange,
  isLoading = false,
  className
}) => {
  const { page, totalPages, total } = pagination;

  // Don't render if no pagination needed
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-between items-center mt-6">
      {/* Total Records - Left side */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Total Records: {total || 0}
      </p>

      {/* Pagination - Right side */}
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (page > 1) {
                  onPageChange(page - 1);
                }
              }}
              aria-disabled={page === 1 || isLoading}
              className={page === 1 ? "opacity-50 pointer-events-none" : ""}
            />
          </PaginationItem>

          {renderPaginationItems(page, totalPages, onPageChange)}

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (page < totalPages) {
                  onPageChange(page + 1);
                }
              }}
              aria-disabled={page === totalPages || isLoading}
              className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
});

PaymentPagination.displayName = 'PaymentPagination';

export default PaymentPagination;
