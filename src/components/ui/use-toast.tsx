import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toastFn = ({ title, description, variant = "default" }: ToastProps) => {
};

export function useToast() {
  return { toast: toastFn };
}

export { toastFn as toast };