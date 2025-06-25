import { useFieldContext } from "@hooks/use-app-form";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { Switch } from "@ui/switch";
import { cn } from "@ui/utils/class";
import React from "react";

const SwitchField = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    LabelContainerProps & {
      forgot?: string;
    }
>(({ className, labelClassName, containerClassName, label, ...props }, ref) => {
  const field = useFieldContext<boolean>();

  return (
    <LabelContainer
      label={label}
      labelClassName={labelClassName}
      innerClassName={cn("flex-row justify-between", containerClassName)}
      errors={field.state.meta.errors}
    >
      <Switch
        className={className}
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        ref={ref}
        {...props}
      />
    </LabelContainer>
  );
});

SwitchField.displayName = "SwitchField";

export { SwitchField };
