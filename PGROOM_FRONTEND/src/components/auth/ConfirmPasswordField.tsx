import { UseFormRegister } from "react-hook-form";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { FormData } from "@/lib/schemas/auth";

interface ConfirmPasswordFieldProps {
  register: UseFormRegister<FormData>;
  getErrorMessage: (field: string) => string | undefined;
  isFormDisabled: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

/**
 * Confirm password field component
 * Used in registration form for password confirmation
 */
const ConfirmPasswordField = ({
  register,
  getErrorMessage,
  isFormDisabled,
  showPassword,
  setShowPassword
}: ConfirmPasswordFieldProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div></div> {/* Empty div for alignment with password field */}
    <PasswordInput
      register={register}
      name="confirmPassword"
      error={getErrorMessage('confirmPassword')}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      disabled={isFormDisabled}
      placeholder="Confirm Password"
    />
  </div>
);

export default ConfirmPasswordField;
