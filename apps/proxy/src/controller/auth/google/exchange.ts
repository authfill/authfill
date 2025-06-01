import { Bindings } from "@proxy/index";
import { Handler } from "hono";

export const exchangeGoogleCode: Handler<Bindings, "/auth/google"> = async (
  c,
) => {
  const body = await c.req.json();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: body.code,
      client_id: c.env.PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as {
    error?: string;
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
  };

  if (data.error)
    return c.json(
      {
        error: data.error,
      },
      400,
    );

  // decode the id token
  const payload = JSON.parse(
    Buffer.from(data.id_token.split(".")[1], "base64").toString(),
  );

  return c.json({
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
};
