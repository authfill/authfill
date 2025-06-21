import { useFieldContext } from "@hooks/use-app-form";
import { InputOTP, InputOTPProps } from "@ui/input-otp";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import React from "react";

const OTPInput = React.forwardRef<
  HTMLInputElement,
  LabelContainerProps & InputOTPProps
>(
  (
    {
      className,
      labelClassName,
      containerClassName,
      label,
      maxLength,
      children,
    },
    ref,
  ) => {
    const field = useFieldContext<string>();

    return (
      <LabelContainer
        label={label}
        labelClassName={labelClassName}
        containerClassName={containerClassName}
        errors={field.state.meta.errors}
      >
        <InputOTP
          className={className}
          ref={ref}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={() => field.handleBlur()}
          onChange={(value: string) => field.handleChange(value)}
          containerClassName="group flex items-center has-[:disabled]:opacity-30"
          maxLength={maxLength}
          pasteTransformer={(t) => t.replace(/\s|-/g, "")}
        >
          {children}
        </InputOTP>
      </LabelContainer>
    );
  },
);

OTPInput.displayName = "CodeInput";

export { OTPInput };
