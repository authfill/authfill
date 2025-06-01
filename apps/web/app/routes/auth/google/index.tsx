import { scopes } from "@conf/google";
import { useGoogleLogin } from "@react-oauth/google";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/loader";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/google/")({
  component: RouteComponent,
});

function RouteComponent() {
  const login = useGoogleLogin({
    onError: () => {
      toast.error("Something went wrong!");
    },
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: `${import.meta.env.PUBLIC_WEB_URL}/auth/google/callback`,
    scope: scopes.join(" "),
  });

  useEffect(() => {
    setTimeout(() => {
      login();
    }, 1000);
  }, [login]);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <Loader big />
    </div>
  );
}
