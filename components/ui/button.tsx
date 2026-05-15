// components/ui/button.tsx
// Arctic-themed button component — clean design

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--arctic-cyan)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arctic-dark)]",
          "disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
          variant === "default" &&
            "bg-gradient-to-r from-[var(--arctic-cyan)] to-[var(--arctic-blue)] text-white hover:brightness-110 shadow-lg shadow-cyan-500/20",
          variant === "outline" &&
            "border border-[var(--arctic-border)] bg-transparent text-[var(--arctic-text)] hover:bg-white/[0.04]",
          variant === "ghost" &&
            "bg-transparent text-[var(--arctic-muted)] hover:text-white hover:bg-white/[0.04]",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-500",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "lg" && "px-6 py-3 text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
