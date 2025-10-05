# API Service with Axios

This directory contains the API service implementation using Axios for making HTTP requests.

## Structure

- `axios.ts` - Base Axios instance configuration with interceptors
- `apiService.ts` - Generic API service with methods for common HTTP operations
- `endpoints.ts` - Centralized API endpoint definitions
- `services/` - Specific API services for different domains (auth, user, etc.)

## Usage

### Basic Usage

```typescript
import { apiService } from '@/lib/api';

// GET request
const getData = async () => {
  try {
    const response = await apiService.get('/some-endpoint');
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const createData = async () => {
  try {
    const data = { name: 'John', email: 'john@example.com' };
    const response = await apiService.post('/some-endpoint', data);
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Using Endpoints

```typescript
import { apiService, endpoints } from '@/lib/api';

// GET request with predefined endpoint
const getProperties = async () => {
  try {
    const response = await apiService.get(endpoints.PROPERTY.LIST);
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// GET request with dynamic endpoint
const getPropertyDetails = async (id: string) => {
  try {
    const response = await apiService.get(endpoints.PROPERTY.DETAILS(id));
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Using Domain-Specific Services

```typescript
import { authService } from '@/lib/api/services';

// Login
const login = async () => {
  try {
    const loginData = {
      email: 'user@example.com',
      password: 'password123'
    };
    const response = await authService.login(loginData);
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Register
const register = async () => {
  try {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      // ... other required fields
    };
    const response = await authService.register(registerData);
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Error Handling

Error handling is implemented in the Axios interceptors. When an error occurs:

1. The interceptor will automatically show a toast notification with an appropriate error message
2. The error will be logged to the console
3. For 401 errors, the user will be automatically logged out

You can still catch errors in your components for additional handling if needed.

## Authentication

The API service automatically handles authentication by:

1. Adding the auth token to requests if it exists in localStorage
2. Handling 401 errors by clearing the auth token and redirecting to login

## Adding New Endpoints

To add new endpoints, update the `endpoints.ts` file:

```typescript
// Add new endpoint category
export const NEW_CATEGORY = {
  LIST: '/new-category',
  DETAILS: (id: string | number) => `/new-category/${id}`,
  // ... other endpoints
};

// Or add to existing category
export const USER = {
  // ... existing endpoints
  NEW_ENDPOINT: '/user/new-endpoint',
};
```

## Adding New Services

To add a new domain-specific service:

1. Create a new file in the `services/` directory (e.g., `userService.ts`)
2. Implement the service using the `apiService`
3. Export the service from `services/index.ts`

Example:

```typescript
// userService.ts
import { apiService } from '../apiService';
import { endpoints } from '../index';

export const userService = {
  getProfile: async () => {
    return apiService.get(endpoints.USER.PROFILE);
  },
  
  updateProfile: async (data: any) => {
    return apiService.put(endpoints.USER.UPDATE_PROFILE, data);
  },
};

// services/index.ts
import { authService } from './authService';
import { userService } from './userService';

export {
  authService,
  userService
};
```
