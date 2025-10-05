# PGROOM Razorpay Payment Integration

## Quick Start Guide

This guide will help you quickly set up and test the Razorpay payment integration in the PGROOM backend.

## Prerequisites

1. Node.js (v14 or higher)
2. PostgreSQL database
3. Razorpay account (test/live)
4. Environment variables configured

## Installation

The Razorpay package is already installed. If you need to reinstall:

```bash
npm install razorpay
```

## Configuration

1. **Environment Variables**: Copy `.env.example` to `.env` and update the Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

2. **Database**: The Payment model is already configured in Prisma schema. Run migrations if needed:

```bash
npx prisma migrate dev
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pgrooms/v1/payment/create-order` | Create payment order |
| POST | `/pgrooms/v1/payment/verify` | Verify payment |
| GET | `/pgrooms/v1/payment/:id` | Get payment by ID |
| POST | `/pgrooms/v1/payment/list` | Get all payments |
| POST | `/pgrooms/v1/payment/tenant` | Get tenant payments |
| POST | `/pgrooms/v1/payment/property` | Get property payments |
| POST | `/pgrooms/v1/payment/refund` | Initiate refund |
| GET | `/pgrooms/v1/payment/stats` | Payment statistics |
| GET | `/pgrooms/v1/payment/recent` | Recent payments |
| GET | `/pgrooms/v1/payment/analytics/monthly` | Monthly analytics |
| POST | `/pgrooms/payment/webhook` | Webhook handler |

## Quick Test

### 1. Create a Payment Order

```bash
curl -X POST http://localhost:3000/pgrooms/v1/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tenantId": 1,
    "propertyId": 1,
    "roomId": 1,
    "amount": 5000.00,
    "description": "Test rent payment"
  }'
```

### 2. Verify Payment (after successful payment)

```bash
curl -X POST http://localhost:3000/pgrooms/v1/payment/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "razorpay_order_id": "order_xxxxxxxxxx",
    "razorpay_payment_id": "pay_xxxxxxxxxx",
    "razorpay_signature": "signature_string"
  }'
```

### 3. Get Payment Statistics

```bash
curl -X GET http://localhost:3000/pgrooms/v1/payment/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### HTML Setup

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### JavaScript Integration

```javascript
// Step 1: Create order
const createPaymentOrder = async () => {
  const response = await fetch('/pgrooms/v1/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      tenantId: 1,
      propertyId: 1,
      roomId: 1,
      amount: 5000.00,
      description: 'Monthly rent payment'
    })
  });
  
  const data = await response.json();
  return data.data;
};

// Step 2: Initialize Razorpay
const initiatePayment = async () => {
  try {
    const orderData = await createPaymentOrder();
    
    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'PGROOM',
      description: 'Rent Payment',
      order_id: orderData.orderId,
      handler: async function(response) {
        // Step 3: Verify payment
        await verifyPayment(response);
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
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};

// Step 3: Verify payment
const verifyPayment = async (response) => {
  try {
    const verifyResponse = await fetch('/pgrooms/v1/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      // Redirect to success page or update UI
    } else {
      alert('Payment verification failed!');
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    alert('Payment verification failed!');
  }
};
```

## Testing

### Test Credentials

Use these test credentials in Razorpay test mode:

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Test UPI:**
- UPI ID: `success@razorpay`

**Test Netbanking:**
- Select any bank and use `success` as password

### Test Scenarios

1. **Successful Payment**: Use test card details above
2. **Failed Payment**: Use card number `4000 0000 0000 0002`
3. **Webhook Testing**: Use ngrok to expose local server for webhook testing

## Webhook Setup

### 1. Configure Webhook URL in Razorpay Dashboard

```
https://yourdomain.com/pgrooms/payment/webhook
```

### 2. Select Events

Enable these webhook events:
- payment.authorized
- payment.captured
- payment.failed
- order.paid
- refund.created
- refund.processed

### 3. Test Webhook Locally

Use ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in Razorpay webhook configuration
# Example: https://abc123.ngrok.io/pgrooms/payment/webhook
```

## Error Handling

### Common Errors and Solutions

1. **"Invalid signature"**
   - Check if `RAZORPAY_KEY_SECRET` is correct
   - Ensure signature verification logic is correct

2. **"Payment not found"**
   - Verify the payment record exists in database
   - Check if `razorpay_order_id` is correct

3. **"Webhook signature verification failed"**
   - Check if `RAZORPAY_WEBHOOK_SECRET` is correct
   - Ensure webhook URL is accessible

4. **"Order creation failed"**
   - Check Razorpay API credentials
   - Verify amount is in correct format (positive number)

## Production Deployment

### 1. Update Environment Variables

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

### 2. Configure Webhook URL

Update webhook URL in Razorpay Dashboard to production URL:
```
https://yourproductiondomain.com/pgrooms/payment/webhook
```

### 3. Enable HTTPS

Ensure your production server uses HTTPS for all payment-related endpoints.

### 4. Monitor Payments

Set up monitoring for:
- Payment success/failure rates
- Webhook delivery status
- API response times
- Error logs

## Security Checklist

- [ ] All sensitive keys stored in environment variables
- [ ] Payment signatures verified on server-side
- [ ] Webhook signatures verified
- [ ] HTTPS enabled in production
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] Payment logs are secure and compliant

## Support

For issues related to:
- **Razorpay Integration**: Check Razorpay documentation or contact Razorpay support
- **Backend Implementation**: Review the code in `/app/services/PaymentService.js`
- **Database Issues**: Check Prisma schema and migrations
- **API Issues**: Review `/app/controllers/PaymentController.js`

## Additional Resources

- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Razorpay Checkout Documentation](https://razorpay.com/docs/checkout/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Test Cards and Credentials](https://razorpay.com/docs/payments/test-card-details/)
