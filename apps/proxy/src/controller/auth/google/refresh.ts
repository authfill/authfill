import { AppBindings } from "@proxy/index";
import { Handler } from "hono";

export const refreshGoogleToken: Handler<AppBindings, "/auth/google"> = async (
  c,
) => {
  const body = await c.req.json();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: body.refreshToken,
      client_id: c.env.PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as {
    error?: string;
    access_token: string;
    expires_in: number;
  };

  if (data.error)
    return c.json(
      {
        error: data.error,
      },
      400,
    );

  return c.json({
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
};
