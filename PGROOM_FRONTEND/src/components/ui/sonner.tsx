import { useTheme as useNextTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast, ToastT } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useNextTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
          success: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
        },
      }}
      {...props}
    />
  )
}

// Custom toast with enhanced error styling
const toast = {
  ...sonnerToast,
  error: (message: string, data?: Omit<ToastT, "message">) => {
    return sonnerToast.error(message, {
      ...data,
      className: "error",
    })
  },
  success: (message: string, data?: Omit<ToastT, "message">) => {
    return sonnerToast.success(message, {
      ...data,
      className: "success",
    })
  }
}

export { Toaster, toast }
