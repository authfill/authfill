import { addAccount } from "@extension/background/accounts";
import { CustomAccount } from "@extension/background/accounts/providers/custom";
import { id } from "@extension/utils/id";
import axios from "axios";

export async function authenticateCustom(data: {
  email: string;
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
}) {
  try {
    const res = await axios.post(
      `${import.meta.env.PUBLIC_PROXY_URL}/imap/test`,
      {
        host: data.host,
        port: data.port,
        user: data.user,
        secure: data.secure,
        password: data.password,
      },
    );

    if (!res.data.success) return { success: false };
  } catch {
    return { success: false };
  }

  await addAccount(
    new CustomAccount({
      id: id("acc"),
      type: "custom",
      email: data.email,
      credentials: {
        type: "IMAP",
        host: data.host,
        port: data.port,
        user: data.user,
        password: data.password,
        secure: data.secure,
      },
    }),
  );

  return { success: true };
}
