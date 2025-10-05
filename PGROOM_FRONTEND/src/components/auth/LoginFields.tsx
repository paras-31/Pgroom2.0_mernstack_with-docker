import { UseFormRegister } from "react-hook-form";
import { Mail } from "lucide-react";
import { FormInput } from "@/components/forms/FormInput";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { FormData } from "@/lib/schemas/auth";

interface LoginFieldsProps {
  register: UseFormRegister<FormData>;
  getErrorMessage: (field: string) => string | undefined;
  isFormDisabled: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

/**
 * Login form fields component
 * Displays email and password fields for login
 */
const LoginFields = ({
  register,
  getErrorMessage,
  isFormDisabled,
  showPassword,
  setShowPassword
}: LoginFieldsProps) => (
  <div className="space-y-4 w-full">
    <FormInput
      icon={Mail}
      type="email"
      placeholder="Email address"
      register={register}
      name="email"
      error={getErrorMessage('email')}
      disabled={isFormDisabled}
    />

    <PasswordInput
      register={register}
      name="password"
      error={getErrorMessage('password')}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      disabled={isFormDisabled}
    />
  </div>
);

export default LoginFields;
