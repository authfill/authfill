import { useAppForm } from "@hooks/use-app-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/setup/custom")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      host: "",
      port: 993,
      user: "",
      password: "",
      secure: true,
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email(),
        host: z.string().min(1),
        port: z.number().min(1).max(65535),
        user: z.string().min(1),
        password: z.string().min(1),
        secure: z.boolean(),
      }),
    },
  });

  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          Custom Server
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Please enter the details of your IMAP server. We will only store this
          data on your machine.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-12 flex w-[18rem] flex-col gap-6"
        >
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                placeholder="john.pork@example.com"
                onChange={(e) => {
                  form.setFieldValue("user", e.target.value);
                }}
              />
            )}
          </form.AppField>
          <form.AppField name="host">
            {(field) => (
              <field.TextField
                label="IMAP Server Host"
                placeholder="imap.example.com"
              />
            )}
          </form.AppField>
          <form.AppField name="port">
            {(field) => (
              <field.TextField
                label="IMAP Server Port"
                placeholder="993"
                type="number"
              />
            )}
          </form.AppField>
          <form.AppField name="user">
            {(field) => (
              <field.TextField
                label="User"
                placeholder="john.pork@example.com"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField label="Password" placeholder="*******" />
            )}
          </form.AppField>
          <form.AppField name="secure">
            {(field) => <field.SwitchField label="Secure (TLS)" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton className="mt-4">Submit</form.SubmitButton>
          </form.AppForm>
        </form>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
