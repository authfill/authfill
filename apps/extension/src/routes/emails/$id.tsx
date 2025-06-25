import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { useEmail } from "@extension/hooks/use-email";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/loader";
import { useMemo } from "react";
import { Letter } from "react-letter";

export const Route = createFileRoute("/emails/$id")({
  component: RouteComponent,
});

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function RouteComponent() {
  const params = Route.useParams();

  const { email } = useEmail(params.id);

  useDocumentTitle(email?.subject ?? "Email");

  const fromEmail = useMemo(() => {
    if (!email) return "";
    const match = emailRegex.exec(email?.from);
    return match ? match[0] : "";
  }, [email]);

  const toEmail = useMemo(() => {
    if (!email) return "";
    const match = emailRegex.exec(email?.to);
    return match ? match[0] : "";
  }, [email]);

  if (!email) return <Loader />;
  return (
    <div className="w-screen md:w-[45rem]">
      <div className="flex flex-col gap-1">
        <p className="mb-3 text-2xl font-semibold">{email.subject}</p>
        <div className="flex">
          <p className="text-muted-foreground w-16">From:</p>
          <p>{fromEmail}</p>
        </div>
        <div className="flex">
          <p className="text-muted-foreground w-16">To:</p>
          <p>{toEmail}</p>
        </div>
        <div className="flex">
          <p className="text-muted-foreground w-16">Date:</p>
          <p>{new Date(email.date).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-8 w-full overflow-y-auto whitespace-pre rounded-xl border bg-white p-10 text-black dark:border-0">
        <Letter html={email.html ?? ""} text={email.text} className="h-fit" />
      </div>
    </div>
  );
}
