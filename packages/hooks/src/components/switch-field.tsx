import { useFieldContext } from "@hooks/use-app-form";
import { Link } from "@tanstack/react-router";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { Switch } from "@ui/switch";
import { cn } from "@ui/utils/class";
import React from "react";

const SwitchField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"button"> &
    LabelContainerProps & {
      forgot?: string;
    }
>(
  (
    { forgot, className, labelClassName, containerClassName, label, ...props },
    ref,
  ) => {
    const field = useFieldContext<boolean>();

    return (
      <LabelContainer
        label={label}
        labelClassName={labelClassName}
        innerClassName={cn("flex-row justify-between", containerClassName)}
        errors={field.state.meta.errors}
        end={
          <Link
            className="link-secondary-foreground text-sm"
            to="/auth/forgot"
            tabIndex={-1}
          >
            {forgot}
          </Link>
        }
      >
        <Switch
          className={className}
          id={field.name}
          name={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
          {...props}
        />
      </LabelContainer>
    );
  },
);

SwitchField.displayName = "SwitchField";

export { SwitchField };
