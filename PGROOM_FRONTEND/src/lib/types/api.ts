/**
 * API response types
 */

/**
 * Base API success response interface
 * Used for responses with statusCode 200
 */
export interface ApiSuccessResponse<T = any> {
  message: string;
  statusCode: 200;
  data: T;
}

/**
 * API validation error response interface
 * Used for responses with statusCode 422
 */
export interface ApiValidationErrorResponse {
  message: string;
  statusCode: 422;
  data?: never;
}

/**
 * API server error response interface
 * Used for responses with statusCode 500
 */
export interface ApiServerErrorResponse {
  message: string;
  statusCode: 500;
  data?: never;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T = any> =
  | ApiSuccessResponse<T>
  | ApiValidationErrorResponse
  | ApiServerErrorResponse;

/**
 * Type guard to check if response is a success response
 */
export function isApiSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.statusCode === 200;
}

/**
 * Type guard to check if response is a validation error
 */
export function isApiValidationErrorResponse(response: ApiResponse): response is ApiValidationErrorResponse {
  return response.statusCode === 422;
}

/**
 * Type guard to check if response is a server error
 */
export function isApiServerErrorResponse(response: ApiResponse): response is ApiServerErrorResponse {
  return response.statusCode === 500;
}

// User data interface
export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  state: number;
  city: number;
  address: string;
  token: string;
  roleId: number;
}

// Login response interface
export interface LoginResponse extends ApiSuccessResponse<UserData> {}
