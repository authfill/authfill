import { useBackground } from "@extension/hooks/use-background";
import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { useAppForm } from "@hooks/use-app-form";
import { createFileRoute } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { InfoIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import browser from "webextension-polyfill";
import { z } from "zod";

export const Route = createFileRoute("/setup/microslop")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email ? String(search.email) : "",
    };
  },
});

function RouteComponent() {
  useDocumentTitle("Connect Microsoft Account");

  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { sendToBackground } = useBackground();

  const redirectUri = useMemo(() => {
    if (typeof browser.identity?.getRedirectURL === "function") {
      return browser.identity.getRedirectURL();
    }
    return `https://${chrome.runtime.id}.chromiumapp.org/`;
  }, []);

  // Listen for auth result from the background script via storage.
  // The popup may close when the OAuth window opens; when reopened,
  // this effect picks up the result.
  useEffect(() => {
    // Check if there's already a result (popup was closed and reopened)
    browser.storage.local.get("microslopAuthResult").then((data) => {
      const result = data.microslopAuthResult as
        | { success: boolean; error?: string; count?: number }
        | undefined;
      if (result) handleAuthResult(result);
    });

    const listener = (
      changes: Record<string, browser.Storage.StorageChange>,
    ) => {
      const result = changes.microslopAuthResult?.newValue as
        | { success: boolean; error?: string; count?: number }
        | undefined;
      if (result) handleAuthResult(result);
    };

    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  function handleAuthResult(result: {
    success: boolean;
    error?: string;
    count?: number;
  }) {
    browser.storage.local.remove("microslopAuthResult");

    if (result.success) {
      toast.success("Successfully connected your Microsoft account!");
      if (result.count === 1) navigate({ to: "/tutorial" });
      else navigate({ to: "/setup/complete" });
    } else {
      toast.error(result.error ?? "Something went wrong! Please try again.");
    }
  }

  const form = useAppForm({
    defaultValues: {
      email: search.email ?? "",
      clientId: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email(),
        clientId: z.string().min(1, "Client ID is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      const res = await sendToBackground("auth.microslop", value);

      if (!res.started) {
        toast.error(res.error ?? "Something went wrong! Please try again.");
        return;
      }

      toast.info("Complete sign-in in the Microsoft popup window.");
    },
  });

  return (
    <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Connect Microsoft Account
      </h1>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Microsoft accounts require OAuth authentication. You'll need to register
        an Azure AD app to connect your account.
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
              placeholder="john.pork@outlook.com"
              type="email"
              disabled
            />
          )}
        </form.AppField>
        <form.AppField name="clientId">
          {(field) => (
            <field.TextField
              label="Application (Client) ID"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          )}
        </form.AppField>
        <Alert variant="info">
          <InfoIcon />
          <AlertTitle>Azure AD App Setup</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <ol className="list-decimal space-y-1 pl-4 text-xs">
              <li>
                Go to{" "}
                <a
                  href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Azure App Registrations
                </a>{" "}
                and create a new app
              </li>
              <li>
                Set the redirect URI (SPA) to:
                <code className="mt-1 block break-all rounded bg-black/10 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
                  {redirectUri}
                </code>
              </li>
              <li>
                Under API permissions, add <strong>Microsoft Graph</strong> →{" "}
                <strong>Mail.Read</strong> (delegated)
              </li>
              <li>Copy the Application (Client) ID and paste it above</li>
            </ol>
          </AlertDescription>
        </Alert>
        <form.AppForm>
          <form.SubmitButton className="mt-2">
            Connect with Microsoft
          </form.SubmitButton>
        </form.AppForm>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Need help?{" "}
        <a
          href="https://authfill.com/microsoft-oauth-setup"
          target="_blank"
          className="text-primary underline"
        >
          Read the full setup guide
        </a>
      </p>
    </div>
  );
}
