
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = ({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        {
          "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700": variant === "primary",
          "bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800": variant === "secondary",
          "border-2 border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/50": variant === "outline",
        },
        {
          "text-sm px-3 py-1.5": size === "sm",
          "text-base px-4 py-2": size === "md",
          "text-lg px-6 py-3": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
