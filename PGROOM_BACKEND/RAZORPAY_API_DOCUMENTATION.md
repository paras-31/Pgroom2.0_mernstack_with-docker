# Razorpay Payment Integration API Documentation

## Overview

This document provides comprehensive documentation for the Razorpay payment integration in the PGROOM backend system. The integration supports rent payment processing, payment verification, refunds, and webhook handling.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Webhook Integration](#webhook-integration)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

## Setup and Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Database Schema

The payment system uses the existing `Payment` model in Prisma schema with the following fields:

```prisma
model Payment {
  id                Int            @id @default(autoincrement())
  tenantId          Int
  propertyId        Int
  roomId            Int
  amount            Float
  currency          String         @default("INR")
  razorpayOrderId   String?        @unique
  razorpayPaymentId String?        @unique
  razorpaySignature String?
  status            PaymentStatus
  paymentMethod     PaymentMethod?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  // Relations...
}

enum PaymentStatus {
  Pending
  Authorized
  Captured
  Failed
  Refunded
}
```

## Authentication

All payment APIs (except webhooks) require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Create Payment Order

Creates a new Razorpay order for rent payment.

**Endpoint:** `POST /pgrooms/v1/payment/create-order`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "tenantId": 1,
  "propertyId": 1,
  "roomId": 1,
  "amount": 5000.00,
  "description": "Monthly rent payment for January 2024"
}
```

**Response:**
```json
{
  "message": "Payment order created successfully",
  "statusCode": 200,
  "data": {
    "orderId": "order_MNqQvzp8zp8zp8",
    "amount": 500000,
    "currency": "INR",
    "receipt": "PGROOM_1704067200000_a1b2c3d4",
    "payment": {
      "id": 1,
      "tenantId": 1,
      "propertyId": 1,
      "roomId": 1,
      "amount": 5000,
      "status": "Pending",
      "razorpayOrderId": "order_MNqQvzp8zp8zp8",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "razorpayKeyId": "rzp_test_xxxxxxxxxx"
  }
}
```

### 2. Verify Payment

Verifies payment signature and updates payment status.

**Endpoint:** `POST /pgrooms/v1/payment/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_MNqQvzp8zp8zp8",
  "razorpay_payment_id": "pay_MNqQvzp8zp8zp8",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "statusCode": 200,
  "data": {
    "success": true,
    "payment": {
      "id": 1,
      "tenantId": 1,
      "propertyId": 1,
      "roomId": 1,
      "amount": 5000,
      "status": "Captured",
      "razorpayOrderId": "order_MNqQvzp8zp8zp8",
      "razorpayPaymentId": "pay_MNqQvzp8zp8zp8",
      "razorpaySignature": "signature_string",
      "paymentMethod": "UPI",
      "tenant": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "property": {
        "id": 1,
        "propertyName": "Sunrise Apartments"
      },
      "room": {
        "id": 1,
        "roomNo": 101,
        "rent": "5000"
      }
    }
  }
}
```

### 3. Get Payment by ID

Retrieves payment details by payment ID.

**Endpoint:** `GET /pgrooms/v1/payment/{id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Payment details retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": 1,
    "tenantId": 1,
    "propertyId": 1,
    "roomId": 1,
    "amount": 5000,
    "currency": "INR",
    "status": "Captured",
    "razorpayOrderId": "order_MNqQvzp8zp8zp8",
    "razorpayPaymentId": "pay_MNqQvzp8zp8zp8",
    "paymentMethod": "UPI",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z",
    "tenant": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "mobileNo": "+919876543210"
    },
    "property": {
      "id": 1,
      "propertyName": "Sunrise Apartments",
      "propertyAddress": "123 Main St, City"
    },
    "room": {
      "id": 1,
      "roomNo": 101,
      "rent": "5000"
    }
  }
}
```

### 4. Get All Payments

Retrieves all payments with filtering and pagination.

**Endpoint:** `POST /pgrooms/v1/payment/list`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "status": "Captured",
  "tenantId": 1,
  "propertyId": 1,
  "roomId": 1
}
```

**Response:**
```json
{
  "message": "Payments retrieved successfully",
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": 1,
        "tenantId": 1,
        "propertyId": 1,
        "roomId": 1,
        "amount": 5000,
        "status": "Captured",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "tenant": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        },
        "property": {
          "id": 1,
          "propertyName": "Sunrise Apartments"
        },
        "room": {
          "id": 1,
          "roomNo": 101
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 5. Get Payments by Tenant

Retrieves payments for a specific tenant.

**Endpoint:** `POST /pgrooms/v1/payment/tenant`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "tenantId": 1,
  "page": 1,
  "limit": 10,
  "status": "Captured"
}
```

**Response:** Same structure as "Get All Payments"

### 6. Get Payments by Property

Retrieves payments for a specific property.

**Endpoint:** `POST /pgrooms/v1/payment/property`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "propertyId": 1,
  "page": 1,
  "limit": 10,
  "status": "Captured"
}
```

**Response:** Same structure as "Get All Payments"

### 7. Initiate Refund

Initiates a refund for a captured payment.

**Endpoint:** `POST /pgrooms/v1/payment/refund`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "paymentId": 1,
  "amount": 2500.00,
  "reason": "Partial refund for overpayment"
}
```

**Response:**
```json
{
  "message": "Refund initiated successfully",
  "statusCode": 200,
  "data": {
    "success": true,
    "refund": {
      "id": "rfnd_MNqQvzp8zp8zp8",
      "amount": 250000,
      "currency": "INR",
      "payment_id": "pay_MNqQvzp8zp8zp8",
      "status": "processed",
      "created_at": 1704067500
    },
    "payment": {
      "id": 1,
      "status": "Partially Refunded"
    }
  }
}
```

