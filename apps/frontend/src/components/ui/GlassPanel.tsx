import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("glass-panel", className)} {...props} />;
}
