import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
        variant === "primary" && "bg-accent text-white shadow-glass hover:brightness-110",
        variant === "ghost" && "glass-panel hover:bg-accent/10",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "glass-panel flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-accent/10 active:scale-90",
        className,
      )}
      {...props}
    />
  );
}
