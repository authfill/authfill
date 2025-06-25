import { useBackground } from "@extension/hooks/use-background";
import { useBackgroundListener } from "@extension/hooks/use-background-listener";
import { useAppForm } from "@hooks/use-app-form";
import { useNavigate } from "@tanstack/react-router";
import { InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@ui/input-otp";
import { useState } from "react";
import { toast } from "sonner";

const slotClassName =
  "bg-white dark:!bg-foreground/10 border-foreground/20 px-5 py-6 text-xl font-mono";

export function DemoForm() {
  const navigate = useNavigate();

  const { sendToBackground } = useBackground();

  const [code, setCode] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      if (!code || value.code !== code)
        return toast.error("The code you entered is incorrect.", {
          description: "Make sure to use the code shown in AuthFill.",
        });

      return navigate({ to: "/tutorial/complete" });
    },
  });

  useBackgroundListener("popup.opened", async () => {
    const res = await sendToBackground("demo.start");
    setCode(res.code);
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="code">
          {(field) => (
            <field.OTPInput
              maxLength={6}
              placeholder="123456"
              type="number"
              className="w-full"
            >
              <InputOTPGroup>
                {new Array(3).fill(null).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className={slotClassName}
                  />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {new Array(3).fill(null).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx + 3}
                    className={slotClassName}
                  />
                ))}
              </InputOTPGroup>
            </field.OTPInput>
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton size="xl" className="mt-2" disabled={false}>
            Submit
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
