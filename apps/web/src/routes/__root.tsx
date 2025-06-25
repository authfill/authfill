import { useThemeListener } from "@hooks/use-theme-listener";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
// @ts-ignore
import globals from "@ui/styles/globals.css?url";
import { Toaster } from "@ui/toast";
import Footer from "@web/components/footer";
import Navigation from "@web/components/navigation";
import type { ReactNode } from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "AuthFill",
      },
    ],
    links: [{ rel: "stylesheet", href: globals }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Navigation />
      <main className="my-4 flex min-h-[calc(100vh-6rem)] flex-col">
        <Outlet />
      </main>
      <Footer />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  useThemeListener();

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
