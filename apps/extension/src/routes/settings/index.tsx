import { useBackground } from "@extension/hooks/use-background";
import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { ProxySettings } from "@extension/utils/storage";
import { useAppForm, useStore } from "@hooks/use-app-form";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Settings");

  const { sendToBackground } = useBackground();
  const [loading, setLoading] = useState(true);

  const form = useAppForm({
    defaultValues: {
      enabled: false,
      baseUrl: "",
    },
    validators: {
      onSubmit: z.object({
        enabled: z.boolean(),
        baseUrl: z.string().refine(
          (val) => {
            if (!val) return true;
            try {
              new URL(val);
              return true;
            } catch {
              return false;
            }
          },
          { message: "Invalid URL format" },
        ),
      }),
    },
    onSubmit: async ({ value }) => {
      const settings: ProxySettings = {
        enabled: value.enabled,
        baseUrl: value.baseUrl.replace(/\/$/, ""),
      };

      // Test connection before saving if custom proxy is enabled
      if (settings.enabled && settings.baseUrl) {
        try {
          const result = await sendToBackground("settings.testProxy", {
            baseUrl: settings.baseUrl,
          });
          if (!result?.success) {
            toast.error(result?.error || "Connection failed");
            return;
          }
        } catch {
          toast.error("Connection failed");
          return;
        }
      }

      await sendToBackground("settings.set", settings);
      toast.success("Settings saved successfully");
    },
  });

  const proxyEnabled = useStore(form.store, (state) => state.values.enabled);

  useEffect(() => {
    sendToBackground("settings.get")
      .then((settings: ProxySettings) => {
        if (settings) {
          form.setFieldValue("enabled", settings.enabled);
          form.setFieldValue("baseUrl", settings.baseUrl);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Settings
      </h1>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Configure AuthFill to use a self-hosted proxy server for IMAP
        connections.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="mt-12 flex w-[18rem] flex-col gap-6"
      >
        <form.AppField name="enabled">
          {(field) => <field.SwitchField label="Use Custom Proxy" />}
        </form.AppField>
        {proxyEnabled && (
          <form.AppField name="baseUrl">
            {(field) => (
              <field.TextField
                label="Proxy URL"
                placeholder="https://proxy.example.com"
              />
            )}
          </form.AppField>
        )}
        <form.AppForm>
          <form.SubmitButton className="mt-2">Save Settings</form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