### 8. Get Payment Statistics

Retrieves payment statistics for dashboard.

**Endpoint:** `GET /pgrooms/v1/payment/stats`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Payment statistics retrieved successfully",
  "statusCode": 200,
  "data": {
    "totalPayments": 150,
    "totalAmount": 750000,
    "successfulPayments": 142,
    "pendingPayments": 3,
    "failedPayments": 5,
    "refundedPayments": 2,
    "successRate": "94.67"
  }
}
```

### 9. Get Recent Payments

Retrieves recent payments for dashboard.

**Endpoint:** `GET /pgrooms/v1/payment/recent`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Recent payments retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "amount": 5000,
      "status": "Captured",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "tenant": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "property": {
        "propertyName": "Sunrise Apartments"
      }
    }
  ]
}
```

### 10. Get Monthly Analytics

Retrieves monthly payment analytics.

**Endpoint:** `GET /pgrooms/v1/payment/analytics/monthly`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Monthly payment analytics retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "month": "January",
      "totalAmount": 50000,
      "totalPayments": 10,
      "successfulPayments": 9
    },
    {
      "month": "February",
      "totalAmount": 75000,
      "totalPayments": 15,
      "successfulPayments": 14
    }
  ]
}
```

## Webhook Integration

### Webhook Endpoint

Razorpay sends webhook events to notify about payment status changes.

**Endpoint:** `POST /pgrooms/payment/webhook`

**Headers:**
```
Content-Type: application/json
X-Razorpay-Signature: <webhook_signature>
```

**Supported Events:**
- `payment.authorized` - Payment authorized but not captured
- `payment.captured` - Payment captured successfully
- `payment.failed` - Payment failed
- `order.paid` - Order marked as paid
- `refund.created` - Refund created
- `refund.processed` - Refund processed

**Sample Webhook Payload:**
```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa30GJy",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_MNqQvzp8zp8zp8",
        "amount": 500000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_MNqQvzp8zp8zp8",
        "method": "upi",
        "created_at": 1704067200
      }
    }
  },
  "created_at": 1704067500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### Webhook Security

1. **Signature Verification**: All webhooks are verified using HMAC SHA256 signature
2. **Secret Key**: Use `RAZORPAY_WEBHOOK_SECRET` environment variable
3. **Idempotency**: Webhooks are processed idempotently to handle duplicates

## Error Handling

### Common Error Responses

**Validation Error (422):**
```json
{
  "message": "Validation failed",
  "statusCode": 422
}
```

**Authentication Error (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Payment Not Found (404):**
```json
{
  "message": "Payment not found",
  "statusCode": 404
}
```

**Razorpay API Error (500):**
```json
{
  "message": "Failed to create payment order: Bad request",
  "statusCode": 500
}
```

**Invalid Signature (400):**
```json
{
  "message": "Invalid payment signature",
  "statusCode": 400
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data or signature |
| 401 | Unauthorized - Invalid or missing JWT token |
| 404 | Not Found - Payment/Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server or Razorpay API errors |

## Testing

### Test Environment Setup

1. **Razorpay Test Credentials:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=test_secret_key
   RAZORPAY_WEBHOOK_SECRET=test_webhook_secret
   ```

2. **Test Card Details:**
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name

3. **Test UPI ID:** `success@razorpay`

### Frontend Integration Example

```javascript
// Create order
const createOrder = async (orderData) => {
  const response = await fetch('/pgrooms/v1/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

// Initialize Razorpay checkout
const initializePayment = (orderData) => {
  const options = {
    key: orderData.razorpayKeyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'PGROOM',
    description: 'Rent Payment',
    order_id: orderData.orderId,
    handler: async (response) => {
      // Verify payment
      const verifyResponse = await fetch('/pgrooms/v1/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const result = await verifyResponse.json();
      if (result.data.success) {
        alert('Payment successful!');
      }
    },
    prefill: {
      name: 'John Doe',
      email: 'john@example.com',
      contact: '+919876543210'
    },
    theme: {
      color: '#3399cc'
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
};
```

### Testing Checklist

- [ ] Create payment order with valid data
- [ ] Create payment order with invalid data (validation)
- [ ] Verify successful payment
- [ ] Verify payment with invalid signature
- [ ] Test webhook events
- [ ] Test refund functionality
- [ ] Test payment listing and filtering
- [ ] Test payment statistics
- [ ] Test error scenarios

## Security Best Practices

1. **Environment Variables**: Store all sensitive keys in environment variables
2. **Signature Verification**: Always verify payment signatures and webhook signatures
3. **HTTPS**: Use HTTPS in production for all API calls
4. **Rate Limiting**: Implement rate limiting for payment APIs
5. **Logging**: Log all payment transactions for audit trails
6. **Validation**: Validate all input data thoroughly
7. **Error Handling**: Don't expose sensitive information in error messages

## Production Deployment

### Environment Configuration

```env
# Production Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_key
RAZORPAY_WEBHOOK_SECRET=live_webhook_secret
```

### Webhook URL Configuration

Configure the following webhook URL in Razorpay Dashboard:
```
https://yourdomain.com/pgrooms/payment/webhook
```

### Monitoring and Alerts

1. Set up monitoring for payment failures
2. Configure alerts for webhook failures
3. Monitor payment success rates
4. Set up logging for all payment transactions

## Support and Troubleshooting

### Common Issues

1. **Invalid Signature Error**: Check if webhook secret is correctly configured
2. **Payment Not Found**: Ensure payment record exists before verification
3. **Webhook Not Received**: Check webhook URL configuration in Razorpay dashboard
4. **Refund Failed**: Ensure payment is in 'Captured' status before refunding

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logs for payment processing and webhook handling.