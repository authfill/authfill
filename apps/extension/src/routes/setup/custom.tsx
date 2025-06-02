import { useAppForm } from "@hooks/use-app-form";
import { createFileRoute } from "@tanstack/react-router";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import browser from "webextension-polyfill";
import { z } from "zod";

export const Route = createFileRoute("/setup/custom")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    if (!search) return {};
    return {
      email: search.email,
      host: search.host ? String(search.host) : undefined,
      port: search.host ? String(search.port) : undefined,
      user: search.user ? String(search.user) : undefined,
      secure: search.secure ? String(search.secure) : undefined,
    };
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const form = useAppForm({
    defaultValues: {
      email: search.email ?? "",
      host: search.host ?? "",
      port: search.port ? Number(search.port) : 993,
      user: search.user ?? "",
      password: "",
      secure: search.secure ? search.secure === "true" : true,
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
    onSubmitInvalid: async () => {
      const errors = form.getAllErrors().fields;
      if (errors.host.errors.length || errors.port.errors.length)
        setAdvanced(true);
    },
    onSubmit: async ({ value }) => {
      // TODO: Make this compatbile with Firefox
      // Doesnt work with browser.runtime.sendMessage,
      // but works with chrome.runtime.sendMessage
      const promise = browser.runtime.sendMessage({
        event: "auth.custom",
        data: value,
      }) as Promise<{ success: boolean }>;

      toast.promise(promise, {
        loading: "Testing email connection...",
        success: (res) => {
          if (!res.success)
            return "Connection failed! Please check your credentials.";
          navigate({ to: "/setup/complete" });
          return "Successfully authenticated!";
        },
        error: "Something went wrong! Please try again.",
      });
    },
  });

  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [advanced, setAdvanced] = useState(
    search.host && search.port ? false : true,
  );

  useEffect(() => {
    if (!passwordRef.current || !userRef.current) return;

    if (!search.user) userRef.current?.focus();
    else passwordRef.current?.focus();
  }, [passwordRef, userRef, search]);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center py-12">
      <div className="mt-auto"></div>
      <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          Email Settings
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Please enter your email credentials and settings. We will only store
          this data on your machine.
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
                label="Email Address"
                placeholder="john.pork@example.com"
                type="email"
                autoComplete="email"
              />
            )}
          </form.AppField>
          <form.AppField name="user">
            {(field) => (
              <field.TextField
                ref={userRef}
                label="Email Username"
                placeholder="john.pork@example.com"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                ref={passwordRef}
                label="Email Password"
                placeholder="*******"
              />
            )}
          </form.AppField>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between"
            onClick={() => setAdvanced((prev) => !prev)}
          >
            <span className="text-muted-foreground">
              Show advanced settings
            </span>
            {advanced ? (
              <MinusIcon className="text-muted-foreground size-4" />
            ) : (
              <PlusIcon className="text-muted-foreground size-4" />
            )}
          </button>
          {advanced && (
            <>
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
              <form.AppField name="secure">
                {(field) => <field.SwitchField label="Secure (TLS)" />}
              </form.AppField>
            </>
          )}
          <form.AppForm>
            <form.SubmitButton className="mt-2">Submit</form.SubmitButton>
          </form.AppForm>
        </form>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
