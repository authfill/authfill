import { useThemeListener } from "@hooks/use-theme-listener";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import globals from "@ui/styles/globals.css?url";
import { Toaster } from "@ui/toast";
import Footer from "@web/components/footer";
import Header from "@web/components/header";
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
      <div className="container mx-auto flex min-h-screen flex-col p-5">
        <Header />
        <main className="my-4 flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
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
