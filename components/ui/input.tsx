// components/ui/input.tsx
// Styled input component — clean Arctic theme

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[var(--arctic-border)] bg-white/[0.03] px-3.5 py-2.5",
          "text-sm text-white placeholder:text-[var(--arctic-muted)]/60",
          "focus:outline-none focus-visible:border-[var(--arctic-cyan)]/40 focus-visible:ring-1 focus-visible:ring-[var(--arctic-cyan)]/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
