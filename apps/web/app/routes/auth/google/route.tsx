import { GoogleOAuthProvider } from "@react-oauth/google";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/google")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.PUBLIC_GOOGLE_CLIENT_ID!}>
      <Outlet />
    </GoogleOAuthProvider>
  );
}
