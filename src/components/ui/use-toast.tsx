import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toastFn = ({ title, description, variant = "default" }: ToastProps) => {
  console.log(`Toast [${variant}]: ${title}`, description);
};

export function useToast() {
  return { toast: toastFn };
}

export { toastFn as toast };