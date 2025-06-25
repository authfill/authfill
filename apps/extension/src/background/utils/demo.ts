import { listAccounts } from "@extension/background/accounts";
import { addEmails } from "@extension/background/utils/email";

let otp: string | null = null;

export async function startDemo() {
  if (!otp) otp = generateOTP();

  const formattedOTP = `${otp.split("").slice(0, 3).join("")}-${otp.split("").slice(3).join("")}`;

  setTimeout(async () => {
    const accounts = await listAccounts();
    const account = accounts.accounts[0];
    if (!account) return;

    addEmails(
      [
        {
          from: "hi@authfill.com",
          to: account.email,
          subject: `Your demo code is ${formattedOTP}`,
          text: `Dear ${account.email},\n\nYour demo code is ${formattedOTP}.\n\nBest Regards,\nAuthFill`,
          date: new Date().toISOString(),
          demo: true,
          otp: formattedOTP,
        },
      ],
      account.id,
    );
  }, 1000);

  return {
    code: otp,
  };
}

export function generateOTP() {
  return new Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}
