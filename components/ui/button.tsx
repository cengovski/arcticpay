// components/ui/button.tsx
// Arctic-themed button component (shadcn/ui pattern)
// Supports variants: default, outline, ghost, destructive

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
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900",
          "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          // Variants
          variant === "default" &&
            "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25",
          variant === "outline" &&
            "border border-cyan-500/30 bg-transparent text-cyan-300 hover:bg-cyan-500/10",
          variant === "ghost" &&
            "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-500",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
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
