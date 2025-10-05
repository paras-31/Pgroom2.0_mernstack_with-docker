import { useState, useCallback, useMemo, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { tenantService } from "@/lib/api/services";

// Import custom hooks
import { useAuthForm } from "@/hooks/useAuthForm";

// Import reusable components
import RegistrationFields from "@/components/auth/RegistrationFields";
import LoginFields from "@/components/auth/LoginFields";
import ConfirmPasswordField from "@/components/auth/ConfirmPasswordField";
import AuthToggle from "@/components/auth/AuthToggle";
import SubmitButton from "@/components/auth/SubmitButton";

/**
 * Login and Registration Page
 *
 * This component handles both login and registration functionality
 * with a flip animation between the two forms.
 *
 * @remarks
 * The component uses a single form that switches between login and registration modes
 * based on the route or user interaction. It maintains form state and validation
 * through the useAuthForm custom hook.
 */

interface LoginProps {
  isRegisterRoute?: boolean;
}

const Login = ({ isRegisterRoute = false }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  // Form mode state
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);
  const [isFlipping, setIsFlipping] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset password visibility when toggling between login and registration
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isLogin]);

  // Sync component state with URL when route changes
  useEffect(() => {
    setIsLogin(!isRegisterRoute);
  }, [isRegisterRoute, location.pathname]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const handleRedirect = async () => {
      if (isAuthenticated && userRole) {
        const dashboardRoutes = {
          1: '/admin/dashboard',
          2: '/owner/dashboard',
          3: '/tenant/properties' // Default for tenants
        };

        // For tenants, check if they have a room assigned
        if (userRole === 3) {
          try {
            const roomResponse = await tenantService.getTenantRoomDetails();
            // If tenant has a room, redirect to dashboard
            if (roomResponse.statusCode === 200 && roomResponse.data) {
              navigate('/tenant/dashboard');
              return;
            }
          } catch (error) {
            // If error checking room status, still redirect to properties
            console.warn('Error checking tenant room status:', error);
          }
          // If no room or error, redirect to properties
          navigate('/tenant/properties');
          return;
        }

        // For other roles, use default redirection
        navigate(dashboardRoutes[userRole] || '/');
      }
    };

    handleRedirect();
  }, [isAuthenticated, userRole, navigate]);

  // Use the custom auth form hook
  const {
    register,
    handleSubmit,
    control,
    setValue,
    isSubmitting,
    reset,
    getErrorMessage,
    isRegistrationPending,
    onSubmit,
    isProcessing
  } = useAuthForm(isLogin);

  // Handle toggling between login and registration forms with debounce
  const handleToggleForm = useCallback(() => {
    // Prevent multiple clicks during animation
    if (isFlipping) return;

    // Start flip animation
    setIsFlipping(true);

    // Reset form state to clear any entered data and errors
    reset();

    // Navigate to the appropriate route
    const targetRoute = isLogin ? '/register' : '/login';

    // Wait for animation to complete before changing route
    setTimeout(() => {
      navigate(targetRoute);
      setIsFlipping(false);
    }, 300); // Match the CSS transition duration
  }, [isLogin, reset, isFlipping, navigate]);

  // Memoize derived values
  const buttonText = useMemo(() => isLogin ? "Login" : "Create Account", [isLogin]);
  const isFormDisabled = isFlipping || isSubmitting || isRegistrationPending || isProcessing;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center perspective px-4 py-8 bg-gray-50 dark:bg-[hsl(var(--background))]">
      {/* Theme toggle in the top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Card container with 3D perspective effect */}
      <div className="flip-card w-full max-w-md mx-auto">
        <div
          className={cn(
            "flip-card-inner w-full space-y-8",
            "bg-white dark:bg-[hsl(var(--background-light-dark))]",
            "rounded-xl shadow-xl p-6 sm:p-8",
            "border border-gray-200 dark:border-gray-700",
            "preserve-3d backface-hidden",
            isFlipping && "rotate-y-180"
          )}
          style={{
            transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-live="polite"
        >
          {/* Header section with title and description */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {isLogin ? "PropertyHub" : "Join PropertyHub"}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {isLogin
                ? "Sign in to access your account and manage your properties."
                : "Register to find your perfect living space or list your property."}
            </p>
          </div>

          {/* Form with conditional fields based on login/register mode */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-5 w-full mx-auto"
            noValidate
            aria-label={isLogin ? "Login Form" : "Registration Form"}
          >
            {/* Registration fields shown only when not in login mode */}
            {!isLogin && (
              <RegistrationFields
                register={register}
                control={control}
                setValue={setValue}
                getErrorMessage={getErrorMessage}
                isFormDisabled={isFormDisabled}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            )}

            {/* Login fields always shown */}
            {/* For registration, these fields are already included in RegistrationFields */}
            {isLogin && (
              <LoginFields
                register={register}
                getErrorMessage={getErrorMessage}
                isFormDisabled={isFormDisabled}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}

            {/* Confirm password field is now included in the RegistrationFields component */}

            {/* Submit button */}
            <SubmitButton
              isDisabled={isFormDisabled}
              buttonText={buttonText}
            />

            {/* Toggle between login and registration */}
            <AuthToggle
              isLogin={isLogin}
              isDisabled={isFormDisabled}
              onToggle={handleToggleForm}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Login);
