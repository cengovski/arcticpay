// components/ui/badge.tsx
// Status badge component

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
        variant === "success" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        variant === "warning" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        variant === "error" && "bg-red-500/20 text-red-300 border border-red-500/30",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
