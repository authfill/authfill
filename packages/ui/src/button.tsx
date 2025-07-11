import { Slot } from "@radix-ui/react-slot";
import { Link, LinkComponentProps } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Loader } from "@ui/loader";
import { cn } from "@ui/utils/class";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-70 dark:disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer relative",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    as?: undefined;
    onClick: () => void;
    children: React.ReactNode;
    asChild?: boolean;
    loading?: boolean;
  };

type LinkProps = LinkComponentProps &
  VariantProps<typeof buttonVariants> & {
    as?: "link";
    asChild?: boolean;
    loading?: boolean;
    children: React.ReactNode;
  };

export type ButtonProps = HTMLButtonProps | LinkProps;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      as,
      className,
      variant,
      size,
      asChild = false,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = (
      as === "link" ? Link : asChild ? Slot : "button"
    ) as React.ElementType;
    const isAnchor = as === "link" || asChild;
    const elementRef = isAnchor
      ? (ref as React.Ref<HTMLAnchorElement>)
      : (ref as React.Ref<HTMLButtonElement>);

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          loading && "disabled:opacity-100",
          className,
        )}
        ref={elementRef}
        disabled={disabled || loading}
        {...(props as ButtonProps)}
      >
        {loading && (
          <Loader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <span
          className={cn(
            "inline-flex items-center gap-2",
            loading && "invisible",
          )}
        >
          {children}
        </span>
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
