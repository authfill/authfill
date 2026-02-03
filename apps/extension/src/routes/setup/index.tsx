import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { useAppForm } from "@hooks/use-app-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { xml2js } from "xml-js";
import { z } from "zod";

export const Route = createFileRoute("/setup/")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Connect your email account");

  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email(),
      }),
    },
    onSubmit: async ({ value }) => {
      const host = value.email.split("@")[1];

      const imapConfig = await loadImapConfig(host);

      navigate({
        to: "/setup/custom",
        search: {
          email: value.email,
          ...(imapConfig && {
            host: imapConfig.host,
            port: String(imapConfig.port),
            secure: String(imapConfig.secure),
            ...(imapConfig.emailAsUser && {
              user: value.email,
            }),
          }),
          ...(value.email === "test@authfill.com" && {
            host: "test.authfill.com",
            port: "993",
            secure: "true",
            user: "test@authfill.com",
          }),
        },
      });
    },
  });

  async function loadImapConfig(host: string) {
    try {
      const res = await axios.get(
        `https://autoconfig.thunderbird.net/v1.1/${host}`,
      );
      if (res.status !== 200 || !res.data) return;

      const data = xml2js(res.data, { compact: true }) as {
        clientConfig: {
          emailProvider: {
            incomingServer: {
              hostname: { _text: string };
              port: { _text: string };
              username: { _text: string };
              socketType: { _text: string };
              _attributes: {
                type: string;
              };
            }[];
          };
        };
      };

      const servers = data.clientConfig.emailProvider.incomingServer;

      const imapServer = servers.find(
        (server) => server._attributes.type === "imap",
      );

      if (!imapServer) return;

      return {
        host: imapServer?.hostname._text,
        port: imapServer?.port._text,
        emailAsUser: imapServer?.username._text === "%EMAILADDRESS%",
        secure: imapServer?.socketType._text === "SSL",
      };
    } catch {
      return;
    }
  }

  return (
    <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Connect your email account
      </h1>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        To get started with AuthFill, please connect your email accounts with
        the input shown below.
      </p>
      <div className="mt-12 flex w-full max-w-full flex-col gap-8 sm:max-w-[18rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="flex flex-col gap-4"
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
          <form.AppForm>
            <form.SubmitButton>Connect</form.SubmitButton>
          </form.AppForm>
        </form>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Self-hosting?{" "}
          <Link to="/settings" target="_blank" className="text-primary underline">
            Configure your proxy
          </Link>{" "}
          first.
        </p>
      </div>
    </div>
  );
}
