import { useFieldContext } from "@hooks/use-app-form";
import { Input } from "@ui/input";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import React from "react";

const PasswordField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & LabelContainerProps
>(
  (
    { className, labelClassName, containerClassName, label, end, ...props },
    ref,
  ) => {
    const field = useFieldContext<string>();

    return (
      <LabelContainer
        label={label}
        labelClassName={labelClassName}
        containerClassName={containerClassName}
        errors={field.state.meta.errors}
        end={end}
      >
        <Input
          type="password"
          className={className}
          ref={ref}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={() => field.handleBlur()}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
      </LabelContainer>
    );
  },
);

PasswordField.displayName = "PasswordField";

export { PasswordField };
