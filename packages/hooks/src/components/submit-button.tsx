import { useFormContext } from "@hooks/use-app-form";
import { Button } from "@ui/button";
import React from "react";

const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.isSubmitting, state.isValid, state.isDirty]}
    >
      {([isSubmitting, isValid, isDirty]) => (
        <Button
          type="submit"
          className="w-full"
          disabled={!isValid || !isDirty}
          loading={isSubmitting}
          {...props}
          ref={ref}
        />
      )}
    </form.Subscribe>
  );
});

SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
