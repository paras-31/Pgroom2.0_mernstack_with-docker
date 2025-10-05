import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';
import { 
  Payment, 
  PaymentStatus,
  CreatePaymentOrderRequest, 
  CreatePaymentOrderResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentListResponse,
  TenantPaymentsRequest 
} from '@/lib/types/payment';
import { TenantRoomDetails } from './tenantService';

/**
 * Tenant Payment Service
 * Provides payment-related operations specifically for tenants
 */
export const tenantPaymentService = {
  /**
   * Get current tenant ID for authenticated user
   */
  getTenantId: async (): Promise<ApiResponse<{ tenantId: number }>> => {
    return apiService.get(endpoints.TENANT.ID);
  },

  /**
   * Get current tenant's room details
   */
  getTenantRoomDetails: async (): Promise<ApiResponse<TenantRoomDetails>> => {
    return apiService.get(endpoints.TENANT.ROOM_DETAILS);
  },

  /**
   * Create payment order for current tenant's rent
   */
  createRentPaymentOrder: async (
    tenantRoomDetails: TenantRoomDetails
  ): Promise<ApiResponse<CreatePaymentOrderResponse>> => {
    const orderData: CreatePaymentOrderRequest = {
      tenantId: tenantRoomDetails.tenants[0]?.id, // Current user's ID from tenant details
      propertyId: tenantRoomDetails.property.id,
      roomId: tenantRoomDetails.id,
      amount: parseFloat(tenantRoomDetails.rent.toString()),
      description: `Monthly rent payment for Room ${tenantRoomDetails.roomNo}`
    };

    return apiService.post(endpoints.PAYMENT.CREATE_ORDER, orderData);
  },

  /**
   * Verify payment for tenant
   */
  verifyPayment: async (
    verificationData: PaymentVerificationRequest
  ): Promise<ApiResponse<PaymentVerificationResponse>> => {
    return apiService.post(endpoints.PAYMENT.VERIFY, verificationData);
  },

  /**
   * Get payment history for tenant
   */
  getPaymentHistory: async (
    tenantId: number,
    params?: { page?: number; limit?: number; status?: PaymentStatus }
  ): Promise<ApiResponse<PaymentListResponse>> => {
    const requestData: TenantPaymentsRequest = {
      tenantId,
      page: params?.page || 1,
      limit: params?.limit || 10,
      status: params?.status
    };

    return apiService.post(endpoints.PAYMENT.TENANT_PAYMENTS, requestData);
  },

  /**
   * Get payment statistics for tenant
   */
  getPaymentStats: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiService.get(endpoints.PAYMENT.STATS);
  },

  /**
   * Handle payment error
   */
  handlePaymentError: (error: unknown, defaultMessage: string): Error => {
    const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
    const message = errorObj?.response?.data?.message || errorObj?.message || defaultMessage;
    return new Error(message);
  }
};

// Export endpoints for tenant payments
export const tenantPaymentEndpoints = {
  TENANT_ID: endpoints.TENANT.ID,
  TENANT_ROOM_DETAILS: endpoints.TENANT.ROOM_DETAILS,
  CREATE_ORDER: endpoints.PAYMENT.CREATE_ORDER,
  VERIFY_PAYMENT: endpoints.PAYMENT.VERIFY,
  PAYMENT_HISTORY: endpoints.PAYMENT.TENANT_PAYMENTS,
  PAYMENT_STATS: endpoints.PAYMENT.STATS
};
