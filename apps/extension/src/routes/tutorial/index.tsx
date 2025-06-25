import { DemoForm } from "@extension/components/demo-form";
import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { useMemo } from "react";
import browser from "webextension-polyfill";

const steps = [
  {
    title: "Pin the Extension",
    description:
      "We recommend pinning AuthFill to your toolbar so it doesn’t play hide and seek when you need it.",
    body: (
      <img
        src={browser.runtime.getURL("tutorial/pin.gif")}
        className="border-foreground/20 dark:border-3 w-[30rem] rounded-xl"
      />
    ),
  },
  {
    title: "Click to Verify",
    description:
      "Whenever you’re verifying your email, just tap the AuthFill icon in the toolbar. We’ll take it from there.",
    body: (
      <img
        src={browser.runtime.getURL("tutorial/code.gif")}
        className="border-foreground/20 dark:border-3 w-[35rem] rounded-xl"
      />
    ),
  },
  {
    title: "Try the Demo",
    description:
      "Give it a try by filling out the verification code in the demo form below using AuthFill in your toolbar.",
    body: (
      <div className="bg-foreground/10 rounded-xl p-8 dark:bg-[#1d1d1d]">
        <DemoForm />
      </div>
    ),
    skip: true,
  },
];

export const Route = createFileRoute("/tutorial/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    if (!search || !search.step) return {};

    const parsed = Number(search.step);

    if (isNaN(parsed)) return { step: 1 };
    if (parsed < 1) return { step: 1 };
    if (parsed > steps.length) return { step: steps.length };

    return {
      step: parsed,
    };
  },
});

function RouteComponent() {
  useDocumentTitle("Tutorial");

  const search = Route.useSearch();

  const stepNumber = useMemo(() => search.step ?? 1, [search]);
  const step = useMemo(() => steps[stepNumber - 1] ?? steps[0], [stepNumber]);

  return (
    <div className="flex max-w-[90vw] flex-col items-center">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        {step.title}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-center">
        {step.description}
      </p>
      <div className="mt-8">{step.body}</div>
      <div className="mt-8 flex gap-4">
        {stepNumber > 1 ? (
          <Button
            as="link"
            search={{
              step: stepNumber - 1,
            }}
            size="xl"
            variant="secondary"
            className="w-40"
          >
            Go Back
          </Button>
        ) : null}
        {step.skip ? (
          <Button
            as="link"
            href="/tutorial/complete"
            size="xl"
            variant="secondary"
            className="w-40"
          >
            Skip
          </Button>
        ) : (
          <Button
            as="link"
            search={{
              step: stepNumber + 1,
            }}
            size="xl"
            className="w-40"
          >
            Continue
          </Button>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 flex h-1 items-end justify-start">
        <div
          style={{ width: `${(stepNumber / steps.length) * 100}%` }}
          className="bg-foreground h-full transition-all"
        ></div>
      </div>
    </div>
  );
}
