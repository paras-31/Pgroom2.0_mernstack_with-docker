import { RegisterFormData } from '@/lib/schemas/auth';

/**
 * Extended registration form data with optional status field
 * Used for tenant invitation
 */
export interface ExtendedRegisterFormData extends RegisterFormData {
  status?: string;
}
