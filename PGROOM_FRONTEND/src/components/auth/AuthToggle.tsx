import { Button } from "@/components/ui/button";

interface AuthToggleProps {
  isLogin: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

/**
 * Authentication toggle component
 * Allows switching between login and registration forms
 */
const AuthToggle = ({ isLogin, isDisabled, onToggle }: AuthToggleProps) => (
  <div className="text-center w-full">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {isLogin ? "New to PropertyHub?" : "Already have an account?"}{" "}
      <Button
        variant="link"
        className="text-green-600 dark:text-green-400 p-0"
        onClick={onToggle}
        disabled={isDisabled}
        type="button"
      >
        {isLogin ? "Create an account" : "Login"}
      </Button>
    </p>
  </div>
);

export default AuthToggle;
