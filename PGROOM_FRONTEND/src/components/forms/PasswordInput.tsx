import { UseFormRegister, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordInputProps<T extends Record<string, string | boolean | undefined>> {
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const PasswordInput = <T extends Record<string, string | boolean | undefined>>({
  register,
  name,
  error,
  showPassword,
  setShowPassword,
  className,
  disabled = false,
  placeholder = "Password",
}: PasswordInputProps<T>) => (
  <div className="relative">
    <Lock
      className={cn(
        "absolute left-3 top-2.5 h-5 w-5",
        error ? "text-destructive" : "text-muted-foreground",
        disabled && "opacity-50"
      )}
      aria-hidden="true"
    />
    <Input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      className={cn(
        "pl-10 pr-10 bg-background",
        error && "border-destructive focus-visible:ring-destructive",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${String(name)}-error` : undefined}
      {...register(name)}
    />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-3 top-2.5 h-5 w-5 p-0 hover:bg-transparent"
      onClick={() => setShowPassword(!showPassword)}
      disabled={disabled}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
    {error && (
      <p
        id={`${String(name)}-error`}
        className="text-sm font-medium text-destructive mt-1"
        role="alert"
      >
        {error}
      </p>
    )}
  </div>
);