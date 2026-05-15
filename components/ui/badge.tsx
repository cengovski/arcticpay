// components/ui/badge.tsx
// Status badge component — subtle Arctic theme

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant === "default" &&
          "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
        variant === "success" &&
          "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
        variant === "warning" &&
          "bg-amber-500/10 text-amber-300 border border-amber-500/20",
        variant === "error" &&
          "bg-red-500/10 text-red-300 border border-red-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
