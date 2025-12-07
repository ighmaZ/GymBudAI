"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-black text-white hover:bg-gray-800",
  outline:
    "border border-black bg-transparent hover:bg-black hover:text-white",
  ghost: "bg-transparent hover:bg-gray-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      rounded = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "font-bold uppercase tracking-wide transition-all",
          variantStyles[variant],
          sizeStyles[size],
          rounded ? "rounded-full" : "rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

