import { addAccount, listAccounts } from "@extension/background/accounts";
import { MicroslopAccount } from "@extension/background/accounts/providers/microslop";
import { id } from "@extension/utils/id";
import {
  getStorage,
  setStorage,
  type MicroslopAccountConfig,
} from "@extension/utils/storage";
import browser from "webextension-polyfill";

const AUTHORIZE_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const SCOPES = "Mail.Read offline_access openid email";

function getRedirectUri(): string {
  if (browser.identity?.getRedirectURL) {
    return browser.identity.getRedirectURL();
  }
  return `https://${chrome.runtime.id}.chromiumapp.org/`;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generatePKCE() {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const challenge = base64UrlEncode(digest);
  return { verifier, challenge };
}

/**
 * Called from the popup via message passing. Kicks off the OAuth flow
 * in the background and returns immediately. The popup watches
 * `browser.storage.onChanged` for `microslopAuthResult` to learn the outcome,
 * because Chrome closes the popup when launchWebAuthFlow opens.
 */
export async function authenticateMicroslop(data: {
  email: string;
  clientId: string;
}) {
  const accounts = await listAccounts();
  if (accounts.accounts.find((a) => a.email === data.email)) {
    return { success: false, error: "This email is already connected." };
  }

  // Clear any previous result
  await browser.storage.local.remove("microslopAuthResult");

  // Fire-and-forget — the popup will close when the OAuth window opens
  _runOAuthFlow(data).catch((err) => {
    console.error("[auth.microslop] Unhandled error:", err);
    browser.storage.local.set({
      microslopAuthResult: {
        success: false,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      },
    });
  });

  return { success: true, started: true };
}

async function _runOAuthFlow(data: { email: string; clientId: string }) {
  const redirectUri = getRedirectUri();
  const { verifier, challenge } = await generatePKCE();

  const params = new URLSearchParams({
    client_id: data.clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    login_hint: data.email,
    response_mode: "query",
  });

  const authUrl = `${AUTHORIZE_URL}?${params.toString()}`;

  let responseUrl: string;
  try {
    responseUrl = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });
  } catch {
    await browser.storage.local.set({
      microslopAuthResult: {
        success: false,
        error: "OAuth flow was cancelled or failed.",
      },
    });
    return;
  }

  const responseParams = new URL(responseUrl).searchParams;
  const code = responseParams.get("code");
  const error = responseParams.get("error");

  if (error || !code) {
    await browser.storage.local.set({
      microslopAuthResult: {
        success: false,
        error:
          responseParams.get("error_description") ||
          "Failed to get authorization code.",
      },
    });
    return;
  }

  let tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: data.clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      await browser.storage.local.set({
        microslopAuthResult: {
          success: false,
          error:
            err.error_description || "Failed to exchange authorization code.",
        },
      });
      return;
    }

    tokens = await tokenRes.json();
  } catch {
    await browser.storage.local.set({
      microslopAuthResult: {
        success: false,
        error: "Failed to exchange authorization code.",
      },
    });
    return;
  }

  // Verify access by fetching one message
  try {
    const testRes = await fetch(
      "https://graph.microsoft.com/v1.0/me/messages?$top=1&$select=subject",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!testRes.ok) {
      await browser.storage.local.set({
        microslopAuthResult: {
          success: false,
          error:
            "Token works but cannot access mailbox. Check Mail.Read permission.",
        },
      });
      return;
    }
  } catch {
    await browser.storage.local.set({
      microslopAuthResult: {
        success: false,
        error: "Failed to verify mailbox access.",
      },
    });
    return;
  }

  const config: MicroslopAccountConfig = {
    id: id("acc"),
    type: "microslop",
    email: data.email,
    credentials: {
      type: "OAUTH2",
      clientId: data.clientId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: Date.now() + tokens.expires_in * 1000,
    },
  };

  await addAccount(new MicroslopAccount(config));

  const updatedAccounts = await listAccounts();
  await browser.storage.local.set({
    microslopAuthResult: {
      success: true,
      count: updatedAccounts.accounts.length,
    },
  });
}

export async function refreshMicroslopToken(
  config: MicroslopAccountConfig,
): Promise<MicroslopAccountConfig> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.credentials.clientId,
      grant_type: "refresh_token",
      refresh_token: config.credentials.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed. Re-authentication required.");
  }

  const tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  } = await res.json();

  config.credentials.accessToken = tokens.access_token;
  if (tokens.refresh_token) {
    config.credentials.refreshToken = tokens.refresh_token;
  }
  config.credentials.tokenExpiry = Date.now() + tokens.expires_in * 1000;

  // Persist updated tokens
  const accounts = (await getStorage("accounts")) ?? [];
  const idx = accounts.findIndex((a) => a.id === config.id);
  if (idx !== -1) {
    accounts[idx] = config;
    await setStorage("accounts", accounts);
  }

  return config;
}

export async function getMicroslopAccessToken(
  config: MicroslopAccountConfig,
): Promise<string> {
  if (config.credentials.tokenExpiry > Date.now() + 60_000) {
    return config.credentials.accessToken;
  }
  const updated = await refreshMicroslopToken(config);
  return updated.credentials.accessToken;
}
