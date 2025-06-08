import {
  CircleDollarSignIcon,
  InboxIcon,
  LockIcon,
  MouseIcon,
  ZapIcon,
} from "lucide-react";

const FEATURES = [
  {
    title: "IMAP & Gmail Support",
    description:
      "Connect any email provider - Google OAuth or IMAP. No limits, no tiers.",
    icon: <InboxIcon />,
  },
  {
    title: "Realtime Email Monitoring",
    description:
      "IMAP emails are fetched securely via our hosted proxy using WebSockets + IDLE.",
    icon: <ZapIcon />,
  },
  {
    title: "Zero Data Retention",
    description:
      "We don’t log or store anything. Emails are processed briefly - then gone. Your data stays yours.",
    icon: <LockIcon />,
  },
  {
    title: "One-Click Autofill",
    description:
      "See your latest OTPs or login links with one click. Copy less, log in faster.",
    icon: <MouseIcon />,
  },
  {
    title: "Free Forever",
    description:
      "No subscriptions, trials, or hidden limits. AuthFill is—and always will be—free for everyone.",
    icon: <CircleDollarSignIcon />,
  },
];

export default function Features() {
  return (
    <section className="flex flex-col items-center">
      <h2 className="leading-12 max-w-lg text-center text-4xl font-bold tracking-tight">
        Built for{" "}
        <span className="relative whitespace-nowrap text-amber-500">
          Simplicity.
          <div className="bg-foreground/18 shadow-foreground absolute -inset-x-1.5 inset-y-1 rounded-lg"></div>
        </span>
        <br />
        Backed by{" "}
        <span className="relative whitespace-nowrap text-amber-500">
          Privacy.
          <div className="bg-foreground/18 shadow-foreground absolute -inset-x-1.5 inset-y-1 rounded-lg"></div>
        </span>
      </h2>
      <div className="mx-auto mt-12 mt-4 grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-6">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}
          >
            <Feature {...feature} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function Feature({ title, description, icon }: (typeof FEATURES)[0]) {
  return (
    <div className="bg-foreground/10 flex h-full w-full flex-col items-start justify-start gap-5 rounded-lg p-10">
      <div className="flex items-center gap-5">
        <div className="bg-foreground/10 rounded-lg p-2">{icon}</div>
        <div className="flex items-center gap-5">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      </div>
      <p className="text-foreground/70 text-base font-medium">{description}</p>
    </div>
  );
}
