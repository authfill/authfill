import { useThemeListener } from "@hooks/use-theme-listener";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@ui/toast";

import "@fontsource/geist/100.css";
import "@fontsource/geist/200.css";
import "@fontsource/geist/300.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist/800.css";
import "@fontsource/geist/900.css";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute<RouterContext>({
  component: RootComponent,
});

function RootComponent() {
  useThemeListener();

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
