import { listAccounts } from "@extension/background/accounts";
import { addEmails } from "@extension/background/utils/email";

let code: string | null = null;

export async function startDemo() {
  if (!code) code = generateCode();

  const formattedCode = `${code.split("").slice(0, 3).join("")}-${code.split("").slice(3).join("")}`;

  setTimeout(async () => {
    const accounts = await listAccounts();
    const account = accounts.accounts[0];
    if (!account) return;

    addEmails(
      [
        {
          from: "hi@authfill.com",
          to: account.email,
          subject: `Your demo code is ${formattedCode}`,
          html: `<p>Your demo code is ${formattedCode}</p>`,
          date: new Date().toISOString(),
          demo: true,
          otp: formattedCode,
        },
      ],
      account.id,
    );
  }, 1000);

  return {
    code,
  };
}

export function generateCode() {
  return new Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}
