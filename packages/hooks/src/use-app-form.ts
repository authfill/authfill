import { OTPInput } from "@hooks/components/otp-input";
import { PasswordField } from "@hooks/components/password-field";
import { SubmitButton } from "@hooks/components/submit-button";
import { SwitchField } from "@hooks/components/switch-field";
import { TextField } from "@hooks/components/text-field";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";

const { fieldContext, formContext, useFormContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    PasswordField,
    SwitchField,
    OTPInput,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext, useStore };
