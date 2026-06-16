"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  // Base premium styles in Tailwind CSS v4
  const baseStyle =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] select-none disabled:opacity-50 disabled:pointer-events-none";

  // Variant styles
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all duration-200 border border-transparent",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-950 shadow-sm transition-all duration-200",
    ghost:
      "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 transition-all duration-200",
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
