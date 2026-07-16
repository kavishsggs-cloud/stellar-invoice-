"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "./button";

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "solid" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass", padding = "lg", children, ...props }, ref) => {
    const baseStyles = "relative overflow-hidden rounded-[24px] shadow-[var(--shadow-premium-card)]";
    
    const variants = {
      glass: "glass-panel",
      solid: "bg-surface border border-white/5",
      highlight: "bg-card-highlight border border-stellar-blue/20",
    };

    const paddings = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
