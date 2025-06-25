import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import "@ui/styles/globals.css";
import { NotFoundPage } from "@web/components/not-found";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";

const history = createHashHistory();
const router = createRouter({
  routeTree,
  history,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("authfill-root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
