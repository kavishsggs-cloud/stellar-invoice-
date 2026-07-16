import React from "react";
import { cn } from "./button";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border bg-surface/50 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          error
            ? "border-danger focus:ring-danger/30"
            : "border-white/10 focus:ring-stellar-blue/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
