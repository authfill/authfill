import { Loader } from "./Loader";
import { cn } from "../utils/cn";
import React from "react";

type ButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  valid?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "white" | "ghost" | "blue";
  size?: "sm" | "same-as-input" | "md";
} & Omit<React.HTMLProps<HTMLButtonElement>, "size">;

export const Button = ({
  children,
  onClick,
  type = "button",
  disabled,
  loading = false,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400",
        variant === "primary" &&
          "bg-primary border border-transparent text-white",
        variant == "primary" && (disabled || loading) && "!bg-primary/90",
        variant === "secondary" &&
          "border border-gray-300 bg-white text-gray-900",
        variant === "white" && "bg-white hover:bg-gray-100",
        variant === "ghost" && "text-gray-900 hover:text-gray-700",
        variant === "blue" &&
          "text-primary-700 bg-primary border-primary-300 flex flex-row items-center border",
        variant === "white" && "bg-white hover:bg-gray-100",
        (disabled || loading) && "cursor-not-allowed",
        className,
        size === "sm" && "px-3 py-0.5 h-[34px] md:text-sm",
        size === "same-as-input" && "px-4 py-0.5 h-10 md:text-base",
        size === "md" && "px-4 py-2 h-11 md:text-base"
      )}
      type={type}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center",
          size === "sm" && "space-x-1",
          size === "md" && "space-x-2",
          loading && "opacity-0"
        )}
      >
        {children && children != "" && (
          <span
            className={cn(
              "inline-flex items-center [&>svg]:size-4 [&>svg]:stroke-2.5 [&>svg]:mr-2",
              size === "sm" && "space-x-1",
              size === "md" && "space-x-2"
            )}
          >
            {children}
          </span>
        )}
      </span>
      {loading && <Loader className="absolute text-text" />}
    </button>
  );
};

Button.displayName = "Button";
