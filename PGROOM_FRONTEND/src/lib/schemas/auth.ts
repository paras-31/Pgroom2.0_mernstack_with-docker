import * as z from "zod";
import { USER_TYPES, MIN_PASSWORD_LENGTH, MIN_NAME_LENGTH, MIN_ADDRESS_LENGTH, MIN_MOBILE_LENGTH } from "../constants";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(MIN_NAME_LENGTH, `First name must be at least ${MIN_NAME_LENGTH} characters`),
  lastName: z.string().min(MIN_NAME_LENGTH, `Last name must be at least ${MIN_NAME_LENGTH} characters`),
  mobileNo: z.string().min(MIN_MOBILE_LENGTH, "Invalid mobile number"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(MIN_ADDRESS_LENGTH, "Address is required"),
  userType: z.enum([USER_TYPES.TENANT, USER_TYPES.OWNER]),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Create a discriminated union type for form data
export type FormData = LoginFormData | RegisterFormData;

// Create a discriminated union type for form errors
export type FormErrors = Partial<{
  email: { message: string };
  password: { message: string };
  rememberMe: { message: string };
  firstName: { message: string };
  lastName: { message: string };
  mobileNo: { message: string };
  state: { message: string };
  city: { message: string };
  address: { message: string };
  userType: { message: string };
  confirmPassword: { message: string };
  form: { message: string };
}>;